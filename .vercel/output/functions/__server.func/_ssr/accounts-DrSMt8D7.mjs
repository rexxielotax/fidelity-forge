import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { c as ReceiptDialog, m as money, o as EmptyState, s as ListSkeleton, u as TxRow } from "./bank-bits-Cqv1BNB-.mjs";
import { a as useProfile, c as useTransactions, n as useAccounts, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts-DrSMt8D7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountsPage() {
	const { data: profile } = useProfile();
	const { data: accounts, isLoading } = useAccounts();
	const { data: transactions } = useTransactions();
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const currency = profile?.currency ?? "USD";
	const activeId = selected ?? accounts?.[0]?.id ?? null;
	const activity = (transactions ?? []).filter((t) => t.account_id === activeId).slice(0, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Accounts",
		children: [
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 2 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: (accounts ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSelected(a.id),
					className: `rounded-2xl border p-5 text-left transition-shadow ${a.id === activeId ? "border-primary shadow-[var(--shadow-elev)]" : "border-border/70"} bg-card`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: [a.type, " account"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl font-bold",
							children: money(Number(a.balance), currency)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: ["Acct •••• ", a.account_number.slice(-4)]
						})
					]
				}, a.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/transfer",
						children: "Send money"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/transactions",
						children: "All transactions"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-3 mt-7 text-sm font-semibold text-muted-foreground",
				children: "Account activity"
			}),
			activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nothing here yet",
				description: "This account has no activity. Transfers and credits will appear here."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2.5",
				children: activity.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxRow, {
					tx: t,
					currency,
					onClick: () => setReceipt(t)
				}, t.id))
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
export { AccountsPage as component };
