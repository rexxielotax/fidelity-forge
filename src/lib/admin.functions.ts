import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { adminSessionConfig, reference } from "./bank-helpers";

/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

export const adminLogin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());

  await session.update({
    admin: "demo-admin",
  });

  return {
    ok: true,
    email: "demo-admin",
  };
});

/*
|--------------------------------------------------------------------------
| ADMIN LOGOUT
|--------------------------------------------------------------------------
*/

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());

  await session.clear();

  return {
    ok: true,
  };
});

/*
|--------------------------------------------------------------------------
| CURRENT ADMIN
|--------------------------------------------------------------------------
*/

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());

  return {
    email: session.data.admin ?? null,
  };
});

/*
|--------------------------------------------------------------------------
| ADMIN DATA
|--------------------------------------------------------------------------
*/

export const adminData = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());

  if (!session.data.admin) {
    throw new Error("Unauthorized");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [profilesResult, accountsResult, transactionsResult, cardsResult, ticketsResult, actionsResult] =
    await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("accounts").select("*"),
      supabaseAdmin.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
      supabaseAdmin.from("cards").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("admin_actions").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

  if (profilesResult.error) throw new Error(`Unable to load profiles: ${profilesResult.error.message}`);
  if (accountsResult.error) throw new Error(`Unable to load accounts: ${accountsResult.error.message}`);
  if (transactionsResult.error)
    throw new Error(`Unable to load transactions: ${transactionsResult.error.message}`);
  if (cardsResult.error) throw new Error(`Unable to load cards: ${cardsResult.error.message}`);
  if (ticketsResult.error) throw new Error(`Unable to load support tickets: ${ticketsResult.error.message}`);
  if (actionsResult.error) throw new Error(`Unable to load admin actions: ${actionsResult.error.message}`);

  return {
    profiles: profilesResult.data ?? [],
    accounts: accountsResult.data ?? [],
    transactions: transactionsResult.data ?? [],
    cards: cardsResult.data ?? [],
    tickets: ticketsResult.data ?? [],
    actions: actionsResult.data ?? [],
  };
});

/*
|--------------------------------------------------------------------------
| CREDIT ACCOUNT
|--------------------------------------------------------------------------
*/

export const adminCredit = createServerFn({ method: "POST" })
  .validator((data: { userId: string; accountType: "checking" | "savings"; amount: number; note?: string }) => {
    if (!data.userId) throw new Error("Select a user");
    if (data.accountType !== "checking" && data.accountType !== "savings") throw new Error("Invalid account type");

    const amount = Math.round(Number(data.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");

    return { ...data, amount };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, user_id, balance, type")
      .eq("user_id", data.userId)
      .eq("type", data.accountType)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) throw new Error("Account not found");

    const newBalance = Number(account.balance) + data.amount;

    const { error: balanceError } = await supabaseAdmin
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id);

    if (balanceError) throw new Error(balanceError.message);

    const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
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

    if (transactionError) throw new Error(transactionError.message);

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

/*
|--------------------------------------------------------------------------
| SET TRANSACTION STATUS
|--------------------------------------------------------------------------
|
| pending -> completed:
|   credit = adds money, debit = removes money
| completed -> pending/failed/cancelled:
|   reverses the previous balance effect
| Any transition that does not cross the completed boundary
| does not touch the account balance.
|
|--------------------------------------------------------------------------
*/

export const adminSetTransactionStatus = createServerFn({ method: "POST" })
  .validator((data: { transactionId: string; status: "pending" | "completed" | "failed" | "cancelled" }) => {
    if (!data.transactionId) throw new Error("Transaction ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.transactionId)
      .maybeSingle();

    if (txError) throw new Error(txError.message);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status === data.status) return { ok: true, unchanged: true };

    const wasCompleted = tx.status === "completed";
    const nowCompleted = data.status === "completed";

    if (tx.account_id && wasCompleted !== nowCompleted) {
      const { data: account, error: accountError } = await supabaseAdmin
        .from("accounts")
        .select("id, balance")
        .eq("id", tx.account_id)
        .maybeSingle();

      if (accountError) throw new Error(accountError.message);
      if (!account) throw new Error("Account not found");

      const directionMultiplier = tx.direction === "credit" ? 1 : -1;
      const delta = Number(tx.amount) * directionMultiplier * (nowCompleted ? 1 : -1);
      const newBalance = Number(account.balance) + delta;

      if (newBalance < 0) {
        throw new Error("Transaction cannot be completed because the account balance would become negative.");
      }

      const { error: balanceError } = await supabaseAdmin
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (balanceError) throw new Error(balanceError.message);
    }

    const { error: updateError } = await supabaseAdmin
      .from("transactions")
      .update({
        status: data.status,
        completed_at: nowCompleted ? new Date().toISOString() : null,
      })
      .eq("id", tx.id);

    if (updateError) throw new Error(updateError.message);

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
      details: { transactionId: tx.id, previousStatus: tx.status, status: data.status },
    });

    return { ok: true };
  });

