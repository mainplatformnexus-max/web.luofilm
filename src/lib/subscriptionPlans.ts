export interface PlanItem {
  id: string;
  label: string;
  price: string;
  priceNum: number;
  duration: string;
  days: number;
}

export interface CurrencyPlans {
  normal: PlanItem[];
  agent: PlanItem[];
}

export const PLANS_BY_CURRENCY: Record<string, CurrencyPlans> = {
  UGX: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "2,500",  priceNum: 2500,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "4,500",  priceNum: 4500,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "9,000",  priceNum: 9000,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "14,000", priceNum: 14000, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "35,000", priceNum: 35000, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "5,000",  priceNum: 5000,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "22,000", priceNum: 22000, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "45,000", priceNum: 45000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  KES: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "70",  priceNum: 70,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "130", priceNum: 130, duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "250", priceNum: 250, duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "380", priceNum: 380, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "900", priceNum: 900, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "140",   priceNum: 140,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "600",   priceNum: 600,  duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "1,200", priceNum: 1200, duration: "30 days Agent access",  days: 30 },
    ],
  },
  TZS: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "2,200",  priceNum: 2200,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "4,000",  priceNum: 4000,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "8,000",  priceNum: 8000,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "12,000", priceNum: 12000, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "30,000", priceNum: 30000, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "4,500",  priceNum: 4500,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "20,000", priceNum: 20000, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "40,000", priceNum: 40000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  NGN: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "2,200",  priceNum: 2200,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "4,000",  priceNum: 4000,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "7,500",  priceNum: 7500,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "11,000", priceNum: 11000, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "40,000", priceNum: 40000, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "4,000",  priceNum: 4000,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "18,000", priceNum: 18000, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "50,000", priceNum: 50000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  GHS: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "3",  priceNum: 3,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "5",  priceNum: 5,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "10", priceNum: 10, duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "15", priceNum: 15, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "40", priceNum: 40, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "6",  priceNum: 6,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "25", priceNum: 25, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "60", priceNum: 60, duration: "30 days Agent access",  days: 30 },
    ],
  },
  ZMW: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "2",  priceNum: 2,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "4",  priceNum: 4,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "8",  priceNum: 8,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "12", priceNum: 12, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "35", priceNum: 35, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "4",  priceNum: 4,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "18", priceNum: 18, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "45", priceNum: 45, duration: "30 days Agent access",  days: 30 },
    ],
  },
  ZAR: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "15",  priceNum: 15,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "25",  priceNum: 25,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "50",  priceNum: 50,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "75",  priceNum: 75,  duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "220", priceNum: 220, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "30",  priceNum: 30,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "120", priceNum: 120, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "300", priceNum: 300, duration: "30 days Agent access",  days: 30 },
    ],
  },
  USD: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "1",  priceNum: 1,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "2",  priceNum: 2,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "4",  priceNum: 4,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "6",  priceNum: 6,  duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "12", priceNum: 12, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "2",  priceNum: 2,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "10", priceNum: 10, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "20", priceNum: 20, duration: "30 days Agent access",  days: 30 },
    ],
  },
  EUR: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "1",  priceNum: 1,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "2",  priceNum: 2,  duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "4",  priceNum: 4,  duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "6",  priceNum: 6,  duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "12", priceNum: 12, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "2",  priceNum: 2,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "10", priceNum: 10, duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "20", priceNum: 20, duration: "30 days Agent access",  days: 30 },
    ],
  },
  XOF: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "600",   priceNum: 600,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "1,200", priceNum: 1200, duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "2,400", priceNum: 2400, duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "3,600", priceNum: 3600, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "7,200", priceNum: 7200, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "1,200",  priceNum: 1200,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "6,000",  priceNum: 6000,  duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "12,000", priceNum: 12000, duration: "30 days Agent access",  days: 30 },
    ],
  },
  XAF: {
    normal: [
      { id: "1day",   label: "1 Day",   price: "600",   priceNum: 600,  duration: "24 hours access",  days: 1 },
      { id: "2days",  label: "2 Days",  price: "1,200", priceNum: 1200, duration: "2 days access",    days: 2 },
      { id: "1week",  label: "1 Week",  price: "2,400", priceNum: 2400, duration: "7 days access",    days: 7 },
      { id: "2weeks", label: "2 Weeks", price: "3,600", priceNum: 3600, duration: "14 days access",   days: 14 },
      { id: "1month", label: "1 Month", price: "7,200", priceNum: 7200, duration: "30 days access",   days: 30 },
    ],
    agent: [
      { id: "agent-1day",   label: "Agent 1 Day",   price: "1,200",  priceNum: 1200,  duration: "24 hours Agent access", days: 1 },
      { id: "agent-1week",  label: "Agent 1 Week",  price: "6,000",  priceNum: 6000,  duration: "7 days Agent access",   days: 7 },
      { id: "agent-1month", label: "Agent 1 Month", price: "12,000", priceNum: 12000, duration: "30 days Agent access",  days: 30 },
    ],
  },
};

export const PAYMENT_METHODS_LABEL: Record<string, string> = {
  NGN: "Card, Bank Transfer, Pay Attitude or Virtual Account",
  GHS: "Mobile Money",
  KES: "Mobile Money",
  UGX: "Mobile Money",
  ZMW: "Card or Mobile Money",
  TZS: "Mobile Money",
  ZAR: "Card or EFT",
  USD: "Card",
  EUR: "Card",
  XOF: "Mobile Money",
  XAF: "Mobile Money",
};

export const PAYMENT_METHODS_API: Record<string, string[]> = {
  NGN: ["card", "bank_transfer"],
  GHS: ["mobile_money"],
  KES: ["mobile_money"],
  UGX: ["mobile_money"],
  ZMW: ["card", "mobile_money"],
  TZS: ["mobile_money"],
  ZAR: ["card", "eft"],
  USD: ["card"],
  EUR: ["card"],
  XOF: ["mobile_money"],
  XAF: ["mobile_money"],
};

export const getPlansForCurrency = (currency: string): CurrencyPlans => {
  return PLANS_BY_CURRENCY[currency] || PLANS_BY_CURRENCY["USD"];
};

export const getPaymentCurrency = (currency: string): string => {
  if (currency === "EUR") return "USD";
  return currency;
};
