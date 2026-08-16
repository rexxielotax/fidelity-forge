import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "./_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./_ssr/createSsrRpc-BlnPkaj8.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { V as ArrowLeft, i as ShieldCheck } from "./_libs/lucide-react.mjs";
import { t as Route } from "./_ssr/router-Co1Zyb94.mjs";
import { t as Button } from "./_ssr/button-BpE9Czok.mjs";
import { d as dateTime, l as StatusBadge, m as money } from "./_ssr/bank-bits-Cqv1BNB-.mjs";
import { t as Input } from "./_ssr/input-NvmijQlt.mjs";
import { t as Label } from "./_ssr/label-AutfcB-T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-DxHg2FK2.mjs";
import { a as adminGetUser, d as adminSetAccountBalance, p as adminUpdateUserProfile } from "./_ssr/admin.functions-SlCZaNB0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_userId-SIi5o0dK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CURRENCIES = [
	"USD",
	"EUR",
	"GBP",
	"NGN",
	"CAD"
];
function AdminUserDetails() {
	const { userId } = Route.useParams();
	const navigate = useNavigate();
	const load = useServerFn(adminGetUser);
	const updateProfile = useServerFn(adminUpdateUserProfile);
	const setBalance = useServerFn(adminSetAccountBalance);
	const query = useQuery({
		queryKey: ["admin-user", userId],
		queryFn: () => load({ data: { userId } }),
		retry: false
	});
	(0, import_react.useEffect)(() => {
		if (query.isError) navigate({ to: "/admin/dashboard" });
	}, [query.isError, navigate]);
	const data = query.data;
	const [profileForm, setProfileForm] = (0, import_react.useState)({
		full_name: "",
		phone: "",
		address: "",
		city: "",
		country: "",
		currency: "USD",
		date_of_birth: "",
		notify_email: true,
		notify_push: true
	});
	const [balanceDrafts, setBalanceDrafts] = (0, import_react.useState)({});
	const [savingProfile, setSavingProfile] = (0, import_react.useState)(false);
	const [savingAccount, setSavingAccount] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!data?.profile) return;
		setProfileForm({
			full_name: data.profile.full_name ?? "",
			phone: data.profile.phone ?? "",
			address: data.profile.address ?? "",
			city: data.profile.city ?? "",
			country: data.profile.country ?? "",
			currency: data.profile.currency ?? "USD",
			date_of_birth: data.profile.date_of_birth ?? "",
			notify_email: data.profile.notify_email,
			notify_push: data.profile.notify_push
		});
		setBalanceDrafts(Object.fromEntries((data.accounts ?? []).map((a) => [a.id, String(a.balance)])));
	}, [data?.profile, data?.accounts]);
	async function saveProfile() {
		setSavingProfile(true);
		try {
			await updateProfile({ data: {
				userId,
				...profileForm,
				date_of_birth: profileForm.date_of_birth || null
			} });
			toast.success("Profile updated");
			query.refetch();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Update failed");
		} finally {
			setSavingProfile(false);
		}
	}
	async function saveBalance(accountId) {
		setSavingAccount(accountId);
		try {
			await setBalance({ data: {
				accountId,
				balance: Number(balanceDrafts[accountId])
			} });
			toast.success("Balance updated");
			query.refetch();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Update failed");
		} finally {
			setSavingAccount(null);
		}
	}
	if (query.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground",
		children: "Loading user…"
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-muted/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex max-w-4xl items-center justify-between px-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => navigate({ to: "/admin/dashboard" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-base font-bold",
							children: data.profile.full_name || data.profile.email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: data.profile.email
						})] })
					]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-4xl space-y-6 px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/70 bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: "Profile"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Email is managed by Supabase Auth and can't be edited here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: profileForm.full_name,
										onChange: (e) => setProfileForm((f) => ({
											...f,
											full_name: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: profileForm.phone,
										onChange: (e) => setProfileForm((f) => ({
											...f,
											phone: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: profileForm.address,
										onChange: (e) => setProfileForm((f) => ({
											...f,
											address: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "City" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: profileForm.city,
										onChange: (e) => setProfileForm((f) => ({
											...f,
											city: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: profileForm.country,
										onChange: (e) => setProfileForm((f) => ({
											...f,
											country: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date of birth" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: profileForm.date_of_birth ?? "",
										onChange: (e) => setProfileForm((f) => ({
											...f,
											date_of_birth: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Currency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: profileForm.currency,
										onValueChange: (v) => setProfileForm((f) => ({
											...f,
											currency: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c,
											children: c
										}, c)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-4 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: profileForm.notify_email,
											onChange: (e) => setProfileForm((f) => ({
												...f,
												notify_email: e.target.checked
											})),
											className: "size-4 rounded border-input"
										}), "Email notifications"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: profileForm.notify_push,
											onChange: (e) => setProfileForm((f) => ({
												...f,
												notify_push: e.target.checked
											})),
											className: "size-4 rounded border-input"
										}), "Push notifications"]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							onClick: saveProfile,
							disabled: savingProfile,
							children: savingProfile ? "Saving…" : "Save profile"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/70 bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base font-semibold",
						children: "Accounts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [data.accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-end sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold capitalize",
									children: a.type
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["•••• ", a.account_number.slice(-4)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Current: ", money(Number(a.balance), profileForm.currency)]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "New balance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										step: "0.01",
										className: "w-36",
										value: balanceDrafts[a.id] ?? "",
										onChange: (e) => setBalanceDrafts((d) => ({
											...d,
											[a.id]: e.target.value
										}))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => saveBalance(a.id),
									disabled: savingAccount === a.id,
									children: savingAccount === a.id ? "Saving…" : "Save"
								})]
							})]
						}, a.id)), data.accounts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No accounts found for this user."
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/70 bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base font-semibold",
						children: "Recent activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-2",
						children: [data.transactions.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs text-muted-foreground",
								children: t.reference
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs capitalize text-muted-foreground",
								children: [
									t.category,
									" · ",
									dateTime(t.created_at)
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: money(Number(t.amount), profileForm.currency)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: t.status })]
							})]
						}, t.id)), data.transactions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No transactions yet."
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
export { AdminUserDetails as component };
