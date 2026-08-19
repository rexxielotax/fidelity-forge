import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TIER_FEES, reference } from "./bank-helpers";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

const TRANSFER_PIN = "2244";

type TransferInput = {
  accountId: string;
  recipientName: string;
  bank: string;
  accountNumber: string;
  routingNumber?: string;
  description?: string;
  amount: number;
  saveRecipient?: boolean;
  pin: string;
};

export type DepositMethod = "paypal" | "cashapp" | "bank_transfer" | "usdt" | "btc";

type DepositInput = {
  accountId: string;
  method: DepositMethod;
  amount: number;
};

const DEPOSIT_METHOD_LABEL: Record<DepositMethod, string> = {
  paypal: "PayPal",
  cashapp: "Cash App",
  bank_transfer: "Bank transfer",
  usdt: "USDT",
  btc: "Bitcoin",
};

/*
|--------------------------------------------------------------------------
| TRANSFERS
|--------------------------------------------------------------------------
*/

export const createTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: TransferInput) => {
    if (!data.accountId) throw new Error("Select an account");
    if (!data.recipientName?.trim()) throw new Error("Recipient name is required");
    if (!data.bank?.trim()) throw new Error("Bank name is required");
    if (!data.accountNumber?.trim()) throw new Error("Account number is required");
    if (!data.pin || data.pin !== TRANSFER_PIN) throw new Error("Incorrect transfer PIN");

    const amount = Math.round(Number(data.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");

    return { ...data, amount };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("transfers_locked")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (profile?.transfers_locked) {
      throw new Error("Transfers are currently disabled on your account. Please contact support.");
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, balance, user_id")
      .eq("id", data.accountId)
      .eq("user_id", userId)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
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
        routing_number: data.routingNumber?.trim() ?? null,
        description: data.description?.trim() ?? "Outgoing transfer",
        reference: reference(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    if (data.saveRecipient) {
      const { error: recipientError } = await supabaseAdmin.from("recipients").insert({
        user_id: userId,
        name: data.recipientName.trim(),
        bank: data.bank.trim(),
        account_number: data.accountNumber.trim(),
        routing_number: data.routingNumber?.trim() ?? null,
      });

      if (recipientError) {
        console.error("Unable to save recipient:", recipientError.message);
      }
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Transfer initiated",
      message: `Your transfer of $${data.amount.toFixed(2)} to ${data.recipientName} is pending.`,
    });

    return tx;
  });

/*
|--------------------------------------------------------------------------
| FINALIZE TRANSFER
|--------------------------------------------------------------------------
*/

export const finalizeTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { transactionId: string }) => {
    if (!data.transactionId) throw new Error("Transaction ID is required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.transactionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (txError) throw new Error(txError.message);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") return tx;
    if (!tx.account_id) throw new Error("Transaction has no funding account");

    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, balance")
      .eq("id", tx.account_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) throw new Error("Account not found");

    if (Number(account.balance) < Number(tx.amount)) {
      const { data: failed, error: failedError } = await supabaseAdmin
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", tx.id)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (failedError) throw new Error(failedError.message);

      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        type: "transaction",
        title: "Transfer failed",
        message: `Transfer ${tx.reference} failed due to insufficient funds.`,
      });

      return failed;
    }

    const newBalance = Number(account.balance) - Number(tx.amount);

    const { error: balanceError } = await supabaseAdmin
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id)
      .eq("user_id", userId);

    if (balanceError) throw new Error(balanceError.message);

    const { data: done, error: doneError } = await supabaseAdmin
      .from("transactions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", tx.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (doneError) throw new Error(doneError.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Transfer completed",
      message: `$${Number(tx.amount).toFixed(2)} sent to ${tx.recipient_name}. Ref ${tx.reference}.`,
    });

    return done;
  });

/*
|--------------------------------------------------------------------------
| DEPOSIT
|--------------------------------------------------------------------------
*/

