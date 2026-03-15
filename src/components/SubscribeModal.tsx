import { useState, useEffect } from "react";
import { X, Crown, CheckCircle, Loader2, User, ArrowRight, ShieldCheck, Smartphone, CreditCard } from "lucide-react";
import { getUserByUid } from "@/lib/firebaseServices";
import {
  createCheckoutSession,
  savePendingPayment,
} from "@/lib/fincraPayment";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { detectGeo, getCurrencySymbol } from "@/lib/geoDetect";

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "user" | "agent";
}

interface PlanItem {
  id: string;
  label: string;
  price: string;
  priceNum: number;
  duration: string;
  days: number;
}

interface CurrencyPlans {
  normal: PlanItem[];
  agent: PlanItem[];
}

const PLANS_BY_CURRENCY: Record<string, CurrencyPlans> = {
  UGX: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "2,500",  priceNum: 2500,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "4,500",  priceNum: 4500,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "9,000",  priceNum: 9000,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "14,000", priceNum: 14000, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "35,000", priceNum: 35000, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "5,000",  priceNum: 5000,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "22,000", priceNum: 22000, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "45,000", priceNum: 45000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  KES: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "70",   priceNum: 70,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "130",  priceNum: 130, duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "250",  priceNum: 250, duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "380",  priceNum: 380, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "900",  priceNum: 900, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "140",   priceNum: 140,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "600",   priceNum: 600,  duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "1,200", priceNum: 1200, duration: "30 days Agent access",  days: 30 },
    ],
  },
  TZS: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "2,200",  priceNum: 2200,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "4,000",  priceNum: 4000,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "8,000",  priceNum: 8000,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "12,000", priceNum: 12000, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "30,000", priceNum: 30000, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "4,500",  priceNum: 4500,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "20,000", priceNum: 20000, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "40,000", priceNum: 40000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  NGN: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "2,200",  priceNum: 2200,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "4,000",  priceNum: 4000,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "7,500",  priceNum: 7500,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "11,000", priceNum: 11000, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "40,000", priceNum: 40000, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "4,000",  priceNum: 4000,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "18,000", priceNum: 18000, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "50,000", priceNum: 50000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  GHS: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "3",  priceNum: 3,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "5",  priceNum: 5,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "10", priceNum: 10, duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "15", priceNum: 15, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "40", priceNum: 40, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "6",  priceNum: 6,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "25", priceNum: 25, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "60", priceNum: 60, duration: "30 days Agent access",  days: 30 },
    ],
  },
  ZMW: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "2",  priceNum: 2,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "4",  priceNum: 4,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "8",  priceNum: 8,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "12", priceNum: 12, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "35", priceNum: 35, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "4",  priceNum: 4,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "18", priceNum: 18, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "45", priceNum: 45, duration: "30 days Agent access",  days: 30 },
    ],
  },
  ZAR: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "15",  priceNum: 15,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "25",  priceNum: 25,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "50",  priceNum: 50,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "75",  priceNum: 75,  duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "220", priceNum: 220, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "30",  priceNum: 30,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "120", priceNum: 120, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "300", priceNum: 300, duration: "30 days Agent access",  days: 30 },
    ],
  },
  USD: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "1",  priceNum: 1,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "2",  priceNum: 2,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "4",  priceNum: 4,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "6",  priceNum: 6,  duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "12", priceNum: 12, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "2",  priceNum: 2,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "10", priceNum: 10, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "20", priceNum: 20, duration: "30 days Agent access",  days: 30 },
    ],
  },
  EUR: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "1",  priceNum: 1,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "2",  priceNum: 2,  duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "4",  priceNum: 4,  duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "6",  priceNum: 6,  duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "12", priceNum: 12, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "2",  priceNum: 2,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "10", priceNum: 10, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "20", priceNum: 20, duration: "30 days Agent access",  days: 30 },
    ],
  },
  XOF: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "600",   priceNum: 600,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "1,200", priceNum: 1200, duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "2,400", priceNum: 2400, duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "3,600", priceNum: 3600, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "7,200", priceNum: 7200, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "1,200",  priceNum: 1200,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "6,000",  priceNum: 6000,  duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "12,000", priceNum: 12000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  XAF: {
    normal: [
      { id: "1day",    label: "1 Day",    price: "600",   priceNum: 600,  duration: "24 hours access",  days: 1 },
      { id: "2days",   label: "2 Days",   price: "1,200", priceNum: 1200, duration: "2 days access",    days: 2 },
      { id: "1week",   label: "1 Week",   price: "2,400", priceNum: 2400, duration: "7 days access",    days: 7 },
      { id: "2weeks",  label: "2 Weeks",  price: "3,600", priceNum: 3600, duration: "14 days access",   days: 14 },
      { id: "1month",  label: "1 Month",  price: "7,200", priceNum: 7200, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "1,200",  priceNum: 1200,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "6,000",  priceNum: 6000,  duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "12,000", priceNum: 12000, duration: "30 days Agent access",  days: 30 },
    ],
  },
};

