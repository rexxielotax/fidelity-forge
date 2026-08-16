import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { c as Search } from "../_libs/lucide-react.mjs";
import { c as ReceiptDialog, o as EmptyState, s as ListSkeleton, u as TxRow } from "./bank-bits-Cqv1BNB-.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { a as useProfile, c as useTransactions, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-gTHxKcnw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TransactionsPage() {
	const { data: profile } = useProfile();
	const { data: transactions, isLoading } = useTransactions();
	const [query, setQuery] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [direction, setDirection] = (0, import_react.useState)("all");
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const currency = profile?.currency ?? "USD";
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return (transactions ?? []).filter((t) => {
			if (status !== "all" && t.status !== status) return false;
			if (direction !== "all" && t.direction !== direction) return false;
			if (!q) return true;
			return [
				t.reference,
				t.recipient_name,
				t.description,
				t.category
			].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
		});
	}, [
		transactions,
		query,
		status,
		direction
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Transactions",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "pl-9",
						placeholder: "Search by reference, recipient or note",
						value: query,
						onChange: (e) => setQuery(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: status,
						onValueChange: setStatus,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
							"all",
							"pending",
							"completed",
							"failed",
							"cancelled"
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: s,
							className: "capitalize",
							children: s === "all" ? "All statuses" : s
						}, s)) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: direction,
						onValueChange: setDirection,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All types"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "credit",
								children: "Money in"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "debit",
								children: "Money out"
							})
						] })]
					})]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 6 }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No matching transactions",
				description: "Try clearing the search or changing the filters above."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2.5",
				children: filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxRow, {
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
export { TransactionsPage as component };
