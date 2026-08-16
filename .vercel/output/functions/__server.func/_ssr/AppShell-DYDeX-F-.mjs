import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as supabase } from "./client-Bi0AQxVp.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as CreditCard, H as ArrowLeftRight, R as Bell, T as Download, b as House, d as Menu, f as LogOut, g as LifeBuoy, n as Wallet, o as Settings, t as X, u as Receipt, w as Ellipsis } from "../_libs/lucide-react.mjs";
import { n as cn } from "./button-BpE9Czok.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-DYDeX-F-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function uid() {
	const { data } = await supabase.auth.getUser();
	return data.user?.id ?? null;
}
function useProfile() {
	return useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const id = await uid();
			if (!id) return null;
			const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
}
function useAccounts() {
	return useQuery({
		queryKey: ["accounts"],
		queryFn: async () => {
			const { data, error } = await supabase.from("accounts").select("*").order("type");
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useTransactions(limit) {
	return useQuery({
		queryKey: ["transactions", limit ?? "all"],
		queryFn: async () => {
			let q = supabase.from("transactions").select("*").order("created_at", { ascending: false });
			if (limit) q = q.limit(limit);
			const { data, error } = await q;
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useCards() {
	return useQuery({
		queryKey: ["cards"],
		queryFn: async () => {
			const { data, error } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useRecipients() {
	return useQuery({
		queryKey: ["recipients"],
		queryFn: async () => {
			const { data, error } = await supabase.from("recipients").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
}
function useNotifications() {
	return useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		},
		refetchInterval: 2e4
	});
}
function useTickets() {
	return useQuery({
		queryKey: ["tickets"],
		queryFn: async () => {
			const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
}
var TABS = [
	{
		to: "/dashboard",
		label: "Home",
		icon: House
	},
	{
		to: "/accounts",
		label: "Accounts",
		icon: Wallet
	},
	{
		to: "/transfer",
		label: "Transfer",
		icon: ArrowLeftRight
	},
	{
		to: "/cards",
		label: "Cards",
		icon: CreditCard
	},
	{
		to: "/more",
		label: "More",
		icon: Ellipsis
	}
];
var SIDE_LINKS = [
	{
		to: "/dashboard",
		label: "Overview",
		icon: House
	},
	{
		to: "/accounts",
		label: "Accounts",
		icon: Wallet
	},
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
		label: "Cards",
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
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function AppShell({ title, children }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data: notifications } = useNotifications();
	const unread = (notifications ?? []).filter((n) => !n.read_at).length;
	const [navOpen, setNavOpen] = (0, import_react.useState)(false);
	async function signOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			navOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-30 bg-black/40 lg:hidden",
				onClick: () => setNavOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0", navOpen ? "translate-x-0" : "-translate-x-full"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setNavOpen(false),
						className: "absolute right-3 top-6 rounded-lg p-1.5 hover:bg-sidebar-accent/60 lg:hidden",
						"aria-label": "Close menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/dashboard",
						className: "mb-8 flex items-center gap-3 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 place-items-center rounded-xl bg-gold font-display text-lg font-extrabold text-sidebar-primary-foreground",
							children: "W"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-bold",
							children: "wellsfargo"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: SIDE_LINKS.map((l) => {
							const active = pathname === l.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: l.to,
								onClick: () => setNavOpen(false),
								className: cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(l.icon, { className: "size-4" }), l.label]
							}, l.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: signOut,
						className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-64",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3.5 backdrop-blur lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setNavOpen(true),
							className: "mr-3 rounded-lg p-2 hover:bg-muted lg:hidden",
							"aria-label": "Open menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-lg font-bold",
							children: title
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/notifications",
						className: "relative rounded-full p-2 hover:bg-muted",
						"aria-label": "Notifications",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground",
							children: unread > 9 ? "9+" : unread
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-5xl px-4 pb-28 pt-5 lg:px-8 lg:pb-12",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur lg:hidden",
				children: TABS.map((t) => {
					const active = pathname === t.to;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: t.to,
						className: cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-5" }), t.label]
					}, t.to);
				})
			})
		]
	});
}
//#endregion
export { useProfile as a, useTransactions as c, useNotifications as i, useAccounts as n, useRecipients as o, useCards as r, useTickets as s, AppShell as t };
