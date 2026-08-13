import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TIER_FEES, reference } from "./bank-helpers";

type TransferInput = {
  accountId: string;
  recipientName: string;
  bank: string;
  accountNumber: string;
  routingNumber?: string;
  description?: string;
  amount: number;
  saveRecipient?: boolean;
};

export const createTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: TransferInput) => {
    if (!data.accountId) throw new Error("Select an account");
    if (!data.recipientName?.trim()) throw new Error("Recipient name is required");
    if (!data.bank?.trim()) throw new Error("Bank name is required");
    if (!data.accountNumber?.trim()) throw new Error("Account number is required");
    const amount = Math.round(Number(data.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
    return { ...data, amount };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: account, error: accErr } = await supabaseAdmin
      .from("accounts")
      .select("id, balance, user_id")
      .eq("id", data.accountId)
      .eq("user_id", userId)
      .maybeSingle();
    if (accErr) throw new Error(accErr.message);
    if (!account) throw new Error("Account not found");
    if (Number(account.balance) < data.amount) throw new Error("Insufficient balance");

    const { data: tx, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        account_id: account.id,
        direction: "debit",
        category: "transfer",
        amount: data.amount,
        status: "pending",
        recipient_name: data.recipientName.trim(),
        recipient_bank: data.bank.trim(),
        recipient_account: data.accountNumber.trim(),
        routing_number: data.routingNumber?.trim() || null,
        description: data.description?.trim() || "Outgoing transfer",
        reference: reference(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (data.saveRecipient) {
      await supabaseAdmin.from("recipients").insert({
        user_id: userId,
        name: data.recipientName.trim(),
        bank: data.bank.trim(),
        account_number: data.accountNumber.trim(),
        routing_number: data.routingNumber?.trim() || null,
      });
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Transfer initiated",
      message: `Your transfer of $${data.amount.toFixed(2)} to ${data.recipientName} is pending.`,
    });

    return tx;
  });

export const finalizeTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { transactionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.transactionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") return tx;

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("id, balance")
      .eq("id", tx.account_id!)
      .maybeSingle();

    if (!account || Number(account.balance) < Number(tx.amount)) {
      const { data: failed } = await supabaseAdmin
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", tx.id)
        .select("*")
        .single();
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        type: "transaction",
        title: "Transfer failed",
        message: `Transfer ${tx.reference} failed due to insufficient funds.`,
      });
      return failed;
    }

    await supabaseAdmin
      .from("accounts")
      .update({ balance: Number(account.balance) - Number(tx.amount) })
      .eq("id", account.id);

    const { data: done } = await supabaseAdmin
      .from("transactions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", tx.id)
      .select("*")
      .single();

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Transfer completed",
      message: `$${Number(tx.amount).toFixed(2)} sent to ${tx.recipient_name}. Ref ${tx.reference}.`,
    });

    return done;
  });

export const requestCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { accountId: string; cardType: string; payWith: string }) => {
    if (!TIER_FEES[data.cardType]) throw new Error("Unknown card type");
    if (!data.accountId) throw new Error("Select a funding account");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const tier = TIER_FEES[data.cardType]!;

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("id, balance")
      .eq("id", data.accountId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!account) throw new Error("Account not found");
    if (Number(account.balance) < tier.fee) {
      throw new Error(`Insufficient balance. The processing fee is $${tier.fee.toLocaleString()}.`);
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .maybeSingle();

    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);
    const expiry = `${String(expiryDate.getMonth() + 1).padStart(2, "0")}/${String(expiryDate.getFullYear()).slice(2)}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));

    await supabaseAdmin
      .from("accounts")
      .update({ balance: Number(account.balance) - tier.fee })
      .eq("id", account.id);

    const { data: card, error } = await supabaseAdmin
      .from("cards")
      .insert({
        user_id: userId,
        account_id: account.id,
        card_type: data.cardType,
        masked_number: `4539 •••• •••• ${last4}`,
        holder_name: (profile?.full_name || profile?.email || "Card Holder").toUpperCase(),
        expiry,
        daily_limit: tier.limit,
        status: "active",
        fee_paid: tier.fee,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("card_secrets").insert({ card_id: card.id, user_id: userId, pin });

    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      account_id: account.id,
      direction: "debit",
      category: "card_fee",
      amount: tier.fee,
      status: "completed",
      description: `${data.cardType} card processing fee (paid with ${data.payWith})`,
      reference: reference(),
      completed_at: new Date().toISOString(),
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Card issued",
      message: `Your ${data.cardType} virtual card ending ${last4} is now active.`,
    });

    return card;
  });

export const setCardStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { cardId: string; status: "active" | "locked" | "lost" | "cancelled" }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: card, error } = await supabaseAdmin
      .from("cards")
      .update({ status: data.status })
      .eq("id", data.cardId)
      .eq("user_id", context.userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!card) throw new Error("Card not found");

    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      type: "security",
      title: "Card updated",
      message: `Card ${card.masked_number} is now ${data.status}.`,
    });
    return card;
  });

export const getCardPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { cardId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: secret } = await supabaseAdmin
      .from("card_secrets")
      .select("pin, user_id")
      .eq("card_id", data.cardId)
      .maybeSingle();
    if (!secret || secret.user_id !== context.userId) throw new Error("Card not found");
    return { pin: secret.pin };
  });

export const notifyEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { type: "transaction" | "security" | "promotion" | "system"; title: string; message: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      type: data.type,
      title: data.title.slice(0, 120),
      message: data.message.slice(0, 400),
    });
    return { ok: true };
  });
