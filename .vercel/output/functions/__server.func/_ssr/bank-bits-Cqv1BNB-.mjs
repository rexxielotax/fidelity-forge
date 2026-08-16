import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { T as Download, U as ArrowDownLeft, t as X, v as Inbox, z as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bank-bits-Cqv1BNB-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = require_jspdf_node_min();
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function money(amount, currency = "USD") {
	const value = typeof amount === "string" ? Number(amount) : amount;
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			maximumFractionDigits: 2
		}).format(Number.isFinite(value) ? value : 0);
	} catch {
		return `${currency} ${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
	}
}
function dateTime(value) {
	if (!value) return "—";
	return new Date(value).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function shortDate(value) {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function greeting(d = /* @__PURE__ */ new Date()) {
	const h = d.getHours();
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
}
function downloadReceipt(tx, currency = "USD") {
	const doc = new import_jspdf_node_min.jsPDF({
		unit: "pt",
		format: "a4"
	});
	doc.setFillColor(122, 32, 32);
	doc.rect(0, 0, 595, 110, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(20);
	doc.text("Wellspring Bank", 40, 55);
	doc.setFontSize(10);
	doc.text("Simulated transaction receipt — no real funds involved", 40, 76);
	doc.setTextColor(30, 30, 30);
	doc.setFontSize(16);
	doc.text(`${tx.direction === "credit" ? "+" : "-"}${money(Number(tx.amount), currency)}`, 40, 150);
	const rows = [
		["Reference", tx.reference],
		["Type", tx.category.replace(/_/g, " ")],
		["Direction", tx.direction],
		["Status", tx.status],
		["Date / Time", dateTime(tx.created_at)],
		["Description", tx.description ?? "—"],
		["Recipient", tx.recipient_name ?? "—"],
		["Bank", tx.recipient_bank ?? "—"],
		["Account", tx.recipient_account ?? "—"]
	];
	let y = 190;
	doc.setFontSize(11);
	for (const [label, value] of rows) {
		doc.setTextColor(120, 120, 120);
		doc.text(label, 40, y);
		doc.setTextColor(20, 20, 20);
		doc.text(String(value), 220, y);
		y += 26;
	}
	doc.setDrawColor(220, 220, 220);
	doc.line(40, y + 6, 555, y + 6);
	doc.setTextColor(140, 140, 140);
	doc.setFontSize(9);
	doc.text("This document is generated by a fictional banking demo application.", 40, y + 28);
	doc.save(`receipt-${tx.reference}.pdf`);
}
var STATUS_STYLES = {
	completed: "bg-success/12 text-success",
	pending: "bg-warning/18 text-warning-foreground",
	failed: "bg-destructive/12 text-destructive",
	cancelled: "bg-muted text-muted-foreground"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"),
		children: status
	});
}
function EmptyState({ icon, title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground",
				children: icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xs text-sm text-muted-foreground",
				children: description
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: action
			})
		]
	});
}
function ListSkeleton({ rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2.5",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-2xl" }, i))
	});
}
function TxRow({ tx, currency, onClick }) {
	const credit = tx.direction === "credit";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("grid size-10 shrink-0 place-items-center rounded-full", credit ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive"),
				children: credit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-sm font-semibold",
					children: tx.recipient_name ?? tx.description ?? tx.category.replace(/_/g, " ")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block truncate text-xs text-muted-foreground",
					children: [
						shortDate(tx.created_at),
						" · ",
						tx.reference
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "shrink-0 text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("block text-sm font-bold", credit ? "text-success" : "text-foreground"),
					children: [credit ? "+" : "−", money(Number(tx.amount), currency)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: tx.status })]
			})
		]
	});
}
function ReceiptDialog({ tx, currency, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(tx),
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display",
				children: "Transaction receipt"
			}) }), tx && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-brand px-5 py-6 text-center text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-3xl font-bold",
							children: [tx.direction === "credit" ? "+" : "−", money(Number(tx.amount), currency)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs uppercase tracking-widest text-primary-foreground/70",
							children: tx.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "space-y-2.5 text-sm",
						children: [
							["Reference", tx.reference],
							["Type", tx.category.replace(/_/g, " ")],
							["Date / Time", dateTime(tx.created_at)],
							["Description", tx.description ?? "—"],
							["Recipient", tx.recipient_name ?? "—"],
							["Bank", tx.recipient_bank ?? "—"],
							["Account", tx.recipient_account ?? "—"]
						].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: k
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-right font-medium capitalize",
								children: v
							})]
						}, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						variant: "secondary",
						onClick: () => downloadReceipt(tx, currency),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download PDF"]
					})
				]
			})]
		})
	});
}
//#endregion
export { DialogTitle as a, ReceiptDialog as c, dateTime as d, downloadReceipt as f, DialogHeader as i, StatusBadge as l, money as m, DialogContent as n, EmptyState as o, greeting as p, DialogDescription as r, ListSkeleton as s, Dialog as t, TxRow as u };
