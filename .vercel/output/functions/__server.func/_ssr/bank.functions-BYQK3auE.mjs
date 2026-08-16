import { i as createServerFn } from "./server-DzloFYEC.mjs";
import { t as createServerRpc } from "./createServerRpc-Dxa_AegB.mjs";
import { r as reference, t as TIER_FEES } from "./bank-helpers-o8oDwLmo.mjs";
import { t as supabaseAdmin } from "./client.server-KzwUIAkW.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-D13lCX2a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bank.functions-BYQK3auE.js
var DEPOSIT_METHOD_LABEL = {
	paypal: "PayPal",
	cashapp: "Cash App",
	bank_transfer: "Bank transfer",
	usdt: "USDT",
	btc: "Bitcoin"
};
var createTransfer_createServerFn_handler = createServerRpc({
	id: "173af04ab66e0d33667fc5895576900c230e632f2ae29999f57a21b184d5774b",
	name: "createTransfer",
	filename: "src/lib/bank.functions.ts"
}, (opts) => createTransfer.__executeServer(opts));
var createTransfer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.accountId) throw new Error("Select an account");
	if (!data.recipientName?.trim()) throw new Error("Recipient name is required");
	if (!data.bank?.trim()) throw new Error("Bank name is required");
	if (!data.accountNumber?.trim()) throw new Error("Account number is required");
	const amount = Math.round(Number(data.amount) * 100) / 100;
	if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
	return {
		...data,
		amount
	};
}).handler(createTransfer_createServerFn_handler, async ({ data, context }) => {
	const userId = context.userId;
	const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, balance, user_id").eq("id", data.accountId).eq("user_id", userId).maybeSingle();
	if (accountError) throw new Error(accountError.message);
	if (!account) throw new Error("Account not found");
	if (Number(account.balance) < data.amount) throw new Error("Insufficient balance");
	const { data: tx, error } = await supabaseAdmin.from("transactions").insert({
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
		reference: reference()
	}).select("*").single();
	if (error) throw new Error(error.message);
	if (data.saveRecipient) {
		const { error: recipientError } = await supabaseAdmin.from("recipients").insert({
			user_id: userId,
			name: data.recipientName.trim(),
			bank: data.bank.trim(),
			account_number: data.accountNumber.trim(),
			routing_number: data.routingNumber?.trim() ?? null
		});
		if (recipientError) console.error("Unable to save recipient:", recipientError.message);
	}
	await supabaseAdmin.from("notifications").insert({
		user_id: userId,
		type: "transaction",
		title: "Transfer initiated",
		message: `Your transfer of $${data.amount.toFixed(2)} to ${data.recipientName} is pending.`
	});
	return tx;
});
var finalizeTransfer_createServerFn_handler = createServerRpc({
	id: "e5d9dd57d50dba75a0c3da7317d3007b0a485ba3a4001640c9da2c489af2f21d",
	name: "finalizeTransfer",
	filename: "src/lib/bank.functions.ts"
}, (opts) => finalizeTransfer.__executeServer(opts));
var finalizeTransfer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.transactionId) throw new Error("Transaction ID is required");
	return data;
}).handler(finalizeTransfer_createServerFn_handler, async ({ data, context }) => {
	const userId = context.userId;
	const { data: tx, error: txError } = await supabaseAdmin.from("transactions").select("*").eq("id", data.transactionId).eq("user_id", userId).maybeSingle();
	if (txError) throw new Error(txError.message);
	if (!tx) throw new Error("Transaction not found");
	if (tx.status !== "pending") return tx;
	if (!tx.account_id) throw new Error("Transaction has no funding account");
	const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, balance").eq("id", tx.account_id).eq("user_id", userId).maybeSingle();
	if (accountError) throw new Error(accountError.message);
	if (!account) throw new Error("Account not found");
	if (Number(account.balance) < Number(tx.amount)) {
		const { data: failed, error: failedError } = await supabaseAdmin.from("transactions").update({ status: "failed" }).eq("id", tx.id).eq("user_id", userId).select("*").single();
		if (failedError) throw new Error(failedError.message);
		await supabaseAdmin.from("notifications").insert({
			user_id: userId,
			type: "transaction",
			title: "Transfer failed",
			message: `Transfer ${tx.reference} failed due to insufficient funds.`
		});
		return failed;
	}
	const newBalance = Number(account.balance) - Number(tx.amount);
	const { error: balanceError } = await supabaseAdmin.from("accounts").update({ balance: newBalance }).eq("id", account.id).eq("user_id", userId);
	if (balanceError) throw new Error(balanceError.message);
	const { data: done, error: doneError } = await supabaseAdmin.from("transactions").update({
		status: "completed",
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", tx.id).eq("user_id", userId).select("*").single();
	if (doneError) throw new Error(doneError.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: userId,
		type: "transaction",
		title: "Transfer completed",
		message: `$${Number(tx.amount).toFixed(2)} sent to ${tx.recipient_name}. Ref ${tx.reference}.`
	});
	return done;
});
var createDeposit_createServerFn_handler = createServerRpc({
	id: "713e87bb8b34aee9e0dbc270eabb008a0f301e25df60a0e7ab736e0599e4ed9d",
	name: "createDeposit",
	filename: "src/lib/bank.functions.ts"
}, (opts) => createDeposit.__executeServer(opts));
var createDeposit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.accountId) throw new Error("Select an account");
	if (!DEPOSIT_METHOD_LABEL[data.method]) throw new Error("Select a deposit method");
	const amount = Math.round(Number(data.amount) * 100) / 100;
	if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
	return {
		...data,
		amount
	};
}).handler(createDeposit_createServerFn_handler, async ({ data, context }) => {
	const userId = context.userId;
	const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, balance, user_id").eq("id", data.accountId).eq("user_id", userId).maybeSingle();
	if (accountError) throw new Error(accountError.message);
	if (!account) throw new Error("Account not found");
	const { data: tx, error } = await supabaseAdmin.from("transactions").insert({
		user_id: userId,
		account_id: account.id,
		direction: "credit",
		category: "deposit",
		amount: data.amount,
		status: "pending",
		description: `Simulated deposit via ${DEPOSIT_METHOD_LABEL[data.method]}`,
		reference: reference()
	}).select("*").single();
	if (error) throw new Error(error.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: userId,
		type: "transaction",
		title: "Deposit initiated",
		message: `Your deposit of $${data.amount.toFixed(2)} via ${DEPOSIT_METHOD_LABEL[data.method]} is pending.`
	});
	return tx;
});
var finalizeDeposit_createServerFn_handler = createServerRpc({
	id: "0ce005e0fa5bc6f6ede0257657ed7c3a8e48684df51dda4c0a24a74fea0e794c",
	name: "finalizeDeposit",
	filename: "src/lib/bank.functions.ts"
}, (opts) => finalizeDeposit.__executeServer(opts));
var finalizeDeposit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.transactionId) throw new Error("Transaction ID is required");
	return data;
}).handler(finalizeDeposit_createServerFn_handler, async ({ data, context }) => {
	const userId = context.userId;
	const { data: tx, error: txError } = await supabaseAdmin.from("transactions").select("*").eq("id", data.transactionId).eq("user_id", userId).maybeSingle();
	if (txError) throw new Error(txError.message);
	if (!tx) throw new Error("Transaction not found");
	if (tx.status !== "pending") return tx;
	if (!tx.account_id) throw new Error("Transaction has no account");
	const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, balance").eq("id", tx.account_id).eq("user_id", userId).maybeSingle();
	if (accountError) throw new Error(accountError.message);
	if (!account) throw new Error("Account not found");
	const newBalance = Number(account.balance) + Number(tx.amount);
	const { error: balanceError } = await supabaseAdmin.from("accounts").update({ balance: newBalance }).eq("id", account.id).eq("user_id", userId);
	if (balanceError) throw new Error(balanceError.message);
	const { data: done, error: doneError } = await supabaseAdmin.from("transactions").update({
		status: "completed",
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", tx.id).eq("user_id", userId).select("*").single();
	if (doneError) throw new Error(doneError.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: userId,
		type: "transaction",
		title: "Deposit completed",
		message: `$${Number(tx.amount).toFixed(2)} has been added to your account. Ref ${tx.reference}.`
	});
	return done;
});
var DepositMethodSchema = [
	"paypal",
	"cashapp",
	"bank_transfer",
	"usdt",
	"btc"
];
var getPublicDepositSettings_createServerFn_handler = createServerRpc({
	id: "a5c497cca71a9002e3804bb1488e832528a4875ae6fb8be792e58740d3f6bf79",
	name: "getPublicDepositSettings",
	filename: "src/lib/bank.functions.ts"
}, (opts) => getPublicDepositSettings.__executeServer(opts));
var getPublicDepositSettings = createServerFn({ method: "GET" }).handler(getPublicDepositSettings_createServerFn_handler, async () => {
	const { data, error } = await supabaseAdmin.from("deposit_settings").select(`id, method, field_key, field_label, field_value, description, notice`).order("method").order("id");
	if (error) throw new Error(`Unable to load deposit settings: ${error.message}`);
	return data ?? [];
});
var updateDepositSetting_createServerFn_handler = createServerRpc({
	id: "b0dec5853a900307998b946c31255e4ed7e46accd3d789c488bec9224b242efa",
	name: "updateDepositSetting",
	filename: "src/lib/bank.functions.ts"
}, (opts) => updateDepositSetting.__executeServer(opts));
var updateDepositSetting = createServerFn({ method: "POST" }).inputValidator((data) => {
	if (!DepositMethodSchema.includes(data.method)) throw new Error("Invalid deposit method");
	if (!data.fieldKey.trim()) throw new Error("Field key is required");
	if (!data.fieldLabel.trim()) throw new Error("Field label is required");
	if (data.fieldValue.length > 2e3) throw new Error("Field value is too long");
	return {
		...data,
		fieldKey: data.fieldKey.trim(),
		fieldLabel: data.fieldLabel.trim(),
		description: data.description?.trim() ?? "",
		notice: data.notice?.trim() ?? ""
	};
}).handler(updateDepositSetting_createServerFn_handler, async ({ data }) => {
	const { data: updated, error } = await supabaseAdmin.from("deposit_settings").upsert({
		method: data.method,
		field_key: data.fieldKey,
		field_label: data.fieldLabel,
		field_value: data.fieldValue,
		description: data.description ?? "",
		notice: data.notice ?? "",
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "method,field_key" }).select().single();
	if (error) throw new Error(`Unable to update deposit setting: ${error.message}`);
	return updated;
});
var updateDepositSettings_createServerFn_handler = createServerRpc({
	id: "3664a4b521598d21a7a4b4767ee27bd6c08c453eaf0d524d118c60f2400ff3d8",
	name: "updateDepositSettings",
	filename: "src/lib/bank.functions.ts"
}, (opts) => updateDepositSettings.__executeServer(opts));
var updateDepositSettings = createServerFn({ method: "POST" }).inputValidator((data) => {
	if (!Array.isArray(data.settings)) throw new Error("Invalid settings");
	return data;
}).handler(updateDepositSettings_createServerFn_handler, async ({ data }) => {
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
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		};
	});
	const { data: updated, error } = await supabaseAdmin.from("deposit_settings").upsert(rows, { onConflict: "method,field_key" }).select();
	if (error) throw new Error(`Unable to update deposit settings: ${error.message}`);
	return updated ?? [];
});
var CARD_REQUEST_TIERS = [
	"standard",
	"gold",
	"platinum"
];
var CARD_DELIVERY_TYPES = ["online", "physical"];
var CARD_REQUEST_PAYMENT_METHODS = [
	"btc",
	"usdt",
	"ethereum",
	"bank_transfer",
	"gift_card"
];
var createCardRequest_createServerFn_handler = createServerRpc({
	id: "9586d3b9d06b229d0a1f13c3ead7039591c80b280fd97746dea9d8f4c200da20",
	name: "createCardRequest",
	filename: "src/lib/bank.functions.ts"
}, (opts) => createCardRequest.__executeServer(opts));
var createCardRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!CARD_REQUEST_TIERS.includes(data.cardType)) throw new Error("Invalid card type");
	if (!CARD_DELIVERY_TYPES.includes(data.deliveryType)) throw new Error("Invalid card format");
	if (!CARD_REQUEST_PAYMENT_METHODS.includes(data.paymentMethod)) throw new Error("Invalid payment method");
	if (data.paymentMethod === "gift_card" && !data.giftCardType) throw new Error("Select a gift card type");
	if (data.paymentMethod === "gift_card" && !data.giftCardImageUrl) throw new Error("Upload the gift card image");
	return {
		...data,
		giftCardType: data.giftCardType?.trim() || null,
		giftCardImageUrl: data.giftCardImageUrl?.trim() || null
	};
}).handler(createCardRequest_createServerFn_handler, async ({ data, context }) => {
	const userId = context.userId;
	if (data.accountId) {
		const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id").eq("id", data.accountId).eq("user_id", userId).maybeSingle();
		if (accountError) throw new Error(accountError.message);
		if (!account) throw new Error("Account not found");
	}
	const tier = TIER_FEES[data.cardType];
	if (!tier) throw new Error("Card tier configuration not found");
	const { data: request, error } = await supabaseAdmin.from("card_requests").insert({
		user_id: userId,
		account_id: data.accountId ?? null,
		card_type: data.cardType,
		delivery_type: data.deliveryType,
		payment_method: data.paymentMethod,
		amount: tier.fee,
		status: "pending",
		gift_card_type: data.giftCardType ?? null,
		gift_card_image_url: data.giftCardImageUrl ?? null
	}).select("*").single();
	if (error) throw new Error(error.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: userId,
		type: "transaction",
		title: "Card request submitted",
		message: `Your ${data.cardType} ${data.deliveryType} card request has been submitted for review.`
	});
	return request;
});
var getMyCardRequests_createServerFn_handler = createServerRpc({
	id: "26dfd3047dd8e7ac826a6de5ad977b518b8b6ab87619667996f0fb86d338ec3a",
	name: "getMyCardRequests",
	filename: "src/lib/bank.functions.ts"
}, (opts) => getMyCardRequests.__executeServer(opts));
var getMyCardRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyCardRequests_createServerFn_handler, async ({ context }) => {
	const { data, error } = await supabaseAdmin.from("card_requests").select("*").eq("user_id", context.userId).order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var setCardStatus_createServerFn_handler = createServerRpc({
	id: "8c8feedb28dc96277bd769d513fb25321772feda2e5739540c980ba25b82cedc",
	name: "setCardStatus",
	filename: "src/lib/bank.functions.ts"
}, (opts) => setCardStatus.__executeServer(opts));
var setCardStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.cardId) throw new Error("Card ID is required");
	return data;
}).handler(setCardStatus_createServerFn_handler, async ({ data, context }) => {
	const { data: card, error } = await supabaseAdmin.from("cards").update({ status: data.status }).eq("id", data.cardId).eq("user_id", context.userId).select("*").maybeSingle();
	if (error) throw new Error(error.message);
	if (!card) throw new Error("Card not found");
	await supabaseAdmin.from("notifications").insert({
		user_id: context.userId,
		type: "security",
		title: "Card updated",
		message: `Card ${card.masked_number} is now ${data.status}.`
	});
	return card;
});
var getCardPin_createServerFn_handler = createServerRpc({
	id: "c8d01a2be0ee1a990fe9306d95efaceceb530c945ce03b39eba0a7e51bc78ab2",
	name: "getCardPin",
	filename: "src/lib/bank.functions.ts"
}, (opts) => getCardPin.__executeServer(opts));
var getCardPin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.cardId) throw new Error("Card ID is required");
	return data;
}).handler(getCardPin_createServerFn_handler, async ({ data, context }) => {
	const { data: secret, error } = await supabaseAdmin.from("card_secrets").select("pin, user_id").eq("card_id", data.cardId).maybeSingle();
	if (error) throw new Error(error.message);
	if (!secret || secret.user_id !== context.userId) throw new Error("Card not found");
	return { pin: secret.pin };
});
var notifyEvent_createServerFn_handler = createServerRpc({
	id: "dc3ccead35e551327183d6beb73f0ca3388239bc1f28358810b7e24ca6c0a19a",
	name: "notifyEvent",
	filename: "src/lib/bank.functions.ts"
}, (opts) => notifyEvent.__executeServer(opts));
var notifyEvent = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.title.trim()) throw new Error("Notification title is required");
	if (!data.message.trim()) throw new Error("Notification message is required");
	return {
		...data,
		title: data.title.trim(),
		message: data.message.trim()
	};
}).handler(notifyEvent_createServerFn_handler, async ({ data, context }) => {
	const { error } = await supabaseAdmin.from("notifications").insert({
		user_id: context.userId,
		type: data.type,
		title: data.title.slice(0, 120),
		message: data.message.slice(0, 400)
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { createCardRequest_createServerFn_handler, createDeposit_createServerFn_handler, createTransfer_createServerFn_handler, finalizeDeposit_createServerFn_handler, finalizeTransfer_createServerFn_handler, getCardPin_createServerFn_handler, getMyCardRequests_createServerFn_handler, getPublicDepositSettings_createServerFn_handler, notifyEvent_createServerFn_handler, setCardStatus_createServerFn_handler, updateDepositSetting_createServerFn_handler, updateDepositSettings_createServerFn_handler };
