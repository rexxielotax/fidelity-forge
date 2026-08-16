import { i as createServerFn } from "./server-DzloFYEC.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BlnPkaj8.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-D13lCX2a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bank.functions-DWPpV4Dr.js
var DEPOSIT_METHOD_LABEL = {
	paypal: "PayPal",
	cashapp: "Cash App",
	bank_transfer: "Bank transfer",
	usdt: "USDT",
	btc: "Bitcoin"
};
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
}).handler(createSsrRpc("173af04ab66e0d33667fc5895576900c230e632f2ae29999f57a21b184d5774b"));
var finalizeTransfer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.transactionId) throw new Error("Transaction ID is required");
	return data;
}).handler(createSsrRpc("e5d9dd57d50dba75a0c3da7317d3007b0a485ba3a4001640c9da2c489af2f21d"));
var createDeposit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.accountId) throw new Error("Select an account");
	if (!DEPOSIT_METHOD_LABEL[data.method]) throw new Error("Select a deposit method");
	const amount = Math.round(Number(data.amount) * 100) / 100;
	if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
	return {
		...data,
		amount
	};
}).handler(createSsrRpc("713e87bb8b34aee9e0dbc270eabb008a0f301e25df60a0e7ab736e0599e4ed9d"));
var finalizeDeposit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.transactionId) throw new Error("Transaction ID is required");
	return data;
}).handler(createSsrRpc("0ce005e0fa5bc6f6ede0257657ed7c3a8e48684df51dda4c0a24a74fea0e794c"));
var DepositMethodSchema = [
	"paypal",
	"cashapp",
	"bank_transfer",
	"usdt",
	"btc"
];
var getPublicDepositSettings = createServerFn({ method: "GET" }).handler(createSsrRpc("a5c497cca71a9002e3804bb1488e832528a4875ae6fb8be792e58740d3f6bf79"));
createServerFn({ method: "POST" }).inputValidator((data) => {
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
}).handler(createSsrRpc("b0dec5853a900307998b946c31255e4ed7e46accd3d789c488bec9224b242efa"));
createServerFn({ method: "POST" }).inputValidator((data) => {
	if (!Array.isArray(data.settings)) throw new Error("Invalid settings");
	return data;
}).handler(createSsrRpc("3664a4b521598d21a7a4b4767ee27bd6c08c453eaf0d524d118c60f2400ff3d8"));
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
}).handler(createSsrRpc("9586d3b9d06b229d0a1f13c3ead7039591c80b280fd97746dea9d8f4c200da20"));
var getMyCardRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("26dfd3047dd8e7ac826a6de5ad977b518b8b6ab87619667996f0fb86d338ec3a"));
var setCardStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.cardId) throw new Error("Card ID is required");
	return data;
}).handler(createSsrRpc("8c8feedb28dc96277bd769d513fb25321772feda2e5739540c980ba25b82cedc"));
var getCardPin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.cardId) throw new Error("Card ID is required");
	return data;
}).handler(createSsrRpc("c8d01a2be0ee1a990fe9306d95efaceceb530c945ce03b39eba0a7e51bc78ab2"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data.title.trim()) throw new Error("Notification title is required");
	if (!data.message.trim()) throw new Error("Notification message is required");
	return {
		...data,
		title: data.title.trim(),
		message: data.message.trim()
	};
}).handler(createSsrRpc("dc3ccead35e551327183d6beb73f0ca3388239bc1f28358810b7e24ca6c0a19a"));
//#endregion
export { finalizeTransfer as a, getPublicDepositSettings as c, finalizeDeposit as i, setCardStatus as l, createDeposit as n, getCardPin as o, createTransfer as r, getMyCardRequests as s, createCardRequest as t };
