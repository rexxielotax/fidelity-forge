import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { O as CircleAlert, f as LogOut, i as ShieldCheck, l as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-BpE9Czok.mjs";
import { d as dateTime, l as StatusBadge, m as money } from "./bank-bits-Cqv1BNB-.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { f as adminSetTransactionStatus, l as adminReplyTicket, n as adminCredit, r as adminData, s as adminLogout, u as adminSendPasswordReset } from "./admin.functions-SlCZaNB0.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-D7m4QUym.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var TX_FILTERS = [
	"all",
	"deposit",
	"transfer",
	"card_fee",
	"admin_adjustment"
];
var TX_FILTER_LABEL = {
	all: "All",
	deposit: "Deposits",
	transfer: "Transfers",
	card_fee: "Card Fees",
	admin_adjustment: "Adjustments"
};
function AdminDashboard() {
	const navigate = useNavigate();
	const loadAdminData = useServerFn(adminData);
	const creditAccount = useServerFn(adminCredit);
	const changeTransactionStatus = useServerFn(adminSetTransactionStatus);
	const replyTicket = useServerFn(adminReplyTicket);
	const sendPasswordReset = useServerFn(adminSendPasswordReset);
	const logoutAdmin = useServerFn(adminLogout);
	const [creditForm, setCreditForm] = (0, import_react.useState)({
		userId: "",
		accountType: "checking",
		amount: "",
		note: ""
	});
	const [replies, setReplies] = (0, import_react.useState)({});
	const [txFilter, setTxFilter] = (0, import_react.useState)("all");
	const [loggingOut, setLoggingOut] = (0, import_react.useState)(false);
	const [actionId, setActionId] = (0, import_react.useState)(null);
	const query = useQuery({
		queryKey: ["admin-dashboard"],
		queryFn: async () => {
			return await loadAdminData();
		},
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		staleTime: 3e4,
		gcTime: 3e5
	});
	const data = query.data;
	const isInitialLoading = query.isPending && !query.data;
	const isRefreshing = query.isFetching && !!query.data;
	const stats = (0, import_react.useMemo)(() => {
		const profiles = data?.profiles ?? [];
		const accounts = data?.accounts ?? [];
		const transactions = data?.transactions ?? [];
		const tickets = data?.tickets ?? [];
		const totalBalance = accounts.reduce((total, account) => total + Number(account.balance ?? 0), 0);
		const pendingDeposits = transactions.filter((transaction) => transaction.status === "pending" && transaction.category === "deposit").length;
		const pendingTransfers = transactions.filter((transaction) => transaction.status === "pending" && transaction.category === "transfer").length;
		const openTickets = tickets.filter((ticket) => ticket.status !== "resolved").length;
		return {
			users: profiles.length,
			balance: totalBalance,
			pendingDeposits,
			pendingTransfers,
			tickets: openTickets
		};
	}, [data]);
	const filteredTransactions = (0, import_react.useMemo)(() => {
		const transactions = data?.transactions ?? [];
		if (txFilter === "all") return transactions;
		return transactions.filter((transaction) => transaction.category === txFilter);
	}, [data?.transactions, txFilter]);
	async function runAction(id, fn, successMessage) {
		if (actionId) return;
		setActionId(id);
		try {
			await fn();
			toast.success(successMessage);
			await query.refetch();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Action failed";
			toast.error(message);
		} finally {
			setActionId(null);
		}
	}
	async function handleLogout() {
		if (loggingOut) return;
		setLoggingOut(true);
		try {
			await logoutAdmin();
			navigate({
				to: "/admin/login",
				replace: true
			});
		} catch (error) {
			setLoggingOut(false);
			toast.error(error instanceof Error ? error.message : "Unable to sign out");
		}
	}
	async function handleCredit() {
		if (actionId) return;
		if (!creditForm.userId) {
			toast.error("Select a user");
			return;
		}
		const amount = Number(creditForm.amount);
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		await runAction("credit-account", () => creditAccount({ data: {
			userId: creditForm.userId,
			accountType: creditForm.accountType,
			amount,
			note: creditForm.note.trim()
		} }), "Account credited successfully");
		setCreditForm({
			userId: "",
			accountType: "checking",
			amount: "",
			note: ""
		});
	}
	if (isInitialLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-muted/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mx-auto size-7 animate-spin text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-lg font-bold",
						children: "Loading admin console"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Please wait..."
					})
				]
			})
		})
	});
	if (query.isError && !data) {
		const errorMessage = query.error instanceof Error ? query.error.message : "Unable to load the admin dashboard.";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "min-h-screen bg-muted/40",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "border-b border-border bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-base font-bold",
								children: "Admin Console"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Nirmal Bank"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: handleLogout,
							disabled: loggingOut,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), loggingOut ? "Signing out..." : "Sign out"]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => navigate({ to: "/admin/deposit-settings" }),
					children: "Deposit Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-2xl px-4 py-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-destructive/30 bg-card p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-lg font-bold",
										children: "Unable to load admin data"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: "The admin data request failed. The dashboard has not redirected automatically."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 rounded-xl bg-muted p-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "break-words font-mono text-xs",
											children: errorMessage
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											onClick: () => query.refetch(),
											disabled: query.isFetching,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${query.isFetching ? "animate-spin" : ""}` }), "Try again"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "secondary",
											onClick: () => navigate({
												to: "/admin/login",
												replace: true
											}),
											children: "Back to login"
										})]
									})
								]
							})]
						})
					})
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-muted/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-base font-bold",
						children: "Admin Console"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Nirmal Bank"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						isRefreshing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), "Updating"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => query.refetch(),
							disabled: query.isFetching,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${query.isFetching ? "animate-spin" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Refresh"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: handleLogout,
							disabled: loggingOut,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: loggingOut ? "Signing out..." : "Sign out"
							})]
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-6",
			children: [
				query.isError && data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-5 shrink-0 text-destructive" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Latest refresh failed"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 break-words text-xs text-muted-foreground",
								children: query.error instanceof Error ? query.error.message : "Unable to refresh admin data."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "ml-auto shrink-0",
							size: "sm",
							variant: "secondary",
							onClick: () => query.refetch(),
							children: "Retry"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Users",
							value: String(stats.users)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Total balances",
							value: money(stats.balance, "USD")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Pending deposits",
							value: String(stats.pendingDeposits)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Pending transfers",
							value: String(stats.pendingTransfers)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Open tickets",
							value: String(stats.tickets)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "users",
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "users",
									children: "Users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "transactions",
									children: "Transactions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "tickets",
									children: "Tickets"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "audit",
									children: "Audit Log"
								})
							] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "users",
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-2xl border border-border/70 bg-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base font-semibold",
									children: "Credit an account"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Add funds to a user's checking or savings account."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 lg:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "User" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: creditForm.userId,
												onValueChange: (value) => setCreditForm((current) => ({
													...current,
													userId: value
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select user" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (data?.profiles ?? []).map((profile) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: profile.id,
													children: profile.full_name || profile.email || profile.id
												}, profile.id)) })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: creditForm.accountType,
												onValueChange: (value) => setCreditForm((current) => ({
													...current,
													accountType: value
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "checking",
													children: "Checking"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "savings",
													children: "Savings"
												})] })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: "0",
												step: "0.01",
												placeholder: "0.00",
												value: creditForm.amount,
												onChange: (event) => setCreditForm((current) => ({
													...current,
													amount: event.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 sm:col-span-2 lg:col-span-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Note" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Optional note",
												value: creditForm.note,
												onChange: (event) => setCreditForm((current) => ({
													...current,
													note: event.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-end",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "w-full",
												disabled: !!actionId || !creditForm.userId || !creditForm.amount || !Number.isFinite(Number(creditForm.amount)) || Number(creditForm.amount) <= 0,
												onClick: handleCredit,
												children: actionId === "credit-account" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }), "Crediting..."] }) : "Credit Account"
											})
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "overflow-hidden rounded-2xl border border-border/70 bg-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
											className: "bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Email"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Balances"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Actions"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (data?.profiles ?? []).map((profile) => {
											const balance = (data?.accounts ?? []).filter((account) => account.user_id === profile.id).reduce((total, account) => total + Number(account.balance ?? 0), 0);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-t border-border/60",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3 font-medium",
														children: profile.full_name || "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3 text-muted-foreground",
														children: profile.email || "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: money(balance, profile.currency || "USD")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex flex-wrap gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																onClick: () => navigate({
																	to: "/admin/users/$userId",
																	params: { userId: profile.id }
																}),
																children: "View Details"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																variant: "secondary",
																disabled: !!actionId,
																onClick: () => runAction(`reset-${profile.id}`, () => sendPasswordReset({ data: {
																	email: profile.email,
																	redirectTo: `${window.location.origin}/auth`
																} }), "Password reset link sent"),
																children: "Send Reset Link"
															})]
														})
													})
												]
											}, profile.id);
										}) })]
									})
								}), (data?.profiles ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyTable, { message: "No users found." })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "transactions",
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: TX_FILTERS.map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setTxFilter(filter),
									className: `rounded-full px-3 py-1.5 text-xs font-medium transition ${txFilter === filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`,
									children: TX_FILTER_LABEL[filter]
								}, filter))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "overflow-hidden rounded-2xl border border-border/70 bg-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
											className: "bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Reference"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Category"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Amount"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Recipient / Description"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-4 py-3",
													children: "Change Status"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredTransactions.map((transaction) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t border-border/60",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-mono text-xs",
													children: transaction.reference
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize",
														children: transaction.category
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 whitespace-nowrap",
													children: money(Number(transaction.amount ?? 0), "USD")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "max-w-xs px-4 py-3 text-muted-foreground",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "truncate",
														children: transaction.recipient_name || transaction.description || "—"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: transaction.status })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: transaction.status,
														disabled: !!actionId,
														onValueChange: (value) => runAction(`tx-${transaction.id}`, () => changeTransactionStatus({ data: {
															transactionId: transaction.id,
															status: value
														} }), "Transaction status updated"),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "w-36",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
															"pending",
															"completed",
															"failed",
															"cancelled"
														].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: status,
															children: status
														}, status)) })]
													})
												})
											]
										}, transaction.id)) })]
									})
								}), filteredTransactions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyTable, { message: "No transactions in this category." })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "tickets",
							className: "space-y-3",
							children: [(data?.tickets ?? []).map((ticket) => {
								const reply = replies[ticket.id] ?? ticket.admin_reply ?? "";
								const replyActionId = `reply-${ticket.id}`;
								const resolveActionId = `resolve-${ticket.id}`;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "rounded-2xl border border-border/70 bg-card p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold",
												children: ticket.subject
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-xs capitalize text-muted-foreground",
												children: [
													ticket.category,
													" ·",
													" ",
													dateTime(ticket.created_at)
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: ticket.status === "in_progress" ? "pending" : ticket.status === "resolved" ? "completed" : "pending" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 rounded-xl bg-muted/60 p-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm whitespace-pre-wrap text-muted-foreground",
												children: ticket.message
											})
										}),
										ticket.admin_reply && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-wide",
												children: "Admin Reply"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm whitespace-pre-wrap",
												children: ticket.admin_reply
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											className: "mt-3",
											rows: 3,
											placeholder: "Write a reply...",
											value: reply,
											onChange: (event) => setReplies((current) => ({
												...current,
												[ticket.id]: event.target.value
											}))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												disabled: !!actionId || !reply.trim(),
												onClick: () => runAction(replyActionId, () => replyTicket({ data: {
													ticketId: ticket.id,
													reply: reply.trim(),
													status: "in_progress"
												} }), "Reply sent"),
												children: actionId === replyActionId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }), "Sending..."] }) : "Reply"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: !!actionId,
												onClick: () => runAction(resolveActionId, () => replyTicket({ data: {
													ticketId: ticket.id,
													reply: reply.trim() || "Resolved.",
													status: "resolved"
												} }), "Ticket resolved"),
												children: actionId === resolveActionId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }), "Resolving..."] }) : "Resolve"
											})]
										})
									]
								}, ticket.id);
							}), (data?.tickets ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground",
								children: "No support tickets."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "audit",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-2",
								children: [(data?.actions ?? []).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl border border-border/70 bg-card px-4 py-3 text-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: action.action
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [
												" ",
												"by",
												" ",
												action.admin_email
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: dateTime(action.created_at)
										})]
									})
								}, action.id)), (data?.actions ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground",
									children: "No audit records."
								})]
							})
						})
					]
				})
			]
		})]
	});
}
function StatCard({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/70 bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-xl font-bold",
			children: value
		})]
	});
}
function EmptyTable({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 py-8 text-center text-sm text-muted-foreground",
		children: message
	});
}
//#endregion
export { AdminDashboard as component };