const PAYMENT_METHODS_LABEL: Record<string, string> = {
  NGN: "Card, Bank Transfer, Pay Attitude or Virtual Account",
  GHS: "Mobile Money",
  KES: "Mobile Money",
  UGX: "Mobile Money",
  ZMW: "Card or Mobile Money",
  TZS: "Mobile Money",
  ZAR: "Card or EFT",
  USD: "Card or Virtual Account",
  EUR: "Virtual Account",
  XOF: "Mobile Money",
  XAF: "Mobile Money",
};

const PAYMENT_METHODS_API: Record<string, string[]> = {
  NGN: ["card", "bank_transfer"],
  GHS: ["mobile_money"],
  KES: ["mobile_money"],
  UGX: ["mobile_money"],
  ZMW: ["card", "mobile_money"],
  TZS: ["mobile_money"],
  ZAR: ["card", "eft"],
  USD: ["card", "virtual_account"],
  EUR: ["virtual_account"],
  XOF: ["mobile_money"],
  XAF: ["mobile_money"],
};

const DEFAULT_PLANS: CurrencyPlans = PLANS_BY_CURRENCY["USD"];

const getPlansForCurrency = (currency: string): CurrencyPlans => {
  return PLANS_BY_CURRENCY[currency] || DEFAULT_PLANS;
};

const SubscribeModal = ({ open, onClose, mode = "user" }: SubscribeModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plan" | "loading" | "checkout">("plan");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [userDoc, setUserDoc] = useState<any>(null);
  const [currency, setCurrency] = useState("NGN");
  const [currencySymbol, setCurrencySymbol] = useState("₦");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getUserByUid(user.uid).then(doc => {
        setUserDoc(doc);
        if (doc?.currency) {
          setCurrency(doc.currency);
          setCurrencySymbol(doc.currencySymbol || getCurrencySymbol(doc.currency));
        } else {
          detectGeo().then(geo => {
            setCurrency(geo.currency);
            setCurrencySymbol(geo.currencySymbol);
          });
        }
      });
    }
  }, [user]);

  if (!open) return null;

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

  const currencyPlans = getPlansForCurrency(currency);
  const plans = mode === "agent" ? currencyPlans.agent : currencyPlans.normal;
  const paymentMethodLabel = PAYMENT_METHODS_LABEL[currency] || "Card or Bank Transfer";
  const paymentMethodsApi = PAYMENT_METHODS_API[currency] || ["card", "bank_transfer"];
  const isMobileMoney = paymentMethodsApi.includes("mobile_money") && !paymentMethodsApi.includes("card") && !paymentMethodsApi.includes("virtual_account");

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
        currency,
        customerName: user.displayName || user.email || "Customer",
        customerEmail: user.email || "",
        redirectUrl,
        paymentMethods: paymentMethodsApi,
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

  if (step === "checkout" && checkoutUrl) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />
        <div className="relative w-full max-w-lg h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
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

        <div className="relative px-6 pt-6 pb-4 text-center">
          <button onClick={handleClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-5 h-5 text-accent-foreground" />
          </div>
          <h2 className="text-foreground font-bold text-lg">
            {mode === "agent" ? "Agent Plan" : (userDoc?.subscription ? "Renew Subscription" : "Subscribe")}
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            {mode === "agent"
              ? "Get your Agent ID and unlock earnings"
              : (userDoc?.subscription
                  ? `Current: ${userDoc.subscription} · Expires ${userDoc.subscriptionExpiry}`
                  : "Choose a plan and enjoy unlimited content")}
          </p>
        </div>

        {step === "plan" && (
          <div className="px-6 pb-6 space-y-3">
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-0.5">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
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
                      <p className="text-primary text-sm font-bold">{currencySymbol}{plan.price}</p>
                      <p className="text-muted-foreground text-[10px]">{currency}</p>
                    </div>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1">
              {isMobileMoney ? (
                <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-[10px]">Pay via {paymentMethodLabel}</span>
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