/*
|--------------------------------------------------------------------------
| REPLY TO SUPPORT TICKET
|--------------------------------------------------------------------------
*/

export const adminReplyTicket = createServerFn({ method: "POST" })
  .validator((data: { ticketId: string; reply: string; status: "in_progress" | "resolved" }) => {
    if (!data.ticketId) throw new Error("Ticket ID is required");
    if (!data.reply.trim()) throw new Error("Reply cannot be empty");
    return { ...data, reply: data.reply.trim() };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .update({ admin_reply: data.reply, status: data.status })
      .eq("id", data.ticketId)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
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

/*
|--------------------------------------------------------------------------
| SEND PASSWORD RESET
|--------------------------------------------------------------------------
*/

export const adminSendPasswordReset = createServerFn({ method: "POST" })
  .validator((data: { email: string; redirectTo: string }) => {
    if (!data.email.trim()) throw new Error("Email is required");
    if (!data.redirectTo.trim()) throw new Error("Redirect URL is required");
    return { email: data.email.trim(), redirectTo: data.redirectTo.trim() };
  })
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

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
| Never returns card PINs or card secrets.
|--------------------------------------------------------------------------
*/

export const adminGetUser = createServerFn({ method: "POST" })
  .validator((data: { userId: string }) => {
    if (!data.userId) throw new Error("Missing user");
    return data;
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    if (!session.data.admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profileResult, accountsResult, transactionsResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("accounts").select("*").eq("user_id", data.userId).order("type", { ascending: true }),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    if (profileResult.error) throw new Error(profileResult.error.message);
    if (accountsResult.error) throw new Error(accountsResult.error.message);
    if (transactionsResult.error) throw new Error(transactionsResult.error.message);
    if (!profileResult.data) throw new Error("User not found");

    return {
      profile: profileResult.data,
      accounts: accountsResult.data ?? [],
      transactions: transactionsResult.data ?? [],
    };
  });

/*
|--------------------------------------------------------------------------
| UPDATE USER PROFILE
|--------------------------------------------------------------------------
| Email is intentionally excluded because Supabase Auth owns
| the authentication email.
|--------------------------------------------------------------------------
*/

export const adminUpdateUserProfile = createServerFn({ method: "POST" })
  .validator(
    (data: {
      userId: string;
      full_name?: string;
      phone?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      currency?: string;
      date_of_birth?: string | null;
      notify_email?: boolean;
      notify_push?: boolean;
    }) => {
      if (!data.userId) throw new Error("Missing user");
      return data;
    }
  )
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { userId, ...updates } = data;

    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!updated) throw new Error("User not found");

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "update_user_profile",
      target_user_id: userId,
      details: { fields: Object.keys(updates) },
    });

    return updated;
  });

/*
|--------------------------------------------------------------------------
| SET ACCOUNT BALANCE
|--------------------------------------------------------------------------
*/

