import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { C as EyeOff, E as CreditCard, H as ArrowLeftRight, S as Eye, T as Download, g as LifeBuoy, u as Receipt, w as Ellipsis } from "../_libs/lucide-react.mjs";
import { c as ReceiptDialog, m as money, o as EmptyState, p as greeting, s as ListSkeleton, u as TxRow } from "./bank-bits-Cqv1BNB-.mjs";
import { a as useProfile, c as useTransactions, n as useAccounts, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DNiO4cFS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { data: profile } = useProfile();
	const { data: accounts, isLoading: loadingAccounts } = useAccounts();
	const { data: transactions, isLoading: loadingTx } = useTransactions(6);
	const [hidden, setHidden] = (0, import_react.useState)(false);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const currency = profile?.currency ?? "USD";
	const total = (accounts ?? []).reduce((sum, a) => sum + Number(a.balance), 0);
	const firstName = (profile?.full_name || profile?.email || "there").split(" ")[0];
	const QUICK = [
		{
			to: "/deposit",
			label: "Deposit",
			icon: Download
		},
		{
			to: "/transfer",
			label: "Transfer",
			icon: ArrowLeftRight
		},
		{
			to: "/cards",
			label: "My Cards",
			icon: CreditCard
		},
		{
			to: "/transactions",
			label: "Transactions",
			icon: Receipt
		},
		{
			to: "/support",
			label: "Support",
			icon: LifeBuoy
		},
		{
			to: "/more",
			label: "More",
			icon: Ellipsis
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Home",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [greeting(), ","]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-bold capitalize",
				children: firstName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-3xl bg-brand p-6 text-primary-foreground shadow-[var(--shadow-card)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-primary-foreground/70",
							children: "Total balance"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setHidden((h) => !h),
							"aria-label": "Toggle balance visibility",
							children: hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-4xl font-extrabold",
						children: hidden ? "••••••" : money(total, currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-primary-foreground/75",
						children: ["Available: ", hidden ? "••••" : money(total, currency)]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-sm font-semibold text-muted-foreground",
					children: "Quick actions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-3 sm:grid-cols-6",
					children: QUICK.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: q.to,
						className: "flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 py-3.5 text-center transition-colors hover:bg-muted/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(q.icon, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium leading-tight",
							children: q.label
						})]
					}, q.to))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "Accounts overview"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/accounts",
						className: "text-sm font-semibold text-primary",
						children: "See all"
					})]
				}), loadingAccounts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 2 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex snap-x gap-3 overflow-x-auto pb-2",
					children: (accounts ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[240px] snap-start rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-elev)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: a.type
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-xl font-bold",
								children: money(Number(a.balance), currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: ["•••• ", a.account_number.slice(-4)]
							})
						]
					}, a.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "Recent transactions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/transactions",
						className: "text-sm font-semibold text-primary",
						children: "See all"
					})]
				}), loadingTx ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : (transactions ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No transactions yet",
					description: "Once money moves in or out of your accounts, it will show up right here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2.5",
					children: (transactions ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxRow, {
						tx: t,
						currency,
						onClick: () => setReceipt(t)
					}, t.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptDialog, {
				tx: receipt,
				currency,
				onOpenChange: (o) => !o && setReceipt(null)
			})
		]
	});
}
//#endregion
export { Dashboard as component };
