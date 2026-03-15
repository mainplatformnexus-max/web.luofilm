import { useState, useEffect } from "react";
import { X, Crown, CheckCircle, Loader2, User, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { getUserByUid } from "@/lib/firebaseServices";
import {
  createCheckoutSession,
  savePendingPayment,
} from "@/lib/fincraPayment";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "user" | "agent";
}

const userPlans = [
  { id: "1day",   label: "1 Day",   price: "500",    priceNum: 500,   duration: "24 hours access",  days: 1 },
  { id: "3days",  label: "3 Days",  price: "1,000",  priceNum: 1000,  duration: "3 days access",    days: 3 },
  { id: "1week",  label: "1 Week",  price: "2,000",  priceNum: 2000,  duration: "7 days access",    days: 7 },
  { id: "1month", label: "1 Month", price: "5,000",  priceNum: 5000,  duration: "30 days access",   days: 30 },
];

const agentPlans = [
  { id: "agent-1day",   label: "1 Day",   price: "1,000",  priceNum: 1000,  duration: "24 hours Agent access", days: 1 },
  { id: "agent-1week",  label: "1 Week",  price: "4,000",  priceNum: 4000,  duration: "7 days Agent access",   days: 7 },
  { id: "agent-1month", label: "1 Month", price: "10,000", priceNum: 10000, duration: "30 days Agent access",  days: 30 },
];

const SubscribeModal = ({ open, onClose, mode = "user" }: SubscribeModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plan" | "loading" | "checkout">("plan");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [userDoc, setUserDoc] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getUserByUid(user.uid).then(doc => setUserDoc(doc));
    }
  }, [user]);

  if (!open) return null;

  // Not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in-95 fade-in duration-200">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-accent-foreground" />
          </div>
          <h2 className="text-foreground font-bold text-lg mb-2">Login Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please log in to your account before subscribing so we can link the plan to your profile.
          </p>
          <button
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent("open-login-modal"));
            }}
            className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const plans = mode === "agent" ? agentPlans : userPlans;

  const handlePay = async () => {
    if (!selectedPlan) return;

    const planInfo = plans.find(p => p.id === selectedPlan);
    if (!planInfo) return;

    setStep("loading");

    try {
      const redirectUrl = `${window.location.origin}/payment-success`;

      savePendingPayment({
        type: mode === "agent" ? "agent_subscription" : "user_subscription",
        planId: planInfo.id,
        planLabel: planInfo.label,
        planDays: planInfo.days,
        planAmount: planInfo.priceNum,
        mode,
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || user.email || "Customer",
        savedAt: Date.now(),
      });

      const session = await createCheckoutSession({
        amount: planInfo.priceNum,
        currency: "NGN",
        customerName: user.displayName || user.email || "Customer",
        customerEmail: user.email || "",
        redirectUrl,
        metadata: {
          planId: planInfo.id,
          userId: user.uid,
          mode,
        },
      });

      setCheckoutUrl(session.checkoutLink);
      setStep("checkout");
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "Could not start payment. Please try again.",
        variant: "destructive",
      });
      setStep("plan");
    }
  };

  const handleClose = () => {
    setStep("plan");
    setSelectedPlan(null);
    setCheckoutUrl("");
    onClose();
  };

  const handleBackToPlan = () => {
    setStep("plan");
    setCheckoutUrl("");
  };

  // Checkout iframe modal
  if (step === "checkout" && checkoutUrl) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />
        <div className="relative w-full max-w-lg h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
          {/* Checkout modal header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/95 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold leading-tight">Secure Checkout</p>
                <p className="text-muted-foreground text-[10px] leading-tight">Powered by Fincra</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToPlan}
                className="text-muted-foreground hover:text-foreground text-xs transition-colors px-2 py-1 rounded-md hover:bg-secondary"
              >
                ← Change Plan
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading overlay inside iframe area */}
          <div className="relative flex-1 bg-background">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <Loader2 className="w-7 h-7 text-primary animate-spin opacity-60" />
              <p className="text-muted-foreground text-xs">Loading payment page...</p>
            </div>
            <iframe
              src={checkoutUrl}
              className="relative z-20 w-full h-full border-0 bg-transparent"
              title="Fincra Checkout"
              allow="payment"
            />
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-border bg-card/95 shrink-0 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground text-[10px]">256-bit SSL encrypted · Your payment is safe and secure</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center">
          <button onClick={handleClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-5 h-5 text-accent-foreground" />
          </div>
          <h2 className="text-foreground font-bold text-lg">
            {mode === "agent" ? "Agent 1X Plan" : (userDoc?.subscription ? "Renew Subscription" : "Subscribe")}
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            {mode === "agent"
              ? "Get your Agent ID and unlock earnings"
              : (userDoc?.subscription
                  ? `Current: ${userDoc.subscription} · Expires ${userDoc.subscriptionExpiry}`
                  : "Choose a plan and enjoy unlimited content")}
          </p>
        </div>

        {/* Plan selection */}
        {step === "plan" && (
          <div className="px-6 pb-6 space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary hover:border-muted-foreground/30"
                }`}
              >
                <div className="text-left">
                  <p className="text-foreground text-sm font-semibold">{plan.label}</p>
                  <p className="text-muted-foreground text-[11px]">{plan.duration}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-primary text-sm font-bold">₦{plan.price}</p>
                    <p className="text-muted-foreground text-[10px]">NGN</p>
                  </div>
                  {selectedPlan === plan.id && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
              </button>
            ))}

            {/* Payment method badge */}
            <div className="flex items-center justify-center gap-2 py-1">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-[10px]">Pay securely with Card or Bank Transfer</span>
            </div>

            <button
              disabled={!selectedPlan}
              onClick={handlePay}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[10px] text-muted-foreground">
              Secured by Fincra · Payment opens in a secure window
            </p>
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="px-6 pb-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-foreground font-bold text-base">Preparing Checkout</p>
              <p className="text-muted-foreground text-xs mt-1">
                Setting up your secure payment session...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribeModal;