export const adminSetAccountBalance = createServerFn({ method: "POST" })
  .validator((data: { accountId: string; balance: number; note?: string }) => {
    if (!data.accountId) throw new Error("Account ID is required");

    const balance = Math.round(Number(data.balance) * 100) / 100;
    if (!Number.isFinite(balance) || balance < 0) throw new Error("Enter a valid balance");

    return { ...data, balance };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, user_id, balance, type")
      .eq("id", data.accountId)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) throw new Error("Account not found");

    const oldBalance = Number(account.balance);
    const delta = Math.round((data.balance - oldBalance) * 100) / 100;

    if (delta === 0) return { ok: true, unchanged: true };

    const { error: updateError } = await supabaseAdmin
      .from("accounts")
      .update({ balance: data.balance })
      .eq("id", account.id);

    if (updateError) throw new Error(updateError.message);

    const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
      user_id: account.user_id,
      account_id: account.id,
      direction: delta > 0 ? "credit" : "debit",
      category: "admin_adjustment",
      amount: Math.abs(delta),
      status: "completed",
      description: data.note?.trim() || "Admin balance adjustment",
      reference: reference(),
      completed_at: new Date().toISOString(),
    });

    if (transactionError) throw new Error(transactionError.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: account.user_id,
      type: "transaction",
      title: "Account balance updated",
      message: `Your ${account.type} account balance was adjusted to $${data.balance.toFixed(2)}.`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "set_account_balance",
      target_user_id: account.user_id,
      details: { accountId: account.id, previousBalance: oldBalance, newBalance: data.balance },
    });

    return { ok: true };
  });


  /*
|--------------------------------------------------------------------------
| SET TRANSFER LOCK
|--------------------------------------------------------------------------
*/

export const adminSetTransferLock = createServerFn({ method: "POST" })
  .validator((data: { userId: string; locked: boolean }) => {
    if (!data.userId) throw new Error("Missing user");
    return data;
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update({ transfers_locked: data.locked, updated_at: new Date().toISOString() })
      .eq("id", data.userId)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!updated) throw new Error("User not found");

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: data.locked ? "lock_user_transfers" : "unlock_user_transfers",
      target_user_id: data.userId,
    });

    return updated;
  }); 
/*
|--------------------------------------------------------------------------
| DEPOSIT SETTINGS (admin — auth required)
|--------------------------------------------------------------------------
*/

const DEPOSIT_METHODS = ["paypal", "cashapp", "bank_transfer", "usdt", "btc"] as const;
type DepositMethod = (typeof DEPOSIT_METHODS)[number];

type DepositSettingInput = {
  method: DepositMethod;
  fieldKey: string;
  fieldLabel: string;
  fieldValue: string;
  description?: string;
  notice?: string;
};

const DEFAULT_DEMO_NOTICE =
  "For reference only — this detail is not linked to an active account.";

export const getDepositSettings = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());
  if (!session.data.admin) throw new Error("Unauthorized");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("deposit_settings")
    .select("id, method, field_key, field_label, field_value, description, notice, updated_at")
    .order("method")
    .order("id");

  if (error) throw new Error(`Unable to load deposit settings: ${error.message}`);
  return data ?? [];
});

export const updateDepositSetting = createServerFn({ method: "POST" })
  .validator((data: DepositSettingInput) => {
    if (!DEPOSIT_METHODS.includes(data.method)) throw new Error("Invalid deposit method");
    if (!data.fieldKey.trim()) throw new Error("Field key is required");
    if (!data.fieldLabel.trim()) throw new Error("Field label is required");
    if (data.fieldValue.length > 2000) throw new Error("Field value is too long");

    return {
      ...data,
      fieldKey: data.fieldKey.trim(),
      fieldLabel: data.fieldLabel.trim(),
      description: data.description?.trim() ?? "",
      notice: data.notice?.trim() || DEFAULT_DEMO_NOTICE,
    };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: updated, error } = await supabaseAdmin
      .from("deposit_settings")
      .upsert(
        {
          method: data.method,
          field_key: data.fieldKey,
          field_label: data.fieldLabel,
          field_value: data.fieldValue,
          description: data.description ?? "",
          notice: data.notice,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "method,field_key" }
      )
      .select()
      .single();

    if (error) throw new Error(`Unable to update deposit setting: ${error.message}`);

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "update_deposit_setting",
      details: { method: data.method, fieldKey: data.fieldKey },
    });

    return updated;
  });

/*
|--------------------------------------------------------------------------
| ADMIN CARD REQUESTS
|--------------------------------------------------------------------------
*/

export const adminGetCardRequests = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());
  if (!session.data.admin) throw new Error("Unauthorized");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: requests, error } = await supabaseAdmin
    .from("card_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load card requests: ${error.message}`);

  const userIds = [...new Set((requests ?? []).map((r) => r.user_id))];

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (requests ?? []).map((r) => ({
    ...r,
    profiles: profileMap.get(r.user_id) ?? null,
  }));
});

