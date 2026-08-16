import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useServerFn } from "./createSsrRpc-BlnPkaj8.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as ArrowRight, E as CreditCard, F as Building2, L as Bitcoin, M as Check, S as Eye, V as ArrowLeft, a as ShieldAlert, m as LockOpen, p as Lock, x as Gift, y as ImagePlus } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BpE9Czok.mjs";
import { a as DialogTitle, i as DialogHeader, l as StatusBadge, m as money, n as DialogContent, o as EmptyState, r as DialogDescription, s as ListSkeleton, t as Dialog } from "./bank-bits-Cqv1BNB-.mjs";
import { t as Input } from "./input-NvmijQlt.mjs";
import { t as Label } from "./label-AutfcB-T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DxHg2FK2.mjs";
import { a as useProfile, n as useAccounts, r as useCards, t as AppShell } from "./AppShell-DYDeX-F-.mjs";
import { t as TIER_FEES } from "./bank-helpers-o8oDwLmo.mjs";
import { l as setCardStatus, o as getCardPin, s as getMyCardRequests, t as createCardRequest } from "./bank.functions-DWPpV4Dr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cards-BeVt3TGl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIERS = [
	{
		key: "standard",
		title: "Standard",
		description: "Everyday spending and online purchases."
	},
	{
		key: "gold",
		title: "Gold",
		description: "Higher limits with a premium design."
	},
	{
		key: "platinum",
		title: "Platinum",
		description: "Premium simulated card with the highest limits."
	}
];
var PAYMENT_METHODS = [
	{
		key: "btc",
		title: "Bitcoin",
		description: "Simulated Bitcoin payment",
		icon: Bitcoin
	},
	{
		key: "usdt",
		title: "USDT",
		description: "Simulated USDT payment",
		icon: CreditCard
	},
	{
		key: "ethereum",
		title: "Ethereum",
		description: "Simulated Ethereum payment",
		icon: CreditCard
	},
	{
		key: "bank_transfer",
		title: "Bank Transfer",
		description: "Simulated bank transfer",
		icon: Building2
	},
	{
		key: "gift_card",
		title: "Gift Card",
		description: "Submit a gift-card image for admin review",
		icon: Gift
	}
];
function CardsPage() {
	const queryClient = useQueryClient();
	const { data: profile } = useProfile();
	const { data: accounts } = useAccounts();
	const { data: cards, isLoading } = useCards();
	const request = useServerFn(createCardRequest);
	const changeStatus = useServerFn(setCardStatus);
	const fetchPin = useServerFn(getCardPin);
	const loadRequests = useServerFn(getMyCardRequests);
	const requestsQuery = useQuery({
		queryKey: ["my-card-requests"],
		queryFn: () => loadRequests(),
		retry: false
	});
	const currency = profile?.currency ?? "USD";
	const [open, setOpen] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)(1);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [tier, setTier] = (0, import_react.useState)("standard");
	const [delivery, setDelivery] = (0, import_react.useState)("online");
	const [payment, setPayment] = (0, import_react.useState)("btc");
	const [giftCardType, setGiftCardType] = (0, import_react.useState)("steam");
	const [giftCardImage, setGiftCardImage] = (0, import_react.useState)("");
	const [accountId, setAccountId] = (0, import_react.useState)("");
	const [pins, setPins] = (0, import_react.useState)({});
	const selectedTier = TIER_FEES[tier];
	const selectedAccount = accountId || accounts?.[0]?.id || "";
	function resetRequest() {
		setStep(1);
		setTier("standard");
		setDelivery("online");
		setPayment("btc");
		setGiftCardType("steam");
		setGiftCardImage("");
		setAccountId("");
		setBusy(false);
	}
	function closeDialog() {
		setOpen(false);
		resetRequest();
	}
	function nextStep() {
		if (step === 1) return setStep(2);
		if (step === 2) return setStep(3);
		if (step === 3) return setStep(4);
	}
	function previousStep() {
		if (step === 1) return;
		setStep(step - 1);
	}
	async function submitRequest() {
		if (payment === "gift_card" && !giftCardImage) {
			toast.error("Upload the gift card image first");
			return;
		}
		setBusy(true);
		try {
			await request({ data: {
				accountId: selectedAccount || void 0,
				cardType: tier,
				deliveryType: delivery,
				paymentMethod: payment,
				giftCardType: payment === "gift_card" ? giftCardType : void 0,
				giftCardImageUrl: payment === "gift_card" ? giftCardImage : void 0
			} });
			toast.success("Card request submitted for review");
			await queryClient.invalidateQueries({ queryKey: ["my-card-requests"] });
			closeDialog();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to submit card request");
		} finally {
			setBusy(false);
		}
	}
	async function toggleLock(id, status) {
		try {
			await changeStatus({ data: {
				cardId: id,
				status: status === "active" ? "locked" : "active"
			} });
			await queryClient.invalidateQueries();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Update failed");
		}
	}
	async function reportLost(id) {
		try {
			await changeStatus({ data: {
				cardId: id,
				status: "lost"
			} });
			toast.success("Card reported and blocked");
			await queryClient.invalidateQueries();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Update failed");
		}
	}
	async function revealPin(id) {
		try {
			const result = await fetchPin({ data: { cardId: id } });
			setPins((current) => ({
				...current,
				[id]: result.pin
			}));
		} catch {
			toast.error("Could not reveal PIN");
		}
	}
	function handleGiftCardUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		if (![
			"image/jpeg",
			"image/png",
			"image/webp"
		].includes(file.type)) {
			toast.error("Use JPG, PNG, or WebP");
			return;
		}
		if (file.size > 5242880) {
			toast.error("Image must be smaller than 5MB");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => setGiftCardImage(String(reader.result));
		reader.readAsDataURL(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Cards",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-border/70 bg-card p-5 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
								children: "Card Center"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 font-display text-2xl font-bold",
								children: "Your cards"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xl text-sm text-muted-foreground",
								children: "View your simulated cards or request a new Standard, Gold, or Platinum card."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => {
								resetRequest();
								setOpen(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4" }), "Request a card"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mx-auto aspect-[1.586/1] w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 p-6 text-white shadow-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.2),transparent_35%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex h-full flex-col justify-between",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs uppercase tracking-[0.3em] text-white/60",
											children: "Nirmal Bank"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm font-medium",
											children: tier.toUpperCase()
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid size-12 place-items-center rounded-xl border border-white/20 bg-white/10",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-6" })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 h-9 w-12 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xl tracking-[0.18em] sm:text-2xl",
										children: "4539 •••• •••• 0000"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-end justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase text-white/50",
											children: "Card Holder"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium uppercase",
											children: profile?.full_name ?? "CARD HOLDER"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] uppercase text-white/50",
											children: "Expires"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs",
											children: "08/30"
										})] })]
									})
								]
							})]
						})
					})]
				}),
				(requestsQuery.data ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Card requests"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Track requests awaiting review."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3",
					children: (requestsQuery.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-semibold capitalize",
								children: [
									item.card_type,
									" ",
									item.delivery_type,
									" card"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									formatPaymentMethod(item.payment_method),
									" · ",
									new Date(item.created_at).toLocaleString()
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: item.status === "approved" ? "completed" : item.status === "rejected" ? "failed" : "pending" })]
						})
					}, item.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Issued cards"
					})
				}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 2 }) : (cards ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5" }),
					title: "No cards yet",
					description: "Request a card above to start the simulated card approval process.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							resetRequest();
							setOpen(true);
						},
						children: "Request a card"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: (cards ?? []).map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 p-5 text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.18),transparent_40%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs uppercase tracking-widest text-white/60",
												children: "Nirmal Bank"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs font-semibold uppercase",
												children: card.card_type
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-8 h-8 w-11 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-500" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-4 font-mono text-lg tracking-widest",
											children: card.masked_number
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-5 flex items-end justify-between text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "uppercase",
												children: card.holder_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: card.expiry })]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: ["Daily limit ", money(Number(card.daily_limit), currency)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: card.status })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => toggleLock(card.id, card.status),
										children: [card.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-4" }), card.status === "active" ? "Freeze" : "Unfreeze"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => revealPin(card.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), pins[card.id] ? `PIN ${pins[card.id]}` : "Show PIN"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										className: "text-destructive",
										onClick: () => reportLost(card.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" }), "Report lost"]
									})
								]
							})
						]
					}, card.id))
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: (value) => {
				if (!value) closeDialog();
				else setOpen(true);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90vh] max-w-lg overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display",
						children: "Request a card"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
						"Step ",
						step,
						" of 4"
					] })] }),
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "Choose your card"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Select the tier you want to request."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: TIERS.map((item) => {
									const fee = TIER_FEES[item.key]?.fee ?? 0;
									const limit = TIER_FEES[item.key]?.limit ?? 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setTier(item.key),
										className: `rounded-2xl border p-4 text-left transition ${tier === item.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold capitalize",
													children: item.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: item.description
												})] }), tier === item.key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid size-6 place-items-center rounded-full bg-primary text-primary-foreground",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 flex justify-between text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Daily limit"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: money(Number(limit), currency)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 flex justify-between text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Processing fee"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: money(Number(fee), currency)
												})]
											})
										]
									}, item.key);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "w-full",
								onClick: nextStep,
								children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "Choose card format"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Select whether this request is for an online or physical card."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceCard, {
									selected: delivery === "online",
									title: "Online Card",
									description: "For simulated online purchases.",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-6" }),
									onClick: () => setDelivery("online")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceCard, {
									selected: delivery === "physical",
									title: "Physical Card",
									description: "For a simulated physical-card request.",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-6" }),
									onClick: () => setDelivery("physical")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "flex-1",
									onClick: previousStep,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "flex-1",
									onClick: nextStep,
									children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								})]
							})
						]
					}),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "Choose payment method"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Select how the simulated card request should be paid."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-2",
								children: PAYMENT_METHODS.map((method) => {
									const Icon = method.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setPayment(method.key),
										className: `flex items-center gap-3 rounded-xl border p-4 text-left ${payment === method.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-10 shrink-0 place-items-center rounded-xl bg-muted",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block font-medium",
													children: method.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-xs text-muted-foreground",
													children: method.description
												})]
											}),
											payment === method.key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5 text-primary" })
										]
									}, method.key);
								})
							}),
							payment === "gift_card" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-muted/30 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: "Gift card details"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "Upload an image for admin review."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Gift card type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: giftCardType,
											onValueChange: setGiftCardType,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "steam",
													children: "Steam"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "amazon",
													children: "Amazon"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "apple",
													children: "Apple"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "google_play",
													children: "Google Play"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "other",
													children: "Other"
												})
											] })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "gift-card-image",
											className: "cursor-pointer",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 rounded-xl border border-dashed border-border p-6 text-center transition hover:bg-muted/50",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mx-auto size-7 text-muted-foreground" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-2 text-sm font-medium",
														children: giftCardImage ? "Image selected" : "Upload gift card image"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-1 text-xs text-muted-foreground",
														children: "JPG, PNG or WebP · Max 5MB"
													})
												]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "gift-card-image",
											type: "file",
											accept: "image/jpeg,image/png,image/webp",
											className: "hidden",
											onChange: handleGiftCardUpload
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Funding account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: selectedAccount,
									onValueChange: setAccountId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select account" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (accounts ?? []).map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: account.id,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "capitalize",
												children: account.type
											}),
											" ·",
											" ",
											money(Number(account.balance), currency)
										]
									}, account.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "flex-1",
									onClick: previousStep,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "flex-1",
									onClick: nextStep,
									children: ["Review", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								})]
							})
						]
					}),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "Review request"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Check everything before submitting."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "divide-y rounded-2xl border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
										label: "Card",
										value: tier,
										capitalize: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
										label: "Format",
										value: delivery,
										capitalize: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
										label: "Payment",
										value: formatPaymentMethod(payment)
									}),
									payment === "gift_card" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
										label: "Gift card",
										value: giftCardType,
										capitalize: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
										label: "Processing fee",
										value: money(Number(selectedTier?.fee ?? 0), currency)
									})
								]
							}),
							payment === "gift_card" && giftCardImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden rounded-2xl border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: giftCardImage,
									alt: "Selected gift card",
									className: "max-h-56 w-full object-contain bg-muted"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl bg-muted p-3 text-xs text-muted-foreground",
								children: "This is a simulated request. It will appear in the admin console for review."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "flex-1",
									onClick: previousStep,
									disabled: busy,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "flex-1",
									onClick: submitRequest,
									disabled: busy,
									children: busy ? "Submitting..." : "Submit request"
								})]
							})
						]
					})
				]
			})
		})]
	});
}
function ChoiceCard({ selected, title, description, icon, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: `rounded-2xl border p-5 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-11 place-items-center rounded-xl bg-muted",
					children: icon
				}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-6 place-items-center rounded-full bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: description
			})
		]
	});
}
function ReviewRow({ label, value, capitalize = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-right text-sm font-semibold ${capitalize ? "capitalize" : ""}`,
			children: value
		})]
	});
}
function formatPaymentMethod(method) {
	switch (method) {
		case "btc": return "Bitcoin";
		case "usdt": return "USDT";
		case "ethereum": return "Ethereum";
		case "bank_transfer": return "Bank Transfer";
		case "gift_card": return "Gift Card";
		default: return method;
	}
}
//#endregion
export { CardsPage as component };
