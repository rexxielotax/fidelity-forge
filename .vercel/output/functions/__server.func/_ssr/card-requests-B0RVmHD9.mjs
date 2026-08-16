import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as CreditCard, M as Check, S as Eye, i as ShieldCheck, l as RefreshCw, t as X } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { l as StatusBadge } from "./bank-bits-Cqv1BNB-.mjs";
import { c as adminRejectCardRequest, i as adminGetCardRequests, t as adminApproveCardRequest } from "./admin.functions-SlCZaNB0.mjs";
import { t as Textarea } from "./textarea-Cp94w9lz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-requests-B0RVmHD9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminCardRequests() {
	const queryClient = useQueryClient();
	const load = useServerFn(adminGetCardRequests);
	const approve = useServerFn(adminApproveCardRequest);
	const reject = useServerFn(adminRejectCardRequest);
	const query = useQuery({
		queryKey: ["admin-card-requests"],
		queryFn: () => load(),
		retry: false
	});
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	async function handleApprove(id) {
		setBusyId(id);
		try {
			await approve({ data: {
				requestId: id,
				note: note.trim()
			} });
			toast.success("Card request approved");
			setSelected(null);
			setNote("");
			await queryClient.invalidateQueries({ queryKey: ["admin-card-requests"] });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Approval failed");
		} finally {
			setBusyId(null);
		}
	}
	async function handleReject(id) {
		setBusyId(id);
		try {
			await reject({ data: {
				requestId: id,
				note: note.trim()
			} });
			toast.success("Card request rejected");
			setSelected(null);
			setNote("");
			await queryClient.invalidateQueries({ queryKey: ["admin-card-requests"] });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Rejection failed");
		} finally {
			setBusyId(null);
		}
	}
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-muted/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex min-h-screen max-w-6xl items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-6 animate-spin" })
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-muted/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display font-bold",
						children: "Card Requests"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Nirmal Bank Admin"
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold",
							children: "Requests"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Review submitted simulated card requests."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => query.refetch(),
							disabled: query.isFetching,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${query.isFetching ? "animate-spin" : ""}` }), "Refresh"]
						})]
					}),
					query.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-destructive/30 bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "Unable to load requests"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: query.error instanceof Error ? query.error.message : "Unknown error"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3",
						children: (query.data ?? []).map((request) => {
							const profile = request.profiles;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-2xl border border-border/70 bg-card p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-11 shrink-0 place-items-center rounded-xl bg-muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold capitalize",
												children: [
													request.card_type,
													" ",
													request.delivery_type,
													" card"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm",
												children: profile?.full_name ?? "Unknown customer"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: profile?.email ?? "No email"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-xs text-muted-foreground",
												children: ["Payment: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium",
													children: formatPayment(request.payment_method)
												})]
											})
										] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: request.status === "approved" ? "completed" : request.status === "rejected" ? "failed" : "pending" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												setSelected(request);
												setNote(request.admin_note ?? "");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), "View"]
										})]
									})]
								})
							}, request.id);
						})
					}),
					(query.data ?? []).length === 0 && !query.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-10 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "mx-auto size-8 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-semibold",
								children: "No card requests"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "New requests will appear here."
							})
						]
					})
				]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: "Card request"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mt-1 font-display text-xl font-bold capitalize",
								children: [
									selected.card_type,
									" ",
									selected.delivery_type
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => setSelected(null),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Customer",
									value: selected.profiles?.full_name ?? "Unknown"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Email",
									value: selected.profiles?.email ?? "Unknown"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Card",
									value: `${selected.card_type} / ${selected.delivery_type}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Payment",
									value: formatPayment(selected.payment_method)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Fee",
									value: `$${Number(selected.amount ?? 0).toFixed(2)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									label: "Status",
									value: selected.status
								})
							]
						}),
						selected.payment_method === "gift_card" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Gift Card"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground capitalize",
									children: selected.gift_card_type ?? "Unknown"
								}),
								selected.gift_card_image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 overflow-hidden rounded-2xl border bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: selected.gift_card_image_url,
										alt: "Submitted gift card",
										className: "max-h-[420px] w-full object-contain"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Admin note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "mt-2",
								rows: 4,
								placeholder: "Optional note...",
								value: note,
								onChange: (event) => setNote(event.target.value)
							})]
						}),
						selected.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1",
								disabled: busyId === selected.id,
								onClick: () => handleApprove(selected.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), busyId === selected.id ? "Processing..." : "Approve"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "destructive",
								className: "flex-1",
								disabled: busyId === selected.id,
								onClick: () => handleReject(selected.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), "Reject"]
							})]
						})
					]
				})
			})
		]
	});
}
function Info({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-muted/50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] uppercase tracking-widest text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm font-medium",
			children: value
		})]
	});
}
function formatPayment(value) {
	switch (value) {
		case "btc": return "Bitcoin";
		case "usdt": return "USDT";
		case "ethereum": return "Ethereum";
		case "bank_transfer": return "Bank Transfer";
		case "gift_card": return "Gift Card";
		default: return value;
	}
}
//#endregion
export { AdminCardRequests as component };
