import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Crown, Clock } from "lucide-react";
import {
  verifyCheckoutPayment,
  loadPendingPayment,
  clearPendingPayment,
  markReferenceUsed,
  isReferenceUsed,
} from "@/lib/fincraPayment";
import {
  addAgent,
  generateAgentId,
  addTransaction,
  getUserByUid,
  updateUser,
  addUser,
  updateAgent,
  getAgentByAgentId,
  updateSharedLink,
} from "@/lib/firebaseServices";
import { useAuth } from "@/contexts/AuthContext";

type Status = "verifying" | "success" | "failed";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 30;

const SUCCESSFUL_STATUSES = ["successful", "success", "completed", "paid"];
const FAILED_STATUSES = ["failed", "cancelled", "canceled", "declined", "error", "reversed"];

const getDeviceId = (): string => {
  let id = localStorage.getItem("luo_device_id");
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("luo_device_id", id);
  }
  return id;
};

const grantAudienceAccess = (shareCode: string, durationMinutes: number) => {
  const key = `luo_access_${shareCode}`;
  localStorage.setItem(key, JSON.stringify({
    deviceId: getDeviceId(),
    expiresAt: Date.now() + durationMinutes * 60 * 1000,
  }));
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [agentId, setAgentId] = useState("");
  const [isAudience, setIsAudience] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [pollAttempt, setPollAttempt] = useState(0);
  const [pollStatus, setPollStatus] = useState("Connecting to payment provider...");
  const stopPolling = useRef(false);

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found. Please contact support.");
      return;
    }

    if (isReferenceUsed(reference)) {
      setStatus("failed");
      setMessage("This payment has already been activated. If you need help, contact support.");
      return;
    }

    let attempt = 0;

    const poll = async () => {
      if (stopPolling.current) return;

      attempt++;
      setPollAttempt(attempt);
      setPollStatus(`Checking payment status... (${attempt}/${MAX_POLL_ATTEMPTS})`);

      let verifyResult;
      try {
        verifyResult = await verifyCheckoutPayment(reference);
      } catch {
        if (attempt >= MAX_POLL_ATTEMPTS) {
          setStatus("failed");
          setMessage(`Could not reach payment provider after ${MAX_POLL_ATTEMPTS} attempts. Contact support with reference: ${reference}`);
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }

      const rawStatus = (verifyResult.status || "").toLowerCase();

      if (SUCCESSFUL_STATUSES.some(s => rawStatus.includes(s))) {
        await activate(reference);
        return;
      }

      if (FAILED_STATUSES.some(s => rawStatus.includes(s))) {
        setStatus("failed");
        setMessage(
          `Payment was ${verifyResult.status}. If this is an error, contact support with reference: ${reference}`
        );
        return;
      }

      if (attempt >= MAX_POLL_ATTEMPTS) {
        setStatus("failed");
        setMessage(
          `Payment is still pending after checking ${MAX_POLL_ATTEMPTS} times. If you completed the payment, contact support with reference: ${reference}`
        );
        return;
      }

      setPollStatus(`Payment pending — checking again in 3 seconds... (${attempt}/${MAX_POLL_ATTEMPTS})`);
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    const activate = async (reference: string) => {
      const pending = loadPendingPayment();
      if (!pending) {
        setStatus("failed");
        setMessage("Payment verified but plan info was lost. Contact support with reference: " + reference);
        return;
      }

      markReferenceUsed(reference);

      try {
        const now = new Date();
        const nowStr = now.toISOString().split("T")[0];

        if (pending.type === "user_subscription") {
          const expiry = new Date(now);
          expiry.setDate(expiry.getDate() + pending.planDays);
          const expiryStr = expiry.toISOString().split("T")[0];

          if (user) {
            const existingDoc = await getUserByUid(user.uid);
            if (existingDoc) {
              await updateUser(existingDoc.id, {
                subscription: pending.planLabel,
                subscriptionExpiry: expiryStr,
                status: "active",
              });
            } else {
              await addUser({
                uid: user.uid,
                email: user.email || pending.userEmail,
                displayName: user.displayName || pending.userName,
                phone: "",
                subscription: pending.planLabel,
                subscriptionExpiry: expiryStr,
                status: "active",
                role: "user",
                createdAt: nowStr,
              });
            }
          }

          await addTransaction({
            userId: pending.userId,
            userName: pending.userName,
            userPhone: "",
            type: "subscription",
            amount: pending.planAmount,
            status: "completed",
            method: "Card/Bank Transfer (Fincra)",
            description: `User ${pending.planLabel} Subscription`,
            fincraRef: reference,
            createdAt: nowStr,
          } as any);
        }

        else if (pending.type === "agent_subscription") {
          const expiry = new Date(now);
          expiry.setDate(expiry.getDate() + pending.planDays);
          const expiryStr = expiry.toISOString().split("T")[0];

          const newAgentId = generateAgentId();
          await addAgent({
            name: pending.userName || pending.userEmail,
            phone: "",
            agentId: newAgentId,
            balance: 0,
            sharedMovies: 0,
            sharedSeries: 0,
            totalEarnings: 0,
            status: "active",
            plan: pending.planLabel,
            planExpiry: expiryStr,
            createdAt: nowStr,
          } as any);

          await addTransaction({
            userId: pending.userId,
            userName: pending.userName,
            userPhone: "",
            type: "subscription",
            amount: pending.planAmount,
            status: "completed",
            method: "Card/Bank Transfer (Fincra)",
            description: `Agent ${pending.planLabel} Plan`,
            fincraRef: reference,
            createdAt: nowStr,
          } as any);

          setAgentId(newAgentId);
        }

        else if (pending.type === "agent_renewal" && pending.agentDocId) {
          const expiry = new Date(now);
          expiry.setDate(expiry.getDate() + pending.planDays);
          const expiryStr = expiry.toISOString().split("T")[0];

          await updateAgent(pending.agentDocId, {
            status: "active",
            planExpiry: expiryStr,
            plan: pending.planLabel,
          });

          await addTransaction({
            userId: pending.agentDocId,
            userName: pending.userName,
            userPhone: "",
            type: "subscription",
            amount: pending.planAmount,
            status: "completed",
            method: "Card/Bank Transfer (Fincra)",
            description: `Agent renewal: ${pending.planLabel}`,
            fincraRef: reference,
            createdAt: nowStr,
          } as any);
        }

        else if (pending.type === "audience_content" && pending.shareCode) {
          await addTransaction({
            userId: pending.userId || "guest",
            userName: pending.userName || "Guest",
            userPhone: "",
            type: "agent-share",
            amount: pending.planAmount,
            status: "completed",
            method: "Card/Bank Transfer (Fincra)",
            description: `Agent sell: ${pending.contentTitle || "Content"}`,
            fincraRef: reference,
            createdAt: nowStr,
          } as any);

          if (pending.contentId) {
            await updateSharedLink(pending.contentId, {
              views: (pending.contentViews || 0) + 1,
              earnings: (pending.contentEarnings || 0) + pending.planAmount,
            });
          }

          if (pending.agentId) {
            try {
              const agent = await getAgentByAgentId(pending.agentId);
              if (agent) {
                await updateAgent(agent.id, {
                  balance: (agent.balance || 0) + pending.planAmount,
                  totalEarnings: (agent.totalEarnings || 0) + pending.planAmount,
                });
              }
            } catch {
              // Non-critical
            }
          }

          if (pending.accessDuration) {
            grantAudienceAccess(pending.shareCode, pending.accessDuration);
          }

          setIsAudience(true);
          setShareCode(pending.shareCode);
        }

        clearPendingPayment();
        setStatus("success");
      } catch (err: any) {
        setStatus("failed");
        setMessage("Payment verified but activation failed: " + (err.message || "Unknown error"));
      }
    };

    poll();

    return () => {
      stopPolling.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    if (isAudience && shareCode) {
      navigate(`/a/${shareCode}?unlocked=1`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
          <Crown className="w-7 h-7 text-accent-foreground" />
        </div>

        {status === "verifying" && (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-foreground font-bold text-lg mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground text-sm mb-3">
              Please wait while we confirm your payment...
            </p>
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">{pollStatus}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((pollAttempt / MAX_POLL_ATTEMPTS) * 100, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-muted-foreground text-[10px] mt-3">
              Do not close this page — we're checking your payment automatically.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-foreground font-bold text-lg mb-2">Payment Successful!</h2>
            {agentId ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Your Agent plan is now active.</p>
                <div className="bg-secondary rounded-xl p-4 my-3">
                  <p className="text-muted-foreground text-xs mb-1">Your Agent ID</p>
                  <p className="text-primary font-bold text-2xl tracking-widest">{agentId}</p>
                  <p className="text-muted-foreground text-[10px] mt-1">
                    Save this — you need it to log in to the Agent Dashboard
                  </p>
                </div>
              </div>
            ) : isAudience ? (
              <p className="text-muted-foreground text-sm">
                Access granted! You can now watch the content.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Your subscription is now active. Enjoy unlimited streaming!
              </p>
            )}
            <button
              onClick={handleContinue}
              className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors mt-5"
            >
              {agentId ? "Done" : isAudience ? "Watch Now" : "Start Watching"}
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h2 className="text-foreground font-bold text-lg mb-2">Verification Failed</h2>
            <p className="text-muted-foreground text-sm mb-5">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
