import { i as createServerFn, l as useSession$1 } from "./server-DzloFYEC.mjs";
import { t as createServerRpc } from "./createServerRpc-Dxa_AegB.mjs";
import { n as adminSessionConfig, r as reference } from "./bank-helpers-o8oDwLmo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-p2N5JX_K.js
var adminLogin_createServerFn_handler = createServerRpc({
	id: "89f029f4fc21ed092423cd54f44fb61078423691288a3a89663a6e0973cd86ea",
	name: "adminLogin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminLogin.__executeServer(opts));
var adminLogin = createServerFn({ method: "POST" }).handler(adminLogin_createServerFn_handler, async () => {
	await (await useSession$1(adminSessionConfig())).update({ admin: "demo-admin" });
	return {
		ok: true,
		email: "demo-admin"
	};
});
var adminLogout_createServerFn_handler = createServerRpc({
	id: "b778199f0067dc3af0626a35537d9640eabb3a694e5f097e062cd440c74c2c03",
	name: "adminLogout",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminLogout.__executeServer(opts));
var adminLogout = createServerFn({ method: "POST" }).handler(adminLogout_createServerFn_handler, async () => {
	await (await useSession$1(adminSessionConfig())).clear();
	return { ok: true };
});
var adminMe_createServerFn_handler = createServerRpc({
	id: "de6c17ff3f303443a6e757a43fad4d339c0557719bb7e7298fa4c78a43322642",
	name: "adminMe",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminMe.__executeServer(opts));
var adminMe = createServerFn({ method: "GET" }).handler(adminMe_createServerFn_handler, async () => {
	return { email: (await useSession$1(adminSessionConfig())).data.admin ?? null };
});
var adminData_createServerFn_handler = createServerRpc({
	id: "41be4fade9b24c6efb697f61a1bc0b5a7e0c821bc6a0ce818b5c05cb9b063eba",
	name: "adminData",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminData.__executeServer(opts));
var adminData = createServerFn({ method: "GET" }).handler(adminData_createServerFn_handler, async () => {
	if (!(await useSession$1(adminSessionConfig())).data.admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const [profilesResult, accountsResult, transactionsResult, cardsResult, ticketsResult, actionsResult] = await Promise.all([
		supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
		supabaseAdmin.from("accounts").select("*"),
		supabaseAdmin.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
		supabaseAdmin.from("cards").select("*").order("created_at", { ascending: false }),
		supabaseAdmin.from("support_tickets").select("*").order("created_at", { ascending: false }),
		supabaseAdmin.from("admin_actions").select("*").order("created_at", { ascending: false }).limit(50)
	]);
	if (profilesResult.error) throw new Error(`Unable to load profiles: ${profilesResult.error.message}`);
	if (accountsResult.error) throw new Error(`Unable to load accounts: ${accountsResult.error.message}`);
	if (transactionsResult.error) throw new Error(`Unable to load transactions: ${transactionsResult.error.message}`);
	if (cardsResult.error) throw new Error(`Unable to load cards: ${cardsResult.error.message}`);
	if (ticketsResult.error) throw new Error(`Unable to load support tickets: ${ticketsResult.error.message}`);
	if (actionsResult.error) throw new Error(`Unable to load admin actions: ${actionsResult.error.message}`);
	return {
		profiles: profilesResult.data ?? [],
		accounts: accountsResult.data ?? [],
		transactions: transactionsResult.data ?? [],
		cards: cardsResult.data ?? [],
		tickets: ticketsResult.data ?? [],
		actions: actionsResult.data ?? []
	};
});
var adminCredit_createServerFn_handler = createServerRpc({
	id: "33400c8bce68bb01ab9f0e19f010f5bf6b661d2406da74901644800bf54cb642",
	name: "adminCredit",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCredit.__executeServer(opts));
var adminCredit = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.userId) throw new Error("Select a user");
	if (data.accountType !== "checking" && data.accountType !== "savings") throw new Error("Invalid account type");
	const amount = Math.round(Number(data.amount) * 100) / 100;
	if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
	return {
		...data,
		amount
	};
}).handler(adminCredit_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, user_id, balance, type").eq("user_id", data.userId).eq("type", data.accountType).maybeSingle();
	if (accountError) throw new Error(accountError.message);
	if (!account) throw new Error("Account not found");
	const newBalance = Number(account.balance) + data.amount;
	const { error: balanceError } = await supabaseAdmin.from("accounts").update({ balance: newBalance }).eq("id", account.id);
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
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (transactionError) throw new Error(transactionError.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: data.userId,
		type: "transaction",
		title: "Funds received",
		message: `$${data.amount.toFixed(2)} was credited to your ${data.accountType} account.`
	});
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "credit_account",
		target_user_id: data.userId,
		details: {
			amount: data.amount,
			accountType: data.accountType
		}
	});
	return { ok: true };
});
var adminSetTransactionStatus_createServerFn_handler = createServerRpc({
	id: "e1e897de683d00bc65411eada133c4d28e32041af52117a57be8e880a4f73fb8",
	name: "adminSetTransactionStatus",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetTransactionStatus.__executeServer(opts));
var adminSetTransactionStatus = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.transactionId) throw new Error("Transaction ID is required");
	return data;
}).handler(adminSetTransactionStatus_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: tx, error: txError } = await supabaseAdmin.from("transactions").select("*").eq("id", data.transactionId).maybeSingle();
	if (txError) throw new Error(txError.message);
	if (!tx) throw new Error("Transaction not found");
	if (tx.status === data.status) return {
		ok: true,
		unchanged: true
	};
	const wasCompleted = tx.status === "completed";
	const nowCompleted = data.status === "completed";
	if (tx.account_id && wasCompleted !== nowCompleted) {
		const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, balance").eq("id", tx.account_id).maybeSingle();
		if (accountError) throw new Error(accountError.message);
		if (!account) throw new Error("Account not found");
		const directionMultiplier = tx.direction === "credit" ? 1 : -1;
		const delta = Number(tx.amount) * directionMultiplier * (nowCompleted ? 1 : -1);
		const newBalance = Number(account.balance) + delta;
		if (newBalance < 0) throw new Error("Transaction cannot be completed because the account balance would become negative.");
		const { error: balanceError } = await supabaseAdmin.from("accounts").update({ balance: newBalance }).eq("id", account.id);
		if (balanceError) throw new Error(balanceError.message);
	}
	const { error: updateError } = await supabaseAdmin.from("transactions").update({
		status: data.status,
		completed_at: nowCompleted ? (/* @__PURE__ */ new Date()).toISOString() : null
	}).eq("id", tx.id);
	if (updateError) throw new Error(updateError.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: tx.user_id,
		type: "transaction",
		title: `Transaction ${data.status}`,
		message: `Transaction ${tx.reference} is now marked ${data.status}.`
	});
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "set_transaction_status",
		target_user_id: tx.user_id,
		details: {
			transactionId: tx.id,
			previousStatus: tx.status,
			status: data.status
		}
	});
	return { ok: true };
});
var adminReplyTicket_createServerFn_handler = createServerRpc({
	id: "44707153ce010fc3d8f5c02f5cdf89791a7987dccc3931a1d906212440450d68",
	name: "adminReplyTicket",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminReplyTicket.__executeServer(opts));
var adminReplyTicket = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.ticketId) throw new Error("Ticket ID is required");
	if (!data.reply.trim()) throw new Error("Reply cannot be empty");
	return {
		...data,
		reply: data.reply.trim()
	};
}).handler(adminReplyTicket_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: ticket, error } = await supabaseAdmin.from("support_tickets").update({
		admin_reply: data.reply,
		status: data.status
	}).eq("id", data.ticketId).select("*").maybeSingle();
	if (error) throw new Error(error.message);
	if (!ticket) throw new Error("Ticket not found");
	await supabaseAdmin.from("notifications").insert({
		user_id: ticket.user_id,
		type: "system",
		title: "Support replied",
		message: `We replied to your ticket "${ticket.subject}".`
	});
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "reply_ticket",
		target_user_id: ticket.user_id,
		details: {
			ticketId: ticket.id,
			status: data.status
		}
	});
	return { ok: true };
});
var adminSendPasswordReset_createServerFn_handler = createServerRpc({
	id: "19deeb714eecb76d7a8ad0ed60f6c8b1054721bc6384c2a0694957c8620a3d77",
	name: "adminSendPasswordReset",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSendPasswordReset.__executeServer(opts));
var adminSendPasswordReset = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.email.trim()) throw new Error("Email is required");
	if (!data.redirectTo.trim()) throw new Error("Redirect URL is required");
	return {
		email: data.email.trim(),
		redirectTo: data.redirectTo.trim()
	};
}).handler(adminSendPasswordReset_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, { redirectTo: data.redirectTo });
	if (error) throw new Error(error.message);
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "send_password_reset",
		details: { email: data.email }
	});
	return { ok: true };
});
var adminGetUser_createServerFn_handler = createServerRpc({
	id: "8dcdbd38b0b91b95816133c8a21b49e13708d01ef7fcba97b10230f0512af20f",
	name: "adminGetUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetUser.__executeServer(opts));
var adminGetUser = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.userId) throw new Error("Missing user");
	return data;
}).handler(adminGetUser_createServerFn_handler, async ({ data }) => {
	if (!(await useSession$1(adminSessionConfig())).data.admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const [profileResult, accountsResult, transactionsResult] = await Promise.all([
		supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
		supabaseAdmin.from("accounts").select("*").eq("user_id", data.userId).order("type", { ascending: true }),
		supabaseAdmin.from("transactions").select("*").eq("user_id", data.userId).order("created_at", { ascending: false }).limit(15)
	]);
	if (profileResult.error) throw new Error(profileResult.error.message);
	if (accountsResult.error) throw new Error(accountsResult.error.message);
	if (transactionsResult.error) throw new Error(transactionsResult.error.message);
	if (!profileResult.data) throw new Error("User not found");
	return {
		profile: profileResult.data,
		accounts: accountsResult.data ?? [],
		transactions: transactionsResult.data ?? []
	};
});
var adminUpdateUserProfile_createServerFn_handler = createServerRpc({
	id: "38f5f1ada3c4c7c6862e468b356bf92f295e1e57598352d937252460f6d4e20b",
	name: "adminUpdateUserProfile",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateUserProfile.__executeServer(opts));
var adminUpdateUserProfile = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.userId) throw new Error("Missing user");
	return data;
}).handler(adminUpdateUserProfile_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { userId, ...updates } = data;
	const { data: updated, error } = await supabaseAdmin.from("profiles").update({
		...updates,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", userId).select("*").maybeSingle();
	if (error) throw new Error(error.message);
	if (!updated) throw new Error("User not found");
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "update_user_profile",
		target_user_id: userId,
		details: { fields: Object.keys(updates) }
	});
	return updated;
});
var adminSetAccountBalance_createServerFn_handler = createServerRpc({
	id: "40e5d8b9a0829abac4ac84741e2ec1ce87ed809298770970a35317cbe0d568bf",
	name: "adminSetAccountBalance",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetAccountBalance.__executeServer(opts));
var adminSetAccountBalance = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.accountId) throw new Error("Account ID is required");
	const balance = Math.round(Number(data.balance) * 100) / 100;
	if (!Number.isFinite(balance) || balance < 0) throw new Error("Enter a valid balance");
	return {
		...data,
		balance
	};
}).handler(adminSetAccountBalance_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: account, error: accountError } = await supabaseAdmin.from("accounts").select("id, user_id, balance, type").eq("id", data.accountId).maybeSingle();
	if (accountError) throw new Error(accountError.message);
	if (!account) throw new Error("Account not found");
	const oldBalance = Number(account.balance);
	const delta = Math.round((data.balance - oldBalance) * 100) / 100;
	if (delta === 0) return {
		ok: true,
		unchanged: true
	};
	const { error: updateError } = await supabaseAdmin.from("accounts").update({ balance: data.balance }).eq("id", account.id);
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
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (transactionError) throw new Error(transactionError.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: account.user_id,
		type: "transaction",
		title: "Account balance updated",
		message: `Your ${account.type} account balance was adjusted to $${data.balance.toFixed(2)}.`
	});
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "set_account_balance",
		target_user_id: account.user_id,
		details: {
			accountId: account.id,
			previousBalance: oldBalance,
			newBalance: data.balance
		}
	});
	return { ok: true };
});
var DEPOSIT_METHODS = [
	"paypal",
	"cashapp",
	"bank_transfer",
	"usdt",
	"btc"
];
var DEFAULT_DEMO_NOTICE = "Demo only — this is a simulated value and does not connect to any real account.";
var getDepositSettings_createServerFn_handler = createServerRpc({
	id: "b562b95179d1bf6581193b2b33b9843551f5f18a2ba6f07403772f2cd1138a27",
	name: "getDepositSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getDepositSettings.__executeServer(opts));
var getDepositSettings = createServerFn({ method: "GET" }).handler(getDepositSettings_createServerFn_handler, async () => {
	if (!(await useSession$1(adminSessionConfig())).data.admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data, error } = await supabaseAdmin.from("deposit_settings").select("id, method, field_key, field_label, field_value, description, notice, updated_at").order("method").order("id");
	if (error) throw new Error(`Unable to load deposit settings: ${error.message}`);
	return data ?? [];
});
var updateDepositSetting_createServerFn_handler = createServerRpc({
	id: "6f8cff3c28f7a2ec3d4cf04f297b509f6854671612918605ff459bc83c27469a",
	name: "updateDepositSetting",
	filename: "src/lib/admin.functions.ts"
}, (opts) => updateDepositSetting.__executeServer(opts));
var updateDepositSetting = createServerFn({ method: "POST" }).validator((data) => {
	if (!DEPOSIT_METHODS.includes(data.method)) throw new Error("Invalid deposit method");
	if (!data.fieldKey.trim()) throw new Error("Field key is required");
	if (!data.fieldLabel.trim()) throw new Error("Field label is required");
	if (data.fieldValue.length > 2e3) throw new Error("Field value is too long");
	return {
		...data,
		fieldKey: data.fieldKey.trim(),
		fieldLabel: data.fieldLabel.trim(),
		description: data.description?.trim() ?? "",
		notice: data.notice?.trim() || DEFAULT_DEMO_NOTICE
	};
}).handler(updateDepositSetting_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: updated, error } = await supabaseAdmin.from("deposit_settings").upsert({
		method: data.method,
		field_key: data.fieldKey,
		field_label: data.fieldLabel,
		field_value: data.fieldValue,
		description: data.description ?? "",
		notice: data.notice,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "method,field_key" }).select().single();
	if (error) throw new Error(`Unable to update deposit setting: ${error.message}`);
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "update_deposit_setting",
		details: {
			method: data.method,
			fieldKey: data.fieldKey
		}
	});
	return updated;
});
var adminGetCardRequests_createServerFn_handler = createServerRpc({
	id: "c4eb193ce29e0f234a8c21c64a3566fac4db77f0018dbd8d9f5ce63a5a32b5d0",
	name: "adminGetCardRequests",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetCardRequests.__executeServer(opts));
var adminGetCardRequests = createServerFn({ method: "GET" }).handler(adminGetCardRequests_createServerFn_handler, async () => {
	if (!(await useSession$1(adminSessionConfig())).data.admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: requests, error } = await supabaseAdmin.from("card_requests").select("*").order("created_at", { ascending: false });
	if (error) throw new Error(`Unable to load card requests: ${error.message}`);
	const userIds = [...new Set((requests ?? []).map((r) => r.user_id))];
	const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
	const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
	return (requests ?? []).map((r) => ({
		...r,
		profiles: profileMap.get(r.user_id) ?? null
	}));
});
var adminApproveCardRequest_createServerFn_handler = createServerRpc({
	id: "c97444d61519fbd58a1d5efc971aca59c6cce4f0fb07a251c90807556dc1924a",
	name: "adminApproveCardRequest",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminApproveCardRequest.__executeServer(opts));
var adminApproveCardRequest = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.requestId) throw new Error("Card request ID is required");
	return {
		requestId: data.requestId,
		note: data.note?.trim() ?? ""
	};
}).handler(adminApproveCardRequest_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: request, error: requestError } = await supabaseAdmin.from("card_requests").select("*").eq("id", data.requestId).maybeSingle();
	if (requestError) throw new Error(requestError.message);
	if (!request) throw new Error("Card request not found");
	if (request.status !== "pending") throw new Error(`This request is already ${request.status}`);
	const { data: updated, error } = await supabaseAdmin.from("card_requests").update({
		status: "approved",
		admin_note: data.note || null,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", request.id).eq("status", "pending").select("*").single();
	if (error) throw new Error(error.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: request.user_id,
		type: "transaction",
		title: "Card request approved",
		message: `Your ${request.card_type} ${request.delivery_type} card request has been approved.`
	});
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "approve_card_request",
		target_user_id: request.user_id,
		details: { requestId: request.id }
	});
	return updated;
});
var adminRejectCardRequest_createServerFn_handler = createServerRpc({
	id: "8e9b3b3e0f0281b270817d96a6ec047a43006e42dbbb346e9a09382f9622fbd8",
	name: "adminRejectCardRequest",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminRejectCardRequest.__executeServer(opts));
var adminRejectCardRequest = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.requestId) throw new Error("Card request ID is required");
	return {
		requestId: data.requestId,
		note: data.note?.trim() ?? ""
	};
}).handler(adminRejectCardRequest_createServerFn_handler, async ({ data }) => {
	const admin = (await useSession$1(adminSessionConfig())).data.admin;
	if (!admin) throw new Error("Unauthorized");
	const { supabaseAdmin } = await import("../_libs/_4.mjs");
	const { data: request, error: requestError } = await supabaseAdmin.from("card_requests").select("*").eq("id", data.requestId).maybeSingle();
	if (requestError) throw new Error(requestError.message);
	if (!request) throw new Error("Card request not found");
	if (request.status !== "pending") throw new Error(`This request is already ${request.status}`);
	const { data: updated, error } = await supabaseAdmin.from("card_requests").update({
		status: "rejected",
		admin_note: data.note || "Request rejected by administrator.",
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", request.id).eq("status", "pending").select("*").single();
	if (error) throw new Error(error.message);
	await supabaseAdmin.from("notifications").insert({
		user_id: request.user_id,
		type: "security",
		title: "Card request rejected",
		message: `Your ${request.card_type} ${request.delivery_type} card request was rejected.`
	});
	await supabaseAdmin.from("admin_actions").insert({
		admin_email: admin,
		action: "reject_card_request",
		target_user_id: request.user_id,
		details: { requestId: request.id }
	});
	return updated;
});
//#endregion
export { adminApproveCardRequest_createServerFn_handler, adminCredit_createServerFn_handler, adminData_createServerFn_handler, adminGetCardRequests_createServerFn_handler, adminGetUser_createServerFn_handler, adminLogin_createServerFn_handler, adminLogout_createServerFn_handler, adminMe_createServerFn_handler, adminRejectCardRequest_createServerFn_handler, adminReplyTicket_createServerFn_handler, adminSendPasswordReset_createServerFn_handler, adminSetAccountBalance_createServerFn_handler, adminSetTransactionStatus_createServerFn_handler, adminUpdateUserProfile_createServerFn_handler, getDepositSettings_createServerFn_handler, updateDepositSetting_createServerFn_handler };
