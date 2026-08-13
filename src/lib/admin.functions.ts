import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { adminSessionConfig, reference } from "./bank-helpers";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const email = (process.env["ADMIN_EMAIL"] ?? "").trim().toLowerCase();
    const password = process.env["ADMIN_PASSWORD"] ?? "";
    if (!email || !password) throw new Error("Admin access is not configured");
    if (data.email.trim().toLowerCase() !== email || data.password !== password) {
      throw new Error("Invalid admin credentials");
    }
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    await session.update({ admin: email });
    return { ok: true, email };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());
  await session.clear();
  return { ok: true };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());
  return { email: session.data.admin ?? null };
});

export const adminData = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());
  if (!session.data.admin) throw new Error("Unauthorized");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [profiles, accounts, transactions, cards, tickets, actions] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("accounts").select("*"),
    supabaseAdmin.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
    supabaseAdmin.from("cards").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("support_tickets").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("admin_actions").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    profiles: profiles.data ?? [],
    accounts: accounts.data ?? [],
    transactions: transactions.data ?? [],
    cards: cards.data ?? [],
    tickets: tickets.data ?? [],
    actions: actions.data ?? [],
  };
});

export const adminCredit = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; accountType: "checking" | "savings"; amount: number; note?: string }) => {
    const amount = Math.round(Number(data.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
    return { ...data, amount };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("id, balance")
      .eq("user_id", data.userId)
      .eq("type", data.accountType)
      .maybeSingle();
    if (!account) throw new Error("Account not found");

    await supabaseAdmin
      .from("accounts")
      .update({ balance: Number(account.balance) + data.amount })
      .eq("id", account.id);

    await supabaseAdmin.from("transactions").insert({
      user_id: data.userId,
      account_id: account.id,
      direction: "credit",
      category: "deposit",
      amount: data.amount,
      status: "completed",
      description: data.note?.trim() || "Account funding",
      reference: reference(),
      completed_at: new Date().toISOString(),
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: data.userId,
      type: "transaction",
      title: "Funds received",
      message: `$${data.amount.toFixed(2)} was credited to your ${data.accountType} account.`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "credit_account",
      target_user_id: data.userId,
      details: { amount: data.amount, accountType: data.accountType },
    });

    return { ok: true };
  });

export const adminSetTransactionStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { transactionId: string; status: "pending" | "completed" | "failed" | "cancelled" }) => data)
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.transactionId)
      .maybeSingle();
    if (!tx) throw new Error("Transaction not found");

    const wasCompleted = tx.status === "completed";
    const nowCompleted = data.status === "completed";

    if (tx.account_id && wasCompleted !== nowCompleted) {
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("id, balance")
        .eq("id", tx.account_id)
        .maybeSingle();
      if (account) {
        const delta = Number(tx.amount) * (tx.direction === "credit" ? 1 : -1) * (nowCompleted ? 1 : -1);
        await supabaseAdmin
          .from("accounts")
          .update({ balance: Number(account.balance) + delta })
          .eq("id", account.id);
      }
    }

    await supabaseAdmin
      .from("transactions")
      .update({
        status: data.status,
        completed_at: nowCompleted ? new Date().toISOString() : null,
      })
      .eq("id", tx.id);

    await supabaseAdmin.from("notifications").insert({
      user_id: tx.user_id,
      type: "transaction",
      title: `Transaction ${data.status}`,
      message: `Transaction ${tx.reference} is now marked ${data.status}.`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "set_transaction_status",
      target_user_id: tx.user_id,
      details: { transactionId: tx.id, status: data.status },
    });

    return { ok: true };
  });

export const adminReplyTicket = createServerFn({ method: "POST" })
  .inputValidator((data: { ticketId: string; reply: string; status: "in_progress" | "resolved" }) => data)
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: ticket } = await supabaseAdmin
      .from("support_tickets")
      .update({ admin_reply: data.reply, status: data.status })
      .eq("id", data.ticketId)
      .select("*")
      .maybeSingle();
    if (!ticket) throw new Error("Ticket not found");

    await supabaseAdmin.from("notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: "Support replied",
      message: `We replied to your ticket "${ticket.subject}".`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "reply_ticket",
      target_user_id: ticket.user_id,
      details: { ticketId: ticket.id, status: data.status },
    });

    return { ok: true };
  });

export const adminSendPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; redirectTo: string }) => data)
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo,
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "send_password_reset",
      details: { email: data.email },
    });

    return { ok: true };
  });