export const createDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: DepositInput) => {
    if (!data.accountId) throw new Error("Select an account");
    if (!DEPOSIT_METHOD_LABEL[data.method]) throw new Error("Select a deposit method");

    const amount = Math.round(Number(data.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");

    return { ...data, amount };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, balance, user_id")
      .eq("id", data.accountId)
      .eq("user_id", userId)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) throw new Error("Account not found");

    const { data: tx, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        account_id: account.id,
        direction: "credit",
        category: "deposit",
        amount: data.amount,
        status: "pending",
        description: `Simulated deposit via ${DEPOSIT_METHOD_LABEL[data.method]}`,
        reference: reference(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Deposit initiated",
      message: `Your deposit of $${data.amount.toFixed(2)} via ${DEPOSIT_METHOD_LABEL[data.method]} is pending.`,
    });

    return tx;
  });

/*
|--------------------------------------------------------------------------
| FINALIZE DEPOSIT
|--------------------------------------------------------------------------
*/

export const finalizeDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { transactionId: string }) => {
    if (!data.transactionId) throw new Error("Transaction ID is required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.transactionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (txError) throw new Error(txError.message);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") return tx;
    if (!tx.account_id) throw new Error("Transaction has no account");

    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id, balance")
      .eq("id", tx.account_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (accountError) throw new Error(accountError.message);
    if (!account) throw new Error("Account not found");

    const newBalance = Number(account.balance) + Number(tx.amount);

    const { error: balanceError } = await supabaseAdmin
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account.id)
      .eq("user_id", userId);

    if (balanceError) throw new Error(balanceError.message);

    const { data: done, error: doneError } = await supabaseAdmin
      .from("transactions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", tx.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (doneError) throw new Error(doneError.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Deposit completed",
      message: `$${Number(tx.amount).toFixed(2)} has been added to your account. Ref ${tx.reference}.`,
    });

    return done;
  });

/*
|--------------------------------------------------------------------------
| DEPOSIT SETTINGS
|--------------------------------------------------------------------------
*/

const DepositMethodSchema = ["paypal", "cashapp", "bank_transfer", "usdt", "btc"] as const;

type DepositSettingMethod = (typeof DepositMethodSchema)[number];

type DepositSettingInput = {
  method: DepositSettingMethod;
  fieldKey: string;
  fieldLabel: string;
  fieldValue: string;
  description?: string;
  notice?: string;
};

/*
|--------------------------------------------------------------------------
| PUBLIC DEPOSIT SETTINGS
|--------------------------------------------------------------------------
*/

export const getPublicDepositSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("deposit_settings")
    .select("id, method, field_key, field_label, field_value, description, notice")
    .order("method")
    .order("id");

  if (error) throw new Error(`Unable to load deposit settings: ${error.message}`);
  return data ?? [];
});

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE ONE DEPOSIT SETTING
|--------------------------------------------------------------------------
*/

