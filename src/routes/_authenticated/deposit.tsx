import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createDeposit, finalizeDeposit, getPublicDepositSettings, type DepositMethod } from "@/lib/bank.functions";
import {
  Check,
  ChevronRight,
  Landmark,
  CreditCard,
  Bitcoin,
  Loader2,
  AlertCircle,
  Wallet,
  Copy,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState, StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAccounts, useProfile } from "@/hooks/useBank";
import { money } from "@/lib/format";


import { downloadReceipt } from "@/lib/receipt";

export const Route = createFileRoute("/_authenticated/deposit")({
  head: () => ({
    meta: [
      {
        title: "Deposit — Nirmal Bank",
      },
      {
        name: "description",
        content:
          "Add funds to your account using a supported deposit method.",
      },
      {
        property: "og:title",
        content: "Deposit — Nirmal Bank",
      },
      {
        property: "og:description",
        content: "Add funds to your account.",
      },
    ],
  }),

  component: DepositPage,
});

const STEPS = [
  "Method",
  "Review",
  "Confirm",
  "Complete",
] as const;

const METHODS = [
  {
    id: "paypal",
    label: "PayPal",
    icon: Wallet,
    hint: "Simulated PayPal deposit",
  },
  {
    id: "cashapp",
    label: "Cash App",
    icon: CreditCard,
    hint: "Simulated Cash App deposit",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    icon: Landmark,
    hint: "Simulated bank transfer",
  },
  {
    id: "crypto",
    label: "Crypto",
    icon: Bitcoin,
    hint: "Bitcoin & USDT",
  },
] as const;

type MethodId = (typeof METHODS)[number]["id"];

type CryptoMethod = "usdt" | "btc";

type SelectedMethod = MethodId | CryptoMethod;

const METHOD_INFO: Record<MethodId, string> = {
  paypal:
    "Use the  PayPal account details below to complete your deposit. No real PayPal transaction is performed.",

  cashapp:
    "Use the  Cash App details below. This demo does not connect to Cash App or process real payments.",

  bank_transfer:
    "Use the  bank transfer details below. No real bank transfer is initiated by this application.",

  crypto:
    "Choose Bitcoin or USDT below. This demo does not connect to a blockchain or process real cryptocurrency.",
};

const DEPOSIT_DETAILS = {
  paypal: {
    title: "PayPal Deposit Details",

    description:
      "Send your  deposit to the PayPal account below.",

    fields: [
      {
        label: "PayPal account",
        value: "demo-paypal@nirmalbank.test",
      },
      {
        label: "Account name",
        value: "Nirmal Bank Demo",
      },
    ],

    notice:
      "Demo only — this PayPal account is not a real receiving account.",
  },

  cashapp: {
    title: "Cash App Deposit Details",

    description:
      "Use the simulated Cash App details below.",

    fields: [
      {
        label: "Cash App",
        value: "$NirmalBankDemo",
      },
      {
        label: "Account name",
        value: "Nirmal Bank Demo",
      },
    ],

    notice:
      "Demo only — this Cash App identifier is not connected to a real account.",
  },

  bank_transfer: {
    title: "Bank Transfer Details",

    description:
      "Use these simulated banking details when making your demo transfer.",

    fields: [
      {
        label: "Bank name",
        value: "Nirmal Bank — Demo",
      },
      {
        label: "Account name",
        value: "Nirmal Bank Demo Account",
      },
      {
        label: "Account number",
        value: "0000000000",
      },
      {
        label: "Routing number",
        value: "000000000",
      },
      {
        label: "SWIFT / BIC",
        value: "DEMONGB0XXX",
      },
    ],

    notice:
      "Demo only — these banking details are placeholders and cannot receive real funds.",
  },

  usdt: {
    title: "USDT Deposit",

    description:
      "Select the network and use the simulated deposit address.",

    fields: [
      {
        label: "Network",
        value: "TRC20",
      },
      {
        label: "USDT address",
        value: "DEMO-USDT-TRC20-ADDRESS",
      },
    ],

    notice:
      "Demo only — this is not a real blockchain address. Do not send real cryptocurrency to it.",
  },

  btc: {
    title: "Bitcoin Deposit",

    description:
      "Use the simulated Bitcoin deposit address below.",

    fields: [
      {
        label: "Network",
        value: "Bitcoin",
      },
      {
        label: "BTC address",
        value: "DEMO-BTC-ADDRESS",
      },
    ],

    notice:
      "Demo only — this is not a real Bitcoin address. Do not send real cryptocurrency to it.",
  },
} as const;

function DepositPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: profile } = useProfile();

  const { data: accounts } = useAccounts();

  const send = useServerFn(createDeposit);

  const finalize = useServerFn(finalizeDeposit);

  const loadDepositSettings = useServerFn(getPublicDepositSettings);

  const settingsQuery = useQuery({
    queryKey: ["public-deposit-settings"],
    queryFn: () => loadDepositSettings(),
  });

  const currency = profile?.currency ?? "USD";

  const [step, setStep] = useState(0);

  const [busy, setBusy] = useState(false);

  const [settling, setSettling] = useState(false);

  const [errorBanner, setErrorBanner] =
    useState<string | null>(null);

  const [tx, setTx] = useState<
    Awaited<ReturnType<typeof createDeposit>> | null
  >(null);

  const [copied, setCopied] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    accountId: "",

    method: "" as "" | MethodId,

    cryptoMethod: "" as "" | CryptoMethod,

    amount: "",
  });

  /*
   * Use the selected account.
   * If no account has been selected yet,
   * automatically use the first account.
   */
  const accountId =
    form.accountId ||
    accounts?.[0]?.id ||
    "";

  const account = (accounts ?? []).find(
    (a) => a.id === accountId,
  );

  const selectedMethod = METHODS.find(
    (m) => m.id === form.method,
  );

  const selectedCrypto =
    form.method === "crypto"
      ? form.cryptoMethod
      : "";

  const activeDepositMethod:
    | SelectedMethod
    | "" =
    form.method === "crypto"
      ? form.cryptoMethod
      : form.method;

  const settingsRows = settingsQuery.data ?? [];

  const dynamicFields =
    activeDepositMethod
      ? settingsRows
          .filter((row) => row.method === activeDepositMethod)
          .map((row) => ({ label: row.field_label, value: row.field_value }))
      : [];

  const dynamicNotice =
    activeDepositMethod
      ? settingsRows.find(
          (row) => row.method === activeDepositMethod && row.notice,
        )?.notice
      : null;

  const staticDetails =
    activeDepositMethod &&
    activeDepositMethod in DEPOSIT_DETAILS
      ? DEPOSIT_DETAILS[
          activeDepositMethod as keyof typeof DEPOSIT_DETAILS
        ]
      : null;

  const selectedDetails = staticDetails
    ? {
        ...staticDetails,
        fields: dynamicFields.length > 0 ? dynamicFields : staticDetails.fields,
        notice: dynamicNotice ?? staticDetails.notice,
      }
    : null;

  function set(
    patch: Partial<typeof form>,
  ) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function chooseMethod(method: MethodId) {
    setErrorBanner(null);

    if (method === "crypto") {
      set({
        method,
        cryptoMethod: "",
      });

      return;
    }

    set({
      method,
      cryptoMethod: "",
    });
  }

  function chooseCrypto(
    method: CryptoMethod,
  ) {
    setErrorBanner(null);

    set({
      method: "crypto",
      cryptoMethod: method,
    });
  }

  function goReview(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    setErrorBanner(null);

    if (!accountId) {
      toast.error("Select an account");
      return;
    }

    if (!form.method) {
      toast.error("Choose a deposit method");
      return;
    }

    if (
      form.method === "crypto" &&
      !form.cryptoMethod
    ) {
      toast.error(
        "Choose Bitcoin or USDT",
      );

      return;
    }

    const amount = Number(
      form.amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      toast.error(
        "Enter a valid amount",
      );

      return;
    }

    setStep(1);
  }

  async function confirm() {
    if (!accountId) {
      toast.error("Select an account");
      return;
    }

    if (!form.method) {
      toast.error(
        "Choose a deposit method",
      );

      return;
    }

    const amount = Number(
      form.amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      toast.error(
        "Enter a valid amount",
      );

      return;
    }

    setBusy(true);

    setErrorBanner(null);

    try {
   const created = await send({
        data: {
          accountId,

          method:
            activeDepositMethod as "paypal" | "cashapp" | "bank_transfer" | "usdt" | "btc",

          amount,
        },
      });

      setTx(created);

      setStep(3);

      setSettling(true);

      queryClient.invalidateQueries();

      setTimeout(async () => {
        try {
          const done =
            await finalize({
              data: {
                transactionId:
                  created.id,
              },
            });

          setTx(done ?? created);

          queryClient.invalidateQueries();
        } catch {
          /*
           * The transaction remains pending.
           * Admin can resolve it from the
           * admin panel.
           */
        } finally {
          setSettling(false);
        }
      }, 6000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Deposit failed, please try again";

      setErrorBanner(message);

      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function copyValue(
    label: string,
    value: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopied(label);

      toast.success(
        `${label} copied`,
      );

      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch {
      toast.error(
        "Unable to copy",
      );
    }
  }

  function resetDeposit() {
    setStep(0);

    setTx(null);

    setSettling(false);

    setErrorBanner(null);

    setCopied(null);

    setForm({
      accountId:
        accounts?.[0]?.id ?? "",

      method: "",

      cryptoMethod: "",

      amount: "",
    });
  }

  return (
    <AppShell title="Deposit">

      {/* STEP INDICATOR */}

      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className="flex flex-1 items-center gap-2"
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? (
                <Check className="size-3.5" />
              ) : (
                i + 1
              )}
            </span>

            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= step
                  ? ""
                  : "text-muted-foreground"
              }`}
            >
              {s}
            </span>

            {i <
              STEPS.length - 1 && (
              <span className="h-px flex-1 bg-border" />
            )}
          </li>
        ))}
      </ol>

      {/* ERROR */}

      {errorBanner && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />

          <span>
            {errorBanner}
          </span>
        </div>
      )}

      {/* STEP 1 */}

      {step === 0 && (
        <form
          onSubmit={goReview}
          className="space-y-6"
        >

          {/* ACCOUNT */}

          <div className="space-y-2">
            <Label>
              To account
            </Label>

            <div className="grid gap-2 sm:grid-cols-2">
              {(accounts ?? []).map(
                (a) => {
                  const active =
                    accountId === a.id;

                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        set({
                          accountId:
                            a.id,
                        })
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-card hover:bg-muted"
                      }`}
                    >
                      <p className="text-sm font-semibold capitalize">
                        {a.type}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ••••{" "}
                        {a.account_number.slice(
                          -4,
                        )}
                      </p>

                      <p className="mt-1 text-xs font-medium">
                        {money(
                          Number(
                            a.balance,
                          ),
                          currency,
                        )}
                      </p>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* AMOUNT */}

          <div className="space-y-2">
            <Label htmlFor="deposit-amount">
              Amount
            </Label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>

              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="pl-7"
                value={
                  form.amount
                }
                onChange={(e) =>
                  set({
                    amount:
                      e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          {/* METHODS */}

          <div className="space-y-3">
            <div>
              <Label>
                Deposit method
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Choose how you want
                to add funds.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {METHODS.map((m) => {
                const Icon = m.icon;

                const active =
                  form.method ===
                  m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      chooseMethod(
                        m.id,
                      )
                    }
                    className={`flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/70 bg-card hover:bg-muted"
                    }`}
                  >
                    <Icon
                      className={`size-6 ${
                        active
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />

                    <span className="text-sm font-semibold">
                      {m.label}
                    </span>

                    <span className="text-[11px] text-muted-foreground">
                      {m.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedMethod && (
              <div className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                {
                  METHOD_INFO[
                    selectedMethod.id
                  ]
                }
              </div>
            )}
          </div>

          {/* CRYPTO */}

          {form.method ===
            "crypto" && (
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold">
                  Choose cryptocurrency
                </p>

                <p className="text-xs text-muted-foreground">
                  Select the asset
                  you want to use.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    chooseCrypto(
                      "usdt",
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedCrypto ===
                    "usdt"
                      ? "border-primary bg-primary/5"
                      : "border-border/70 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-muted">
                      <span className="text-sm font-bold">
                        ₮
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        USDT
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Tether USD
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    chooseCrypto(
                      "btc",
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedCrypto ===
                    "btc"
                      ? "border-primary bg-primary/5"
                      : "border-border/70 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-muted">
                      <Bitcoin className="size-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Bitcoin
                      </p>

                      <p className="text-xs text-muted-foreground">
                        BTC
                      </p>
                    </div>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* DEPOSIT DETAILS */}

          {selectedDetails && (
            <div className="rounded-2xl border border-border/70 bg-card p-5">

              <div className="mb-5">
                <div className="flex items-center gap-2">

                  <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                    {activeDepositMethod ===
                    "btc" ? (
                      <Bitcoin className="size-5" />
                    ) : activeDepositMethod ===
                      "usdt" ? (
                      <span className="font-bold">
                        ₮
                      </span>
                    ) : activeDepositMethod ===
                      "bank_transfer" ? (
                      <Landmark className="size-5" />
                    ) : (
                      <Wallet className="size-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold">
                      {
                        selectedDetails.title
                      }
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {
                        selectedDetails.description
                      }
                    </p>
                  </div>

                </div>
              </div>

              <div className="space-y-3">
                {selectedDetails.fields.map(
                  (field) => (
                    <div
                      key={
                        field.label
                      }
                      className="rounded-xl border border-border/60 bg-muted/40 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">

                        <span className="text-xs text-muted-foreground">
                          {
                            field.label
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            copyValue(
                              field.label,
                              field.value,
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          {copied ===
                          field.label ? (
                            <>
                              <CheckCheck className="size-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy
                            </>
                          )}
                        </button>

                      </div>

                      <p className="break-all text-sm font-semibold">
                        {
                          field.value
                        }
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  {
                    selectedDetails.notice
                  }
                </p>
              </div>

            </div>
          )}

          {/* NEXT */}

          <Button
            type="submit"
            className="w-full"
            disabled={
              !accountId ||
              !form.method ||
              (form.method ===
                "crypto" &&
                !form.cryptoMethod)
            }
          >
            Review deposit

            <ChevronRight className="size-4" />
          </Button>

        </form>
      )}

      {/* STEP 2 — REVIEW */}

      {step === 1 && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-border/70 bg-card p-5">

            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              You are depositing
            </p>

            <p className="mt-1 font-display text-3xl font-extrabold">
              {money(
                Number(
                  form.amount,
                ),
                currency,
              )}
            </p>

            <dl className="mt-5 space-y-3 text-sm">

              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  To
                </dt>

                <dd className="text-right font-medium capitalize">
                  {account?.type ??
                    ""}{" "}
                  ••••{" "}
                  {account?.account_number.slice(
                    -4,
                  ) ?? ""}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Method
                </dt>

                <dd className="text-right font-medium">
                  {form.method ===
                  "crypto"
                    ? form.cryptoMethod ===
                      "usdt"
                      ? "USDT"
                      : "Bitcoin"
                    : selectedMethod?.label ??
                      "—"}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Amount
                </dt>

                <dd className="text-right font-medium">
                  {money(
                    Number(
                      form.amount,
                    ),
                    currency,
                  )}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Balance after settlement
                </dt>

                <dd className="text-right font-medium">
                  {money(
                    Number(
                      account?.balance ??
                        0,
                    ) +
                      Number(
                        form.amount ||
                          0,
                      ),
                    currency,
                  )}
                </dd>
              </div>

            </dl>
          </div>

          {selectedDetails && (
            <div className="rounded-2xl border border-border/70 bg-card p-5">

              <p className="text-sm font-semibold">
                Deposit destination
              </p>

              <div className="mt-3 space-y-2">
                {selectedDetails.fields.map(
                  (field) => (
                    <div
                      key={
                        field.label
                      }
                      className="flex flex-col gap-1 rounded-xl bg-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-xs text-muted-foreground">
                        {
                          field.label
                        }
                      </span>

                      <span className="break-all text-sm font-medium sm:text-right">
                        {
                          field.value
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>

            </div>
          )}

          <div className="flex gap-2">

            <Button
              variant="secondary"
              className="flex-1"
              onClick={() =>
                setStep(0)
              }
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            <Button
              className="flex-1"
              onClick={() =>
                setStep(2)
              }
            >
              Continue
              <ChevronRight className="size-4" />
            </Button>

          </div>
        </div>
      )}

      {/* STEP 3 — CONFIRM */}

      {step === 2 && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-border/70 bg-card p-5">

            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="size-7" />
            </div>

            <div className="text-center">

              <h2 className="font-display text-xl font-bold">
                Confirm your deposit
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review the information below before submitting.
              </p>

            </div>

            <div className="mt-5 rounded-xl bg-muted p-4">

              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Amount
                </span>

                <span className="text-sm font-bold">
                  {money(
                    Number(
                      form.amount,
                    ),
                    currency,
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between gap-4">

                <span className="text-sm text-muted-foreground">
                  Method
                </span>

                <span className="text-sm font-semibold">
                  {form.method ===
                  "crypto"
                    ? form.cryptoMethod ===
                      "usdt"
                      ? "USDT"
                      : "Bitcoin"
                    : selectedMethod?.label}
                </span>

              </div>

            </div>
          </div>

          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            This is a simulated deposit. No real funds, cards, bank transfers, PayPal transactions, Cash App transactions, or cryptocurrency transactions are processed.
          </div>

          <div className="flex gap-2">

            <Button
              variant="secondary"
              className="flex-1"
              onClick={() =>
                setStep(1)
              }
              disabled={busy}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            <Button
              className="flex-1"
              onClick={confirm}
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Confirm deposit
                  <Check className="size-4" />
                </>
              )}
            </Button>

          </div>
        </div>
      )}

      {/* STEP 4 — PROCESSING */}

      {step === 3 &&
        tx &&
        settling && (
          <div className="space-y-5 text-center">

            <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="size-8 animate-spin" />
            </div>

            <div>

              <h2 className="font-display text-xl font-bold">
                Processing your deposit
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Reference{" "}
                {tx.reference} ·{" "}
                <StatusBadge status="pending" />
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                This usually takes a few seconds.
              </p>

            </div>

          </div>
        )}

      {/* STEP 4 — COMPLETE */}

      {step === 3 &&
        tx &&
        !settling && (
          <div className="space-y-5 text-center">

            <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success">
              <Check className="size-8" />
            </div>

            <div>

              <h2 className="font-display text-xl font-bold">
                {tx.status ===
                "completed"
                  ? "Deposit complete"
                  : "Deposit submitted"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Reference{" "}
                {tx.reference} ·{" "}
                <StatusBadge
                  status={
                    tx.status
                  }
                />
              </p>

              {tx.status !==
                "completed" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  This deposit is still settling. You'll see your balance update automatically.
                </p>
              )}

            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5 text-left">

              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Amount
                </span>

                <span className="text-sm font-bold">
                  {money(
                    Number(
                      form.amount,
                    ),
                    currency,
                  )}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Method
                </span>

                <span className="text-sm font-semibold">
                  {form.method ===
                  "crypto"
                    ? form.cryptoMethod ===
                      "usdt"
                      ? "USDT"
                      : "Bitcoin"
                    : selectedMethod?.label}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Reference
                </span>

                <span className="text-sm font-medium">
                  {tx.reference}
                </span>
              </div>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  downloadReceipt(
                    tx,
                    currency,
                  )
                }
              >
                Download receipt
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={
                  resetDeposit
                }
              >
                New deposit
              </Button>

              <Button
                className="flex-1"
                onClick={() =>
                  navigate({
                    to: "/dashboard",
                  })
                }
              >
                Back to home
              </Button>

            </div>

          </div>
        )}

      {/* NO ACCOUNTS */}

      {step === 0 &&
        (accounts ?? [])
          .length === 0 && (
          <div className="mt-6">
            <EmptyState
              title="No accounts found"
              description="Your accounts are still being set up. Refresh in a moment."
            />
          </div>
        )}

    </AppShell>
  );
}