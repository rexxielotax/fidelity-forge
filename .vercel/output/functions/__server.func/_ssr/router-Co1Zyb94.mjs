import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as supabase } from "./client-Bi0AQxVp.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Co1Zyb94.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DmoYCX9K.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$18 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Wellspring Bank — Simulated Banking Demo" },
			{
				name: "description",
				content: "Wellspring Bank is a fictional online banking demo with accounts, transfers, virtual cards and support — no real money involved."
			},
			{
				name: "author",
				content: "Wellspring Bank"
			},
			{
				property: "og:title",
				content: "Wellspring Bank — Simulated Banking Demo"
			},
			{
				property: "og:description",
				content: "A fictional banking web app for portfolio and learning purposes."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$18.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-center",
			richColors: true
		})]
	});
}
var $$splitComponentImporter$17 = () => import("./routes-ogwHm97i.mjs");
var Route$17 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Weellsfargo Bank — Digital Banking" },
		{
			name: "description",
			content: "Manage your accounts, transfer money, manage your cards, and stay in control of your finances with Wellsfargo Bank."
		},
		{
			property: "og:title",
			content: "Wellsfargo Bank — Digital Banking"
		},
		{
			property: "og:description",
			content: "Secure online banking designed to make managing your money simple."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./route-Di7iQBCH.mjs");
var Route$16 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./auth-Ds9aTPgL.mjs");
var Route$15 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — wellsfargo Bank" },
		{
			name: "description",
			content: "Sign in or create an account on the wellsfargo Bank."
		},
		{
			property: "og:title",
			content: "Sign in — wellsfargo Bank"
		},
		{
			property: "og:description",
			content: "Access your  wellsfargo Bank accounts."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./accounts-DrSMt8D7.mjs");
var Route$14 = createFileRoute("/_authenticated/accounts")({
	head: () => ({ meta: [
		{ title: "Accounts — Wellspring Bank" },
		{
			name: "description",
			content: "View your simulated checking and savings account balances and activity."
		},
		{
			property: "og:title",
			content: "Accounts — Wellspring Bank"
		},
		{
			property: "og:description",
			content: "Checking and savings balances and activity."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./cards-BeVt3TGl.mjs");
var Route$13 = createFileRoute("/_authenticated/cards")({
	head: () => ({ meta: [{ title: "Cards — Nirmal Bank" }, {
		name: "description",
		content: "Request and manage simulated bank cards."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./dashboard-DNiO4cFS.mjs");
var Route$12 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard — wellsfargo Bank" },
		{
			name: "description",
			content: "Your balances, quick actions and recent activity in wellsfargo Bank."
		},
		{
			property: "og:title",
			content: "Dashboard — wellsfargo Bank"
		},
		{
			property: "og:description",
			content: "Balances, quick actions and recent activity."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./deposit-CxRa3nkT.mjs");
var Route$11 = createFileRoute("/_authenticated/deposit")({
	head: () => ({ meta: [
		{ title: "Deposit — Nirmal Bank" },
		{
			name: "description",
			content: "Add funds to your account using a supported deposit method."
		},
		{
			property: "og:title",
			content: "Deposit — Nirmal Bank"
		},
		{
			property: "og:description",
			content: "Add funds to your account."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./more-d0yDg9AN.mjs");
var Route$10 = createFileRoute("/_authenticated/more")({
	head: () => ({ meta: [
		{ title: "More — Wellspring Bank" },
		{
			name: "description",
			content: "Beneficiaries, notifications, statements, settings and support shortcuts."
		},
		{
			property: "og:title",
			content: "More — Wellspring Bank"
		},
		{
			property: "og:description",
			content: "All your account shortcuts in one place."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./notifications-CXXQ49Ub.mjs");
var Route$9 = createFileRoute("/_authenticated/notifications")({
	head: () => ({ meta: [
		{ title: "Notifications — Wellspring Bank" },
		{
			name: "description",
			content: "Transaction, security and system alerts for your Wellspring Bank account."
		},
		{
			property: "og:title",
			content: "Notifications — Wellspring Bank"
		},
		{
			property: "og:description",
			content: "Transaction, security and system alerts."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./settings-BmjoGlDB.mjs");
var Route$8 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings — wellsfargo Bank" },
		{
			name: "description",
			content: "Update your profile, currency preference and notification settings."
		},
		{
			property: "og:title",
			content: "Settings — wellsfargo Bank"
		},
		{
			property: "og:description",
			content: "Profile, currency and notification preferences."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./support-B5UvFBe7.mjs");
var Route$7 = createFileRoute("/_authenticated/support")({
	head: () => ({ meta: [
		{ title: "Support — Wellspring Bank" },
		{
			name: "description",
			content: "Open a support ticket and track replies from the Wellspring Bank team."
		},
		{
			property: "og:title",
			content: "Support — Wellspring Bank"
		},
		{
			property: "og:description",
			content: "Open a ticket and track replies."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./transactions-gTHxKcnw.mjs");
var Route$6 = createFileRoute("/_authenticated/transactions")({
	head: () => ({ meta: [
		{ title: "Transactions — Wellspring Bank" },
		{
			name: "description",
			content: "Search your full transaction history and download PDF receipts."
		},
		{
			property: "og:title",
			content: "Transactions — Wellspring Bank"
		},
		{
			property: "og:description",
			content: "Full transaction history with downloadable receipts."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./transfer-DcOr2jxM.mjs");
var Route$5 = createFileRoute("/_authenticated/transfer")({
	head: () => ({ meta: [
		{ title: "Transfer money — Wellspring Bank" },
		{
			name: "description",
			content: "Send a simulated transfer in four steps: details, review, confirm, complete."
		},
		{
			property: "og:title",
			content: "Transfer money — Wellspring Bank"
		},
		{
			property: "og:description",
			content: "Send a simulated transfer to any beneficiary."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./card-requests-B0RVmHD9.mjs");
var Route$4 = createFileRoute("/admin/card-requests")({
	head: () => ({ meta: [{ title: "Card Requests — Nirmal Bank Admin" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./dashboard-D7m4QUym.mjs");
var Route$3 = createFileRoute("/admin/dashboard")({
	head: () => ({ meta: [
		{ title: "Admin Console — Nirmal Bank" },
		{
			name: "description",
			content: "Manage simulated users, balances, transactions and support tickets."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./deposit-settings-WBQYABl7.mjs");
var Route$2 = createFileRoute("/admin/deposit-settings")({
	head: () => ({ meta: [{ title: "Deposit settings — Nirmal Bank Admin" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./login-Cg6jz8Vy.mjs");
var Route$1 = createFileRoute("/admin/login")({
	head: () => ({ meta: [
		{ title: "Admin sign in — wellsfargo Bank" },
		{
			name: "description",
			content: "Restricted administrator access for the wellsfargo Bank simulation."
		},
		{
			name: "robots",
			content: "noindex"
		},
		{
			property: "og:title",
			content: "Admin sign in — wellsfargo Bank"
		},
		{
			property: "og:description",
			content: "Restricted administrator access."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_userId-SIi5o0dK.mjs");
var Route = createFileRoute("/admin/users/$userId")({
	head: () => ({ meta: [{ title: "User details — wellsfargo Bank Admin" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var AuthenticatedRouteRoute = Route$16.update({
	id: "/_authenticated",
	getParentRoute: () => Route$18
});
var AuthRoute = Route$15.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$18
});
var AuthenticatedAccountsRoute = Route$14.update({
	id: "/accounts",
	path: "/accounts",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCardsRoute = Route$13.update({
	id: "/cards",
	path: "/cards",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$12.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDepositRoute = Route$11.update({
	id: "/deposit",
	path: "/deposit",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMoreRoute = Route$10.update({
	id: "/more",
	path: "/more",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotificationsRoute = Route$9.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$8.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSupportRoute = Route$7.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTransactionsRoute = Route$6.update({
	id: "/transactions",
	path: "/transactions",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTransferRoute = Route$5.update({
	id: "/transfer",
	path: "/transfer",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AdminCardRequestsRoute = Route$4.update({
	id: "/admin/card-requests",
	path: "/admin/card-requests",
	getParentRoute: () => Route$18
});
var AdminDashboardRoute = Route$3.update({
	id: "/admin/dashboard",
	path: "/admin/dashboard",
	getParentRoute: () => Route$18
});
var AdminDepositSettingsRoute = Route$2.update({
	id: "/admin/deposit-settings",
	path: "/admin/deposit-settings",
	getParentRoute: () => Route$18
});
var AdminLoginRoute = Route$1.update({
	id: "/admin/login",
	path: "/admin/login",
	getParentRoute: () => Route$18
});
var AdminUsersUserIdRoute = Route.update({
	id: "/admin/users/$userId",
	path: "/admin/users/$userId",
	getParentRoute: () => Route$18
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAccountsRoute,
	AuthenticatedCardsRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedDepositRoute,
	AuthenticatedMoreRoute,
	AuthenticatedNotificationsRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedSupportRoute,
	AuthenticatedTransactionsRoute,
	AuthenticatedTransferRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	AdminCardRequestsRoute,
	AdminDashboardRoute,
	AdminDepositSettingsRoute,
	AdminLoginRoute,
	AdminUsersUserIdRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter as n, router_exports as r, Route as t };
