import { useState, useEffect } from "react";
import { X, Crown, CheckCircle, Loader2, User, CreditCard, ArrowRight } from "lucide-react";
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
  const [step, setStep] = useState<"plan" | "redirecting">("plan");
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

    setStep("redirecting");

    try {
      const redirectUrl = `${window.location.origin}/payment-success`;

      // Save pending plan info to localStorage before redirecting
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

      // Redirect to Fincra checkout
      window.location.href = session.checkoutLink;
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
    onClose();
  };

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
              Secured by Fincra · You'll be redirected to complete payment
            </p>
          </div>
        )}

        {/* Redirecting */}
        {step === "redirecting" && (
          <div className="px-6 pb-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-foreground font-bold text-base">Opening Checkout</p>
              <p className="text-muted-foreground text-xs mt-1">
                Preparing your secure payment page...
              </p>
              <p className="text-muted-foreground text-[10px] mt-2">
                You will be redirected to Fincra to complete your payment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribeModal;
