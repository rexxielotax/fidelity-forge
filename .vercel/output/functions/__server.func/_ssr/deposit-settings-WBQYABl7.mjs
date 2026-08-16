import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { V as ArrowLeft, i as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { h as updateDepositSetting, m as getDepositSettings } from "./admin.functions-SlCZaNB0.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deposit-settings-WBQYABl7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var METHOD_TITLE = {
	paypal: "PayPal",
	cashapp: "Cash App",
	bank_transfer: "Bank Transfer",
	usdt: "USDT",
	btc: "Bitcoin"
};
function DepositSettingsAdmin() {
	const navigate = useNavigate();
	const load = useServerFn(getDepositSettings);
	const save = useServerFn(updateDepositSetting);
	const query = useQuery({
		queryKey: ["admin-deposit-settings"],
		queryFn: () => load(),
		retry: false
	});
	const [drafts, setDrafts] = (0, import_react.useState)({});
	const [savingKey, setSavingKey] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (query.isError) navigate({ to: "/admin/dashboard" });
	}, [query.isError, navigate]);
	(0, import_react.useEffect)(() => {
		if (!query.data) return;
		setDrafts(Object.fromEntries(query.data.map((row) => [`${row.method}:${row.field_key}`, {
			fieldValue: row.field_value,
			notice: row.notice ?? ""
		}])));
	}, [query.data]);
	const grouped = (query.data ?? []).reduce((acc, row) => {
		const existing = acc[row.method] ?? [];
		acc[row.method] = [...existing, row];
		return acc;
	}, {});
	async function saveField(row) {
		const key = `${row.method}:${row.field_key}`;
		const draft = drafts[key];
		if (!draft) return;
		setSavingKey(key);
		try {
			await save({ data: {
				method: row.method,
				fieldKey: row.field_key,
				fieldLabel: row.field_label,
				fieldValue: draft.fieldValue,
				description: row.description ?? "",
				notice: draft.notice
			} });
			toast.success(`${row.field_label} updated`);
			await query.refetch();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Update failed");
		} finally {
			setSavingKey(null);
		}
	}
	if (query.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground",
		children: "Loading deposit settings…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-muted/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl items-center gap-3 px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => navigate({ to: "/admin/dashboard" }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-base font-bold",
						children: "Deposit method settings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Simulated values shown on the user Deposit page."
					})] })
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-3xl space-y-6 px-4 py-6",
			children: Object.entries(grouped).map(([method, rows]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border/70 bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base font-semibold",
					children: METHOD_TITLE[method] ?? method
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-4",
					children: rows.map((row) => {
						const key = `${row.method}:${row.field_key}`;
						const draft = drafts[key];
						if (!draft) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 rounded-xl border border-border/60 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: row.field_label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: draft.fieldValue,
										onChange: (e) => setDrafts((d) => ({
											...d,
											[key]: {
												...draft,
												fieldValue: e.target.value
											}
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notice shown to users" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: draft.notice,
										onChange: (e) => setDrafts((d) => ({
											...d,
											[key]: {
												...draft,
												notice: e.target.value
											}
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => saveField(row),
									disabled: savingKey === key,
									children: savingKey === key ? "Saving…" : "Save"
								})
							]
						}, row.id);
					})
				})]
			}, method))
		})]
	});
}
//#endregion
export { DepositSettingsAdmin as component };