export const updateDepositSetting = createServerFn({ method: "POST" })
  .inputValidator((data: DepositSettingInput) => {
    if (!DepositMethodSchema.includes(data.method)) throw new Error("Invalid deposit method");
    if (!data.fieldKey.trim()) throw new Error("Field key is required");
    if (!data.fieldLabel.trim()) throw new Error("Field label is required");
    if (data.fieldValue.length > 2000) throw new Error("Field value is too long");

    return {
      ...data,
      fieldKey: data.fieldKey.trim(),
      fieldLabel: data.fieldLabel.trim(),
      description: data.description?.trim() ?? "",
      notice: data.notice?.trim() ?? "",
    };
  })
  .handler(async ({ data }) => {
    const { data: updated, error } = await supabaseAdmin
      .from("deposit_settings")
      .upsert(
        {
          method: data.method,
          field_key: data.fieldKey,
          field_label: data.fieldLabel,
          field_value: data.fieldValue,
          description: data.description ?? "",
          notice: data.notice ?? "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "method,field_key" }
      )
      .select()
      .single();

    if (error) throw new Error(`Unable to update deposit setting: ${error.message}`);
    return updated;
  });

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE MULTIPLE DEPOSIT SETTINGS
|--------------------------------------------------------------------------
*/

export const updateDepositSettings = createServerFn({ method: "POST" })
  .inputValidator((data: { settings: DepositSettingInput[] }) => {
    if (!Array.isArray(data.settings)) throw new Error("Invalid settings");
    return data;
  })
  .handler(async ({ data }) => {
    if (data.settings.length === 0) return [];

    const rows = data.settings.map((setting) => {
      if (!DepositMethodSchema.includes(setting.method)) throw new Error("Invalid deposit method");
      if (!setting.fieldKey.trim()) throw new Error("Field key is required");
      if (!setting.fieldLabel.trim()) throw new Error("Field label is required");

      return {
        method: setting.method,
        field_key: setting.fieldKey.trim(),
        field_label: setting.fieldLabel.trim(),
        field_value: setting.fieldValue,
        description: setting.description?.trim() ?? "",
        notice: setting.notice?.trim() ?? "",
        updated_at: new Date().toISOString(),
      };
    });

    const { data: updated, error } = await supabaseAdmin
      .from("deposit_settings")
      .upsert(rows, { onConflict: "method,field_key" })
      .select();

    if (error) throw new Error(`Unable to update deposit settings: ${error.message}`);
    return updated ?? [];
  });

/*
|--------------------------------------------------------------------------
| TIER UPGRADE REQUESTS
|--------------------------------------------------------------------------
*/

type TierUpgradeTarget = "tier2" | "tier3";
type TierUpgradePaymentMethod = "btc" | "usdt" | "ethereum" | "bank_transfer" | "gift_card";

const TIER_UPGRADE_TARGETS = ["tier2", "tier3"] as const;
const TIER_UPGRADE_PAYMENT_METHODS = ["btc", "usdt", "ethereum", "bank_transfer", "gift_card"] as const;

type CreateTierUpgradeInput = {
  requestedTier: TierUpgradeTarget;
  paymentMethod: TierUpgradePaymentMethod;
  giftCardType?: string;
  giftCardImageUrls?: string[];
};

export const createTierUpgradeRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CreateTierUpgradeInput) => {
    if (!TIER_UPGRADE_TARGETS.includes(data.requestedTier)) {
      throw new Error("Invalid tier");
    }
    if (!TIER_UPGRADE_PAYMENT_METHODS.includes(data.paymentMethod)) {
      throw new Error("Invalid payment method");
    }
    if (data.paymentMethod === "gift_card" && !data.giftCardType) {
      throw new Error("Select a gift card type");
    }
    if (data.paymentMethod === "gift_card" && !(data.giftCardImageUrls?.length)) {
      throw new Error("Upload at least one gift card image");
    }
    if ((data.giftCardImageUrls?.length ?? 0) > 20) {
      throw new Error("Maximum 20 images allowed");
    }

    return {
      ...data,
      giftCardType: data.giftCardType?.trim() ?? null,
      giftCardImageUrls: data.giftCardImageUrls ?? [],
    };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("tier")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (profile?.tier === data.requestedTier) {
      throw new Error("You're already on this tier");
    }

    const { TIER_UPGRADE_FEES } = await import("./bank-helpers");
    const feeInfo = TIER_UPGRADE_FEES[data.requestedTier];
    if (!feeInfo) throw new Error("Tier configuration not found");

    const { data: request, error } = await supabaseAdmin
      .from("tier_upgrade_requests")
      .insert({
        user_id: userId,
        requested_tier: data.requestedTier,
        payment_method: data.paymentMethod,
        amount: feeInfo.fee,
        status: "pending",
        gift_card_type: data.giftCardType ?? null,
        gift_card_image_urls: data.giftCardImageUrls,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Tier upgrade requested",
      message: `Your upgrade to ${feeInfo.label} has been submitted for review.`,
    });

    return request;
  });

export const getMyTierRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("tier_upgrade_requests")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

/*
|--------------------------------------------------------------------------
| CARD REQUESTS
|--------------------------------------------------------------------------
*/