export const adminApproveCardRequest = createServerFn({ method: "POST" })
  .validator((data: { requestId: string; note?: string }) => {
    if (!data.requestId) throw new Error("Card request ID is required");
    return { requestId: data.requestId, note: data.note?.trim() ?? "" };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request, error: requestError } = await supabaseAdmin
      .from("card_requests")
      .select("*")
      .eq("id", data.requestId)
      .maybeSingle();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("Card request not found");
    if (request.status !== "pending") throw new Error(`This request is already ${request.status}`);

    const { data: updated, error } = await supabaseAdmin
      .from("card_requests")
      .update({ status: "approved", admin_note: data.note || null, updated_at: new Date().toISOString() })
      .eq("id", request.id)
      .eq("status", "pending")
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: request.user_id,
      type: "transaction",
      title: "Card request approved",
      message: `Your ${request.card_type} ${request.delivery_type} card request has been approved.`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "approve_card_request",
      target_user_id: request.user_id,
      details: { requestId: request.id },
    });

    return updated;
  });

export const adminRejectCardRequest = createServerFn({ method: "POST" })
  .validator((data: { requestId: string; note?: string }) => {
    if (!data.requestId) throw new Error("Card request ID is required");
    return { requestId: data.requestId, note: data.note?.trim() ?? "" };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request, error: requestError } = await supabaseAdmin
      .from("card_requests")
      .select("*")
      .eq("id", data.requestId)
      .maybeSingle();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("Card request not found");
    if (request.status !== "pending") throw new Error(`This request is already ${request.status}`);

    const { data: updated, error } = await supabaseAdmin
      .from("card_requests")
      .update({
        status: "rejected",
        admin_note: data.note || "Request rejected by administrator.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id)
      .eq("status", "pending")
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: request.user_id,
      type: "security",
      title: "Card request rejected",
      message: `Your ${request.card_type} ${request.delivery_type} card request was rejected.`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "reject_card_request",
      target_user_id: request.user_id,
      details: { requestId: request.id },
    });

    return updated;
  });
  
  export const adminGetConversations = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ admin?: string }>(adminSessionConfig());
  if (!session.data.admin) throw new Error("Unauthorized");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: messages, error } = await supabaseAdmin
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load conversations: ${error.message}`);

  const byUser = new Map<string, { lastMessage: string; lastAt: string; unread: number }>();
  for (const m of messages ?? []) {
    const existing = byUser.get(m.user_id);
    if (!existing) {
      byUser.set(m.user_id, {
        lastMessage: m.body ?? "[image]",
        lastAt: m.created_at,
        unread: m.sender === "user" && !m.read_by_admin ? 1 : 0,
      });
    } else if (m.sender === "user" && !m.read_by_admin) {
      existing.unread += 1;
    }
  }

  const userIds = [...byUser.keys()];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return userIds
    .map((userId) => ({
      userId,
      profile: profileMap.get(userId) ?? null,
      ...byUser.get(userId)!,
    }))
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
});

export const adminGetConversationMessages = createServerFn({ method: "GET" })
  .validator((data: { userId: string }) => {
    if (!data.userId) throw new Error("User ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    if (!session.data.admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: messages, error } = await supabaseAdmin
      .from("support_messages")
      .select("*")
      .eq("user_id", data.userId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("support_messages")
      .update({ read_by_admin: true })
      .eq("user_id", data.userId)
      .eq("sender", "user")
      .eq("read_by_admin", false);

    return messages ?? [];
  });

export const adminReplyToUser = createServerFn({ method: "POST" })
  .validator((data: { userId: string; body: string; imageUrls?: string[] }) => {
    if (!data.userId) throw new Error("User ID is required");
    if (!data.body?.trim() && !(data.imageUrls?.length)) throw new Error("Message cannot be empty");
    return { userId: data.userId, body: data.body.trim(), imageUrls: data.imageUrls ?? [] };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ admin?: string }>(adminSessionConfig());
    const admin = session.data.admin;
    if (!admin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("support_messages").insert({
      user_id: data.userId,
      sender: "admin",
      body: data.body || null,
      image_urls: data.imageUrls,
      read_by_user: false,
    });

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_actions").insert({
      admin_email: admin,
      action: "reply_support",
      target_user_id: data.userId,
    });

    return { ok: true };
  });