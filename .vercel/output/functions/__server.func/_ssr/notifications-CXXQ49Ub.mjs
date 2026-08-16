import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as supabase } from "./client-Bi0AQxVp.mjs";
import { r as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { N as CheckCheck, R as Bell } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { d as dateTime, o as EmptyState, s as ListSkeleton } from "./bank-bits-Cqv1BNB-.mjs";
import { i as useNotifications, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CXXQ49Ub.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"all",
	"transaction",
	"security",
	"promotion",
	"system"
];
function NotificationsPage() {
	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useNotifications();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const list = (notifications ?? []).filter((n) => filter === "all" || n.type === filter);
	const unread = (notifications ?? []).filter((n) => !n.read_at);
	async function markAll() {
		if (unread.length === 0) return;
		await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", unread.map((n) => n.id));
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	}
	async function markOne(id) {
		await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Notifications",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setFilter(f),
					className: cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize", filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"),
					children: f
				}, f))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: markAll,
				disabled: unread.length === 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4" }), " Mark all"]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 5 }) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }),
			title: "Nothing to catch up on",
			description: "Alerts about transfers, cards and security will show up here."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2.5",
			children: list.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => !n.read_at && markOne(n.id),
				className: cn("flex w-full gap-3 rounded-2xl border p-4 text-left transition-colors", n.read_at ? "border-border/70 bg-card" : "border-primary/30 bg-primary/5"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-primary") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-sm text-muted-foreground",
							children: n.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs text-muted-foreground",
							children: dateTime(n.created_at)
						})
					]
				})]
			}, n.id))
		})]
	});
}
//#endregion
export { NotificationsPage as component };
