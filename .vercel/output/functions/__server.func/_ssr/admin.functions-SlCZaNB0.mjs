import { i as createServerFn } from "./server-DzloFYEC.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BlnPkaj8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-SlCZaNB0.js
var adminLogin = createServerFn({ method: "POST" }).handler(createSsrRpc("89f029f4fc21ed092423cd54f44fb61078423691288a3a89663a6e0973cd86ea"));
var adminLogout = createServerFn({ method: "POST" }).handler(createSsrRpc("b778199f0067dc3af0626a35537d9640eabb3a694e5f097e062cd440c74c2c03"));
createServerFn({ method: "GET" }).handler(createSsrRpc("de6c17ff3f303443a6e757a43fad4d339c0557719bb7e7298fa4c78a43322642"));
var adminData = createServerFn({ method: "GET" }).handler(createSsrRpc("41be4fade9b24c6efb697f61a1bc0b5a7e0c821bc6a0ce818b5c05cb9b063eba"));
var adminCredit = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.userId) throw new Error("Select a user");
	if (data.accountType !== "checking" && data.accountType !== "savings") throw new Error("Invalid account type");
	const amount = Math.round(Number(data.amount) * 100) / 100;
	if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
	return {
		...data,
		amount
	};
}).handler(createSsrRpc("33400c8bce68bb01ab9f0e19f010f5bf6b661d2406da74901644800bf54cb642"));
var adminSetTransactionStatus = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.transactionId) throw new Error("Transaction ID is required");
	return data;
}).handler(createSsrRpc("e1e897de683d00bc65411eada133c4d28e32041af52117a57be8e880a4f73fb8"));
var adminReplyTicket = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.ticketId) throw new Error("Ticket ID is required");
	if (!data.reply.trim()) throw new Error("Reply cannot be empty");
	return {
		...data,
		reply: data.reply.trim()
	};
}).handler(createSsrRpc("44707153ce010fc3d8f5c02f5cdf89791a7987dccc3931a1d906212440450d68"));
var adminSendPasswordReset = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.email.trim()) throw new Error("Email is required");
	if (!data.redirectTo.trim()) throw new Error("Redirect URL is required");
	return {
		email: data.email.trim(),
		redirectTo: data.redirectTo.trim()
	};
}).handler(createSsrRpc("19deeb714eecb76d7a8ad0ed60f6c8b1054721bc6384c2a0694957c8620a3d77"));
var adminGetUser = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.userId) throw new Error("Missing user");
	return data;
}).handler(createSsrRpc("8dcdbd38b0b91b95816133c8a21b49e13708d01ef7fcba97b10230f0512af20f"));
var adminUpdateUserProfile = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.userId) throw new Error("Missing user");
	return data;
}).handler(createSsrRpc("38f5f1ada3c4c7c6862e468b356bf92f295e1e57598352d937252460f6d4e20b"));
var adminSetAccountBalance = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.accountId) throw new Error("Account ID is required");
	const balance = Math.round(Number(data.balance) * 100) / 100;
	if (!Number.isFinite(balance) || balance < 0) throw new Error("Enter a valid balance");
	return {
		...data,
		balance
	};
}).handler(createSsrRpc("40e5d8b9a0829abac4ac84741e2ec1ce87ed809298770970a35317cbe0d568bf"));
var DEPOSIT_METHODS = [
	"paypal",
	"cashapp",
	"bank_transfer",
	"usdt",
	"btc"
];
var DEFAULT_DEMO_NOTICE = "Demo only — this is a simulated value and does not connect to any real account.";
var getDepositSettings = createServerFn({ method: "GET" }).handler(createSsrRpc("b562b95179d1bf6581193b2b33b9843551f5f18a2ba6f07403772f2cd1138a27"));
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
}).handler(createSsrRpc("6f8cff3c28f7a2ec3d4cf04f297b509f6854671612918605ff459bc83c27469a"));
var adminGetCardRequests = createServerFn({ method: "GET" }).handler(createSsrRpc("c4eb193ce29e0f234a8c21c64a3566fac4db77f0018dbd8d9f5ce63a5a32b5d0"));
var adminApproveCardRequest = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.requestId) throw new Error("Card request ID is required");
	return {
		requestId: data.requestId,
		note: data.note?.trim() ?? ""
	};
}).handler(createSsrRpc("c97444d61519fbd58a1d5efc971aca59c6cce4f0fb07a251c90807556dc1924a"));
var adminRejectCardRequest = createServerFn({ method: "POST" }).validator((data) => {
	if (!data.requestId) throw new Error("Card request ID is required");
	return {
		requestId: data.requestId,
		note: data.note?.trim() ?? ""
	};
}).handler(createSsrRpc("8e9b3b3e0f0281b270817d96a6ec047a43006e42dbbb346e9a09382f9622fbd8"));
//#endregion
export { adminGetUser as a, adminRejectCardRequest as c, adminSetAccountBalance as d, adminSetTransactionStatus as f, updateDepositSetting as h, adminGetCardRequests as i, adminReplyTicket as l, getDepositSettings as m, adminCredit as n, adminLogin as o, adminUpdateUserProfile as p, adminData as r, adminLogout as s, adminApproveCardRequest as t, adminSendPasswordReset as u };