type CardRequestTier = "standard" | "gold" | "platinum";
type CardDeliveryType = "online" | "physical";
type CardRequestPaymentMethod = "btc" | "usdt" | "ethereum" | "bank_transfer" | "gift_card";

const CARD_REQUEST_TIERS = ["standard", "gold", "platinum"] as const;
const CARD_DELIVERY_TYPES = ["online", "physical"] as const;
const CARD_REQUEST_PAYMENT_METHODS = ["btc", "usdt", "ethereum", "bank_transfer", "gift_card"] as const;

type CreateCardRequestInput = {
  accountId?: string;
  cardType: CardRequestTier;
  deliveryType: CardDeliveryType;
  paymentMethod: CardRequestPaymentMethod;
  giftCardType?: string;
  giftCardImageUrls?: string[];
};

export const createCardRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CreateCardRequestInput) => {
    if (!CARD_REQUEST_TIERS.includes(data.cardType)) {
      throw new Error("Invalid card type");
    }
    if (!CARD_DELIVERY_TYPES.includes(data.deliveryType)) {
      throw new Error("Invalid card format");
    }
    if (!CARD_REQUEST_PAYMENT_METHODS.includes(data.paymentMethod)) {
      throw new Error("Invalid payment method");
    }
    if (data.paymentMethod === "gift_card" && !data.giftCardType) {
      throw new Error("Select a gift card type");
    }
    if (data.paymentMethod === "gift_card" && !(data.giftCardImageUrls?.length)) {
      throw new Error("Upload at least one gift card image");
    }
    if ((data.giftCardImageUrls?.length ?? 0) > 20) {
      throw new Error("Maximum 20 images allowed");
    }

    return {
      ...data,
      giftCardType: data.giftCardType?.trim() ?? null,
      giftCardImageUrls: data.giftCardImageUrls ?? [],
    };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    if (data.accountId) {
      const { data: account, error: accountError } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("id", data.accountId)
        .eq("user_id", userId)
        .maybeSingle();

      if (accountError) throw new Error(accountError.message);
      if (!account) throw new Error("Account not found");
    }

    const tier = TIER_FEES[data.cardType];
    if (!tier) throw new Error("Card tier configuration not found");

    const { data: request, error } = await supabaseAdmin
      .from("card_requests")
      .insert({
        user_id: userId,
        account_id: data.accountId ?? null,
        card_type: data.cardType,
        delivery_type: data.deliveryType,
        payment_method: data.paymentMethod,
        amount: tier.fee,
        status: "pending",
        gift_card_type: data.giftCardType ?? null,
        gift_card_image_urls: data.giftCardImageUrls,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "transaction",
      title: "Card request submitted",
      message: `Your ${data.cardType} ${data.deliveryType} card request has been submitted for review.`,
    });

    return request;
  });

export const getMyCardRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("card_requests")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

/*
|--------------------------------------------------------------------------
| CARD STATUS
|--------------------------------------------------------------------------
*/

export const setCardStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { cardId: string; status: "active" | "locked" | "lost" | "cancelled" }) => {
    if (!data.cardId) throw new Error("Card ID is required");
    return data;
  })
  .handler(async ({ data, context }) => {
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

/*
|--------------------------------------------------------------------------
| CARD PIN
|--------------------------------------------------------------------------
*/

export const getCardPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { cardId: string }) => {
    if (!data.cardId) throw new Error("Card ID is required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: secret, error } = await supabaseAdmin
      .from("card_secrets")
      .select("pin, user_id")
      .eq("card_id", data.cardId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!secret || secret.user_id !== context.userId) throw new Error("Card not found");

    return { pin: secret.pin };
  });

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const notifyEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { type: "transaction" | "security" | "promotion" | "system"; title: string; message: string }) => {
    if (!data.title.trim()) throw new Error("Notification title is required");
    if (!data.message.trim()) throw new Error("Notification message is required");

    return {
      ...data,
      title: data.title.trim(),
      message: data.message.trim(),
    };
  })
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      type: data.type,
      title: data.title.slice(0, 120),
      message: data.message.slice(0, 400),
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });