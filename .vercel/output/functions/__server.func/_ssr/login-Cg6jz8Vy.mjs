import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { o as adminLogin } from "./admin.functions-SlCZaNB0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Cg6jz8Vy.js
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const navigate = useNavigate();
	const login = useServerFn(adminLogin);
	async function enterAdmin() {
		try {
			await login();
			navigate({ to: "/admin/dashboard" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to enter admin panel");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-screen items-center justify-center bg-muted px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-3xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-lg font-bold",
					children: "Admin console"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "wellsfargo Bank · Restricted access"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				className: "w-full",
				onClick: enterAdmin,
				children: "Enter admin panel"
			})]
		})
	});
}
//#endregion
export { AdminLogin as component };
