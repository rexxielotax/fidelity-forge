import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as ChevronRight, D as Copy, E as CreditCard, L as Bitcoin, M as Check, N as CheckCheck, O as CircleAlert, V as ArrowLeft, _ as Landmark, h as LoaderCircle, n as Wallet } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { f as downloadReceipt, l as StatusBadge, m as money, o as EmptyState } from "./bank-bits-Cqv1BNB-.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { a as useProfile, n as useAccounts, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
import { c as getPublicDepositSettings, i as finalizeDeposit, n as createDeposit } from "./bank.functions-DWPpV4Dr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deposit-CxRa3nkT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"Method",
	"Review",
	"Confirm",
	"Complete"
];
var METHODS = [
	{
		id: "paypal",
		label: "PayPal",
		icon: Wallet,
		hint: "Simulated PayPal deposit"
	},
	{
		id: "cashapp",
		label: "Cash App",
		icon: CreditCard,
		hint: "Simulated Cash App deposit"
	},
	{
		id: "bank_transfer",
		label: "Bank Transfer",
		icon: Landmark,
		hint: "Simulated bank transfer"
	},
	{
		id: "crypto",
		label: "Crypto",
		icon: Bitcoin,
		hint: "Bitcoin & USDT"
	}
];
var METHOD_INFO = {
	paypal: "Use the  PayPal account details below to complete your deposit. No real PayPal transaction is performed.",
	cashapp: "Use the  Cash App details below. This demo does not connect to Cash App or process real payments.",
	bank_transfer: "Use the  bank transfer details below. No real bank transfer is initiated by this application.",
	crypto: "Choose Bitcoin or USDT below. This demo does not connect to a blockchain or process real cryptocurrency."
};
var DEPOSIT_DETAILS = {
	paypal: {
		title: "PayPal Deposit Details",
		description: "Send your  deposit to the PayPal account below.",
		fields: [{
			label: "PayPal account",
			value: "demo-paypal@nirmalbank.test"
		}, {
			label: "Account name",
			value: "Nirmal Bank Demo"
		}],
		notice: "Demo only — this PayPal account is not a real receiving account."
	},
	cashapp: {
		title: "Cash App Deposit Details",
		description: "Use the simulated Cash App details below.",
		fields: [{
			label: "Cash App",
			value: "$NirmalBankDemo"
		}, {
			label: "Account name",
			value: "Nirmal Bank Demo"
		}],
		notice: "Demo only — this Cash App identifier is not connected to a real account."
	},
	bank_transfer: {
		title: "Bank Transfer Details",
		description: "Use these simulated banking details when making your demo transfer.",
		fields: [
			{
				label: "Bank name",
				value: "Nirmal Bank — Demo"
			},
			{
				label: "Account name",
				value: "Nirmal Bank Demo Account"
			},
			{
				label: "Account number",
				value: "0000000000"
			},
			{
				label: "Routing number",
				value: "000000000"
			},
			{
				label: "SWIFT / BIC",
				value: "DEMONGB0XXX"
			}
		],
		notice: "Demo only — these banking details are placeholders and cannot receive real funds."
	},
	usdt: {
		title: "USDT Deposit",
		description: "Select the network and use the simulated deposit address.",
		fields: [{
			label: "Network",
			value: "TRC20"
		}, {
			label: "USDT address",
			value: "DEMO-USDT-TRC20-ADDRESS"
		}],
		notice: "Demo only — this is not a real blockchain address. Do not send real cryptocurrency to it."
	},
	btc: {
		title: "Bitcoin Deposit",
		description: "Use the simulated Bitcoin deposit address below.",
		fields: [{
			label: "Network",
			value: "Bitcoin"
		}, {
			label: "BTC address",
			value: "DEMO-BTC-ADDRESS"
		}],
		notice: "Demo only — this is not a real Bitcoin address. Do not send real cryptocurrency to it."
	}
};
function DepositPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: profile } = useProfile();
	const { data: accounts } = useAccounts();
	const send = useServerFn(createDeposit);
	const finalize = useServerFn(finalizeDeposit);
	const loadDepositSettings = useServerFn(getPublicDepositSettings);
	const settingsQuery = useQuery({
		queryKey: ["public-deposit-settings"],
		queryFn: () => loadDepositSettings()
	});
	const currency = profile?.currency ?? "USD";
	const [step, setStep] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [settling, setSettling] = (0, import_react.useState)(false);
	const [errorBanner, setErrorBanner] = (0, import_react.useState)(null);
	const [tx, setTx] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		accountId: "",
		method: "",
		cryptoMethod: "",
		amount: ""
	});
	const accountId = form.accountId || accounts?.[0]?.id || "";
	const account = (accounts ?? []).find((a) => a.id === accountId);
	const selectedMethod = METHODS.find((m) => m.id === form.method);
	const selectedCrypto = form.method === "crypto" ? form.cryptoMethod : "";
	const activeDepositMethod = form.method === "crypto" ? form.cryptoMethod : form.method;
	const settingsRows = settingsQuery.data ?? [];
	const dynamicFields = activeDepositMethod ? settingsRows.filter((row) => row.method === activeDepositMethod).map((row) => ({
		label: row.field_label,
		value: row.field_value
	})) : [];
	const dynamicNotice = activeDepositMethod ? settingsRows.find((row) => row.method === activeDepositMethod && row.notice)?.notice : null;
	const staticDetails = activeDepositMethod && activeDepositMethod in DEPOSIT_DETAILS ? DEPOSIT_DETAILS[activeDepositMethod] : null;
	const selectedDetails = staticDetails ? {
		...staticDetails,
		fields: dynamicFields.length > 0 ? dynamicFields : staticDetails.fields,
		notice: dynamicNotice ?? staticDetails.notice
	} : null;
	function set(patch) {
		setForm((current) => ({
			...current,
			...patch
		}));
	}
	function chooseMethod(method) {
		setErrorBanner(null);
		if (method === "crypto") {
			set({
				method,
				cryptoMethod: ""
			});
			return;
		}
		set({
			method,
			cryptoMethod: ""
		});
	}
	function chooseCrypto(method) {
		setErrorBanner(null);
		set({
			method: "crypto",
			cryptoMethod: method
		});
	}
	function goReview(e) {
		e.preventDefault();
		setErrorBanner(null);
		if (!accountId) {
			toast.error("Select an account");
			return;
		}
		if (!form.method) {
			toast.error("Choose a deposit method");
			return;
		}
		if (form.method === "crypto" && !form.cryptoMethod) {
			toast.error("Choose Bitcoin or USDT");
			return;
		}
		const amount = Number(form.amount);
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		setStep(1);
	}
	async function confirm() {
		if (!accountId) {
			toast.error("Select an account");
			return;
		}
		if (!form.method) {
			toast.error("Choose a deposit method");
			return;
		}
		const amount = Number(form.amount);
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		setBusy(true);
		setErrorBanner(null);
		try {
			const created = await send({ data: {
				accountId,
				method: activeDepositMethod,
				amount
			} });
			setTx(created);
			setStep(3);
			setSettling(true);
			queryClient.invalidateQueries();
			setTimeout(async () => {
				try {
					const done = await finalize({ data: { transactionId: created.id } });
					setTx(done ?? created);
					queryClient.invalidateQueries();
				} catch {} finally {
					setSettling(false);
				}
			}, 6e3);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Deposit failed, please try again";
			setErrorBanner(message);
			toast.error(message);
		} finally {
			setBusy(false);
		}
	}
	async function copyValue(label, value) {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(label);
			toast.success(`${label} copied`);
			setTimeout(() => {
				setCopied(null);
			}, 2e3);
		} catch {
			toast.error("Unable to copy");
		}
	}
	function resetDeposit() {
		setStep(0);
		setTx(null);
		setSettling(false);
		setErrorBanner(null);
		setCopied(null);
		setForm({
			accountId: accounts?.[0]?.id ?? "",
			method: "",
			cryptoMethod: "",
			amount: ""
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Deposit",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mb-6 flex items-center gap-2",
				children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-1 items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`,
							children: i < step ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `hidden text-xs font-medium sm:block ${i <= step ? "" : "text-muted-foreground"}`,
							children: s
						}),
						i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
					]
				}, s))
			}),
			errorBanner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorBanner })]
			}),
			step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: goReview,
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "To account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2 sm:grid-cols-2",
							children: (accounts ?? []).map((a) => {
								const active = accountId === a.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => set({ accountId: a.id }),
									className: `rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-border/70 bg-card hover:bg-muted"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold capitalize",
											children: a.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"••••",
												" ",
												a.account_number.slice(-4)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs font-medium",
											children: money(Number(a.balance), currency)
										})
									]
								}, a.id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "deposit-amount",
							children: "Amount"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
								children: "$"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "deposit-amount",
								type: "number",
								step: "0.01",
								min: "0.01",
								className: "pl-7",
								value: form.amount,
								onChange: (e) => set({ amount: e.target.value }),
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Deposit method" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Choose how you want to add funds."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
								children: METHODS.map((m) => {
									const Icon = m.icon;
									const active = form.method === m.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => chooseMethod(m.id),
										className: `flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border/70 bg-card hover:bg-muted"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-6 ${active ? "text-primary" : "text-muted-foreground"}` }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-semibold",
												children: m.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-muted-foreground",
												children: m.hint
											})
										]
									}, m.id);
								})
							}),
							selectedMethod && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground",
								children: METHOD_INFO[selectedMethod.id]
							})
						]
					}),
					form.method === "crypto" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Choose cryptocurrency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Select the asset you want to use."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => chooseCrypto("usdt"),
								className: `rounded-xl border p-4 text-left transition ${selectedCrypto === "usdt" ? "border-primary bg-primary/5" : "border-border/70 hover:bg-muted"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid size-10 place-items-center rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-bold",
											children: "₮"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: "USDT"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Tether USD"
									})] })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => chooseCrypto("btc"),
								className: `rounded-xl border p-4 text-left transition ${selectedCrypto === "btc" ? "border-primary bg-primary/5" : "border-border/70 hover:bg-muted"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid size-10 place-items-center rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bitcoin, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: "Bitcoin"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "BTC"
									})] })]
								})
							})]
						})]
					}),
					selectedDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid size-9 place-items-center rounded-full bg-primary/10 text-primary",
										children: activeDepositMethod === "btc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bitcoin, { className: "size-5" }) : activeDepositMethod === "usdt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold",
											children: "₮"
										}) : activeDepositMethod === "bank_transfer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-base font-semibold",
										children: selectedDetails.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: selectedDetails.description
									})] })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: selectedDetails.fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border/60 bg-muted/40 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1 flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: field.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => copyValue(field.label, field.value),
											className: "inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline",
											children: copied === field.label ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3.5" }), "Copied"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "Copy"] })
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "break-all text-sm font-semibold",
										children: field.value
									})]
								}, field.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-5 text-muted-foreground",
									children: selectedDetails.notice
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full",
						disabled: !accountId || !form.method || form.method === "crypto" && !form.cryptoMethod,
						children: ["Review deposit", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					})
				]
			}),
			step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "You are depositing"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-display text-3xl font-extrabold",
								children: money(Number(form.amount), currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-5 space-y-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "To"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "text-right font-medium capitalize",
											children: [
												account?.type ?? "",
												" ",
												"••••",
												" ",
												account?.account_number.slice(-4) ?? ""
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Method"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "text-right font-medium",
											children: form.method === "crypto" ? form.cryptoMethod === "usdt" ? "USDT" : "Bitcoin" : selectedMethod?.label ?? "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Amount"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "text-right font-medium",
											children: money(Number(form.amount), currency)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-muted-foreground",
											children: "Balance after settlement"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "text-right font-medium",
											children: money(Number(account?.balance ?? 0) + Number(form.amount || 0), currency)
										})]
									})
								]
							})
						]
					}),
					selectedDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Deposit destination"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 space-y-2",
							children: selectedDetails.fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1 rounded-xl bg-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: field.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "break-all text-sm font-medium sm:text-right",
									children: field.value
								})]
							}, field.label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => setStep(0),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							onClick: () => setStep(2),
							children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
						})]
					})
				]
			}),
			step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-7" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl font-bold",
									children: "Confirm your deposit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Review the information below before submitting."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-xl bg-muted p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted-foreground",
										children: "Amount"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-bold",
										children: money(Number(form.amount), currency)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted-foreground",
										children: "Method"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold",
										children: form.method === "crypto" ? form.cryptoMethod === "usdt" ? "USDT" : "Bitcoin" : selectedMethod?.label
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground",
						children: "This is a simulated deposit. No real funds, cards, bank transfers, PayPal transactions, Cash App transactions, or cryptocurrency transactions are processed."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => setStep(1),
							disabled: busy,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: confirm,
							disabled: busy,
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Submitting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Confirm deposit", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })] })
						})]
					})
				]
			}),
			step === 3 && tx && settling && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "Processing your deposit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: [
							"Reference",
							" ",
							tx.reference,
							" ·",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: "pending" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "This usually takes a few seconds."
					})
				] })]
			}),
			step === 3 && tx && !settling && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold",
							children: tx.status === "completed" ? "Deposit complete" : "Deposit submitted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								"Reference",
								" ",
								tx.reference,
								" ·",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: tx.status })
							]
						}),
						tx.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "This deposit is still settling. You'll see your balance update automatically."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-5 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "Amount"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold",
									children: money(Number(form.amount), currency)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "Method"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold",
									children: form.method === "crypto" ? form.cryptoMethod === "usdt" ? "USDT" : "Bitcoin" : selectedMethod?.label
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "Reference"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: tx.reference
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => downloadReceipt(tx, currency),
								children: "Download receipt"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "flex-1",
								onClick: resetDeposit,
								children: "New deposit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1",
								onClick: () => navigate({ to: "/dashboard" }),
								children: "Back to home"
							})
						]
					})
				]
			}),
			step === 0 && (accounts ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No accounts found",
					description: "Your accounts are still being set up. Refresh in a moment."
				})
			})
		]
	});
}
//#endregion
export { DepositPage as component };
