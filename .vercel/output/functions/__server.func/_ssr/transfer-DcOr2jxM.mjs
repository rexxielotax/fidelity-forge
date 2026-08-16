import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { r as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as ChevronRight, M as Check, r as Users } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { f as downloadReceipt, l as StatusBadge, m as money, o as EmptyState } from "./bank-bits-Cqv1BNB-.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { a as useProfile, n as useAccounts, o as useRecipients, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
import { t as Checkbox } from "./checkbox-nEie9MAD.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
import { a as finalizeTransfer, r as createTransfer } from "./bank.functions-DWPpV4Dr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transfer-DcOr2jxM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"Details",
	"Review",
	"Confirm",
	"Complete"
];
function TransferPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: profile } = useProfile();
	const { data: accounts } = useAccounts();
	const { data: recipients } = useRecipients();
	const send = useServerFn(createTransfer);
	const finalize = useServerFn(finalizeTransfer);
	const currency = profile?.currency ?? "USD";
	const [step, setStep] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [tx, setTx] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		accountId: "",
		recipientName: "",
		bank: "",
		accountNumber: "",
		routingNumber: "",
		amount: "",
		description: "",
		saveRecipient: false
	});
	const accountId = form.accountId || accounts?.[0]?.id || "";
	const account = (accounts ?? []).find((a) => a.id === accountId);
	const set = (patch) => setForm((f) => ({
		...f,
		...patch
	}));
	function goReview(e) {
		e.preventDefault();
		const amount = Number(form.amount);
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		if (account && Number(account.balance) < amount) {
			toast.error("Insufficient balance for this transfer");
			return;
		}
		setStep(1);
	}
	async function confirm() {
		setBusy(true);
		try {
			const created = await send({ data: {
				accountId,
				recipientName: form.recipientName,
				bank: form.bank,
				accountNumber: form.accountNumber,
				routingNumber: form.routingNumber,
				description: form.description,
				amount: Number(form.amount),
				saveRecipient: form.saveRecipient
			} });
			setTx(created);
			setStep(3);
			queryClient.invalidateQueries();
			setTimeout(async () => {
				try {
					const done = await finalize({ data: { transactionId: created.id } });
					setTx(done ?? created);
					queryClient.invalidateQueries();
				} catch {}
			}, 6e3);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Transfer failed, please try again");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Transfer",
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
			step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: goReview,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "From account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: accountId,
							onValueChange: (v) => set({ accountId: v }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select account" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (accounts ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: a.id,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize",
										children: a.type
									}),
									" · ",
									money(Number(a.balance), currency)
								]
							}, a.id)) })]
						})]
					}),
					(recipients ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						className: "mb-2 flex items-center gap-1.5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), " Saved recipients"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto pb-1",
						children: (recipients ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => set({
								recipientName: r.name,
								bank: r.bank,
								accountNumber: r.account_number,
								routingNumber: r.routing_number ?? ""
							}),
							className: "shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted",
							children: r.name
						}, r.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rn",
							children: "Recipient name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "rn",
							value: form.recipientName,
							onChange: (e) => set({ recipientName: e.target.value }),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "bk",
							children: "Bank name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bk",
							value: form.bank,
							onChange: (e) => set({ bank: e.target.value }),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "an",
								children: "Account number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "an",
								value: form.accountNumber,
								onChange: (e) => set({ accountNumber: e.target.value }),
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rt",
								children: "Routing number (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "rt",
								value: form.routingNumber,
								onChange: (e) => set({ routingNumber: e.target.value })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "am",
							children: "Amount"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "am",
							type: "number",
							step: "0.01",
							min: "0.01",
							value: form.amount,
							onChange: (e) => set({ amount: e.target.value }),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ds",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "ds",
							rows: 2,
							value: form.description,
							onChange: (e) => set({ description: e.target.value })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: form.saveRecipient,
							onCheckedChange: (v) => set({ saveRecipient: Boolean(v) })
						}), "Save this recipient for next time"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full",
						children: ["Review transfer ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					})
				]
			}),
			(step === 1 || step === 2) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/70 bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: "You are sending"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-3xl font-extrabold",
							children: money(Number(form.amount), currency)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-4 space-y-2 text-sm",
							children: [
								["From", `${account?.type ?? ""} •••• ${account?.account_number.slice(-4) ?? ""}`],
								["To", form.recipientName],
								["Bank", form.bank],
								["Account", form.accountNumber],
								["Routing", form.routingNumber || "—"],
								["Description", form.description || "—"]
							].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-right font-medium capitalize",
									children: v
								})]
							}, k))
						})
					]
				}), step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "flex-1",
						onClick: () => setStep(0),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						onClick: () => setStep(2),
						children: "Continue"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground",
						children: "Confirm to submit this transfer. Your balance is only deducted once the transfer completes."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => setStep(1),
							disabled: busy,
							children: "Back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: confirm,
							disabled: busy,
							children: busy ? "Submitting…" : "Confirm transfer"
						})]
					})]
				})]
			}),
			step === 3 && tx && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold",
							children: "Transfer submitted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								"Reference ",
								tx.reference,
								" · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: tx.status })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Pending transfers settle automatically after a short processing window."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => downloadReceipt(tx, currency),
							children: "Download receipt"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: () => navigate({ to: "/dashboard" }),
							children: "Back to home"
						})]
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
export { TransferPage as component };
