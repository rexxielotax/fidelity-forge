import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { B as ArrowRight, E as CreditCard, P as ChartLine, p as Lock, s as Send } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ogwHm97i.js
var import_jsx_runtime = require_jsx_runtime();
var FEATURES = [
	{
		icon: Send,
		title: "Move money securely",
		body: "Transfer funds quickly and conveniently between your accounts."
	},
	{
		icon: CreditCard,
		title: "Manage your cards",
		body: "Manage your cards, monitor spending, and keep your accounts secure."
	},
	{
		icon: ChartLine,
		title: "Stay on top of your money",
		body: "View balances, review transactions, and manage your finances in one place."
	},
	{
		icon: Lock,
		title: "Bank with confidence",
		body: "Modern security features help protect your account and personal information."
	}
];
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-5xl items-center justify-between px-5 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display text-lg font-extrabold tracking-tight",
					children: ["Wellsfargo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "Bank"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					className: "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
					children: "Sign in"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-5xl px-5 pb-20 pt-14 text-center sm:pt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "inline-flex rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
						children: "Digital banking"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-6xl",
						children: [
							"Banking made simple.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Secure. Built around you."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg",
						children: "Manage your money with secure online banking. View your accounts, transfer funds, manage your cards, and stay in control of your finances from anywhere."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/auth",
							className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
							children: ["Open an account", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							className: "inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted",
							children: "Sign in"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid max-w-5xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-4",
				children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/70 bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(feature.icon, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-sm font-semibold",
							children: feature.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6 text-muted-foreground",
							children: feature.body
						})
					]
				}, feature.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border px-5 py-6 text-center text-xs text-muted-foreground",
				children: "Wellspring Bank — Secure digital banking."
			})
		]
	});
}
//#endregion
export { Landing as component };
