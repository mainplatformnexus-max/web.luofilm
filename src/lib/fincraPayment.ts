const API = "https://function-bun-production-4110.up.railway.app";

export interface CheckoutSessionParams {
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  ok: boolean;
  reference: string;
  checkoutLink: string;
}

export interface VerifyResult {
  ok: boolean;
  status: "successful" | "pending" | "failed" | string;
  amount?: number;
  reference?: string;
}

export const createCheckoutSession = async (
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> => {
  const res = await fetch(`${API}/payments/checkout/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "NGN",
      customer: {
        name: params.customerName,
        email: params.customerEmail,
      },
      redirectUrl: params.redirectUrl,
      paymentMethods: ["card", "bank_transfer"],
      metadata: params.metadata || {},
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.message || "Failed to create checkout session");

  const link = data?.fincra?.data?.link || data?.fincra?.link;
  if (!link) throw new Error("No checkout link returned from payment provider");

  return {
    ok: true,
    reference: data.reference || data?.fincra?.data?.reference || "",
    checkoutLink: link,
  };
};

export const verifyCheckoutPayment = async (
  reference: string
): Promise<VerifyResult> => {
  try {
    const res = await fetch(
      `${API}/payments/checkout/verify/${encodeURIComponent(reference)}`
    );
    const data = await res.json();

    const status =
      data?.fincra?.data?.status ||
      data?.fincra?.status ||
      "unknown";

    return {
      ok: data.ok === true,
      status,
      amount: data?.fincra?.data?.amount,
      reference: data?.fincra?.data?.reference || reference,
    };
  } catch {
    return { ok: false, status: "error" };
  }
};

// ── Pending payment storage (localStorage) ─────────────────────────

export const PENDING_PAYMENT_KEY = "lf_pending_payment";

export type PaymentType = "user_subscription" | "agent_subscription" | "agent_renewal" | "audience_content";

export interface PendingPayment {
  type: PaymentType;
  planId: string;
  planLabel: string;
  planDays: number;
  planAmount: number;
  mode: "user" | "agent";
  userId: string;
  userEmail: string;
  userName: string;
  savedAt: number;
  // For agent_renewal
  agentDocId?: string;
  agentRenewPlan?: string;
  // For audience_content
  shareCode?: string;
  contentTitle?: string;
  contentId?: string;
  agentId?: string;
  agentContentId?: string;
  contentViews?: number;
  contentEarnings?: number;
  accessDuration?: number;
}

export const savePendingPayment = (data: PendingPayment) => {
  localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(data));
};

export const loadPendingPayment = (): PendingPayment | null => {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingPayment;
  } catch {
    return null;
  }
};

export const clearPendingPayment = () => {
  localStorage.removeItem(PENDING_PAYMENT_KEY);
};

export const markReferenceUsed = (reference: string) => {
  localStorage.setItem(`lf_used_ref_${reference}`, "1");
};

export const isReferenceUsed = (reference: string): boolean => {
  return !!localStorage.getItem(`lf_used_ref_${reference}`);
};
