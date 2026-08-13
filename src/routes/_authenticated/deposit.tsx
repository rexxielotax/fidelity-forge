
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, ChevronRight, Landmark, CreditCard, Bitcoin } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState, StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts, useProfile } from "@/hooks/useBank";
import { money } from "@/lib/format";
import { createDeposit, finalizeDeposit } from "@/lib/bank.functions";
import { downloadReceipt } from "@/lib/receipt";

export const Route = createFileRoute("/_authenticated/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit — Rexxie Bank" },
      {
        name: "description",
        content: "Add a simulated deposit to your account in a few steps.",
      },
      { property: "og:title", content: "Deposit — Rexxie Bank" },
      { property: "og:description", content: "Add a simulated deposit to your account." },
    ],
  }),
  component: DepositPage,
});

const STEPS = ["Method", "Review", "Confirm", "Complete"] as const;

const METHODS = [
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark, hint: "Simulated ACH/wire" },
  { id: "card", label: "Card", icon: CreditCard, hint: "Simulated debit/credit" },
  { id: "crypto", label: "Crypto", icon: Bitcoin, hint: "Simulated on-chain" },
] as const;

function DepositPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useProfile();
  const { data: accounts } = useAccounts();

  const send = useServerFn(createDeposit);
  const finalize = useServerFn(finalizeDeposit);

  const currency = profile?.currency ?? "USD";

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState<Awaited<ReturnType<typeof createDeposit>> | null>(null);

  const [form, setForm] = useState({
    accountId: "",
    method: "" as "" | (typeof METHODS)[number]["id"],
    amount: "",
  });

  const accountId = form.accountId || accounts?.[0]?.id || "";
  const account = (accounts ?? []).find((a) => a.id === accountId);
  const selectedMethod = METHODS.find((m) => m.id === form.method);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  function goReview(e: React.FormEvent) {
    e.preventDefault();

    if (!form.method) {
      toast.error("Choose a deposit method");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setStep(1);
  }

  async function confirm() {
    setBusy(true);

    try {
      const created = await send({
        data: {
          accountId,
          method: form.method as (typeof METHODS)[number]["id"],
          amount: Number(form.amount),
        },
      });

      setTx(created);
      setStep(3);

      queryClient.invalidateQueries();

      setTimeout(async () => {
        try {
          const done = await finalize({ data: { transactionId: created.id } });
          setTx(done ?? created);
          queryClient.invalidateQueries();
        } catch {
          // Status stays pending; admin can resolve.
        }
      }, 6000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deposit failed, please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Deposit">
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>

            <span className={`hidden text-xs font-medium sm:block ${i <= step ? "" : "text-muted-foreground"}`}>
              {s}
            </span>

            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form onSubmit={goReview} className="space-y-4">
          <div className="space-y-2">
            <Label>To account</Label>

            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={accountId}
              onChange={(e) => set({ accountId: e.target.value })}
            >
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.type} · {money(Number(a.balance), currency)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Deposit method</Label>

            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = form.method === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => set({ method: m.id })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-card hover:bg-muted"
                    }`}
                  >
                    <Icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedMethod && (
              <p className="text-xs text-muted-foreground">{selectedMethod.hint} (simulated, no real funds move)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="am">Amount</Label>

            <Input
              id="am"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Review deposit
            <ChevronRight className="size-4" />
          </Button>
        </form>
      )}

      {(step === 1 || step === 2) && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">You are depositing</p>

            <p className="mt-1 font-display text-3xl font-extrabold">{money(Number(form.amount), currency)}</p>

            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["To", `${account?.type ?? ""} •••• ${account?.account_number.slice(-4) ?? ""}`],
                ["Method", selectedMethod?.label ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium capitalize">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {step === 1 ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>
                Back
              </Button>

              <Button className="flex-1" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                Confirm to submit this deposit. This is a simulated deposit — no real funds are transferred.
              </p>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)} disabled={busy}>
                  Back
                </Button>

                <Button className="flex-1" onClick={confirm} disabled={busy}>
                  {busy ? "Submitting…" : "Confirm deposit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && tx && (
        <div className="space-y-5 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success">
            <Check className="size-8" />
          </div>

          <div>
            <h2 className="font-display text-xl font-bold">Deposit submitted</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Reference {tx.reference} · <StatusBadge status={tx.status} />
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Pending deposits settle automatically after a short processing window.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => downloadReceipt(tx, currency)}>
              Download receipt
            </Button>

            <Button className="flex-1" onClick={() => navigate({ to: "/dashboard" })}>
              Back to home
            </Button>
          </div>
        </div>
      )}

      {step === 0 && (accounts ?? []).length === 0 && (
        <div className="mt-6">
          <EmptyState title="No accounts found" description="Your accounts are still being set up. Refresh in a moment." />
        </div>
      )}
    </AppShell>
  );
}
