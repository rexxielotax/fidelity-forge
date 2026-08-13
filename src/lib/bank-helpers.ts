import { supabase } from "@/integrations/supabase/client";

export const TIER_FEES: Record<string, { fee: number; limit: number }> = {
  standard: {
    fee: 2000,
    limit: 5000,
  },
  gold: {
    fee: 5000,
    limit: 15000,
  },
  platinum: {
    fee: 10000,
    limit: 50000,
  },
};

export function reference(prefix = "REF"): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export async function createDepositRequest(params: {
  userId: string;
  accountId: string;
  amount: number;
}) {
  const { userId, accountId, amount } = params;

  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    account_id: accountId,
    direction: "credit",
    category: "deposit",
    amount,
    status: "pending",
    description: "Simulated deposit",
    reference: reference("DEP"),
  });

  if (error) {
    throw error;
  }
}

export function adminSessionConfig() {
  return {
    password: process.env["ADMIN_SESSION_SECRET"]!,
    name: "admin-session",
    maxAge: 60 * 60 * 8,
  };
}