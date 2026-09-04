import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Loader2,
  MessageCircle,
  ShieldAlert,
  Users,
  XCircle,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState, StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts, useProfile, useRecipients } from "@/hooks/useBank";
import { money } from "@/lib/format";
import { createTransfer, finalizeTransfer } from "@/lib/bank.functions";
import { downloadReceipt } from "@/lib/receipt";

export const Route = createFileRoute("/_authenticated/transfer")({
  head: () => ({
    meta: [
      { title: "Transfer money — wellsfargo Bank" },
      { name: "description", content: "Send a transfer in four steps: details, review, confirm, complete." },
      { property: "og:title", content: "Transfer money — wellsfargo Bank" },
      { property: "og:description", content: "Send a transfer to any beneficiary." },
    ],
  }),
  component: TransferPage,
});

const STEPS = ["Details", "Review", "Confirm", "Complete"] as const;

function TransferPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: accounts } = useAccounts();
  const { data: recipients } = useRecipients();
  const send = useServerFn(createTransfer);
  const finalize = useServerFn(finalizeTransfer);

  const currency = profile?.currency ?? "USD";
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState<Awaited<ReturnType<typeof createTransfer>> | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);
  const submitting = useRef(false);
  const [form, setForm] = useState({
    accountId: "",
    recipientName: "",
    bank: "",
    accountNumber: "",
    routingNumber: "",
    amount: "",
    description: "",
    saveRecipient: false,
    pin: "",
  });

  const accountId = form.accountId || accounts?.[0]?.id || "";
  const account = (accounts ?? []).find((a) => a.id === accountId);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  function goReview(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (account && Number(account.balance) < amount) {
      toast.error("Insufficient balance for this transfer");
      return;
    }
    setStep(1);
  }

  async function confirm() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setSettleError(null);
    try {
      const created = await send({
        data: {
          accountId,
          recipientName: form.recipientName,
          bank: form.bank,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber,
          description: form.description,
          amount: Number(form.amount),
          saveRecipient: form.saveRecipient,
          pin: form.pin,
        },
      });
      setTx(created);
      setStep(3);
      queryClient.invalidateQueries();

      // Settle against the real backend record — no blind timers.
      try {
        const done = await finalize({ data: { transactionId: created.id } });
        if (done) setTx(done);
      } catch (err) {
        setSettleError(
          err instanceof Error ? err.message : "We could not settle this transfer automatically.",
        );
      } finally {
        queryClient.invalidateQueries();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed, please try again");
      submitting.current = false;
    } finally {
      setBusy(false);
    }
  }

  if (profile?.transfers_locked) {
    return (
      <AppShell title="Transfer">
        <div className="space-y-5 py-10 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/12 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Transfers unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Transfers are currently disabled on your account. Please contact support for help.
            </p>
          </div>
          <Button className="mx-auto w-full max-w-xs" onClick={() => navigate({ to: "/support" })}>
            <MessageCircle className="size-4" />
            Contact Support
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Transfer">
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
            <Label>From account</Label>
            <Select value={accountId} onValueChange={(v) => set({ accountId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="capitalize">{a.type}</span> · {money(Number(a.balance), currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(recipients ?? []).length > 0 && (
            <div>
              <Label className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" /> Saved recipients
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(recipients ?? []).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      set({
                        recipientName: r.name,
                        bank: r.bank,
                        accountNumber: r.account_number,
                        routingNumber: r.routing_number ?? "",
                      })
                    }
                    className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rn">Recipient name</Label>
            <Input id="rn" value={form.recipientName} onChange={(e) => set({ recipientName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bk">Bank name</Label>
            <Input id="bk" value={form.bank} onChange={(e) => set({ bank: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="an">Account number</Label>
              <Input id="an" value={form.accountNumber} onChange={(e) => set({ accountNumber: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rt">Routing number (optional)</Label>
              <Input id="rt" value={form.routingNumber} onChange={(e) => set({ routingNumber: e.target.value })} />
            </div>
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
          <div className="space-y-2">
            <Label htmlFor="ds">Description</Label>
            <Textarea id="ds" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={form.saveRecipient}
              onCheckedChange={(v) => set({ saveRecipient: Boolean(v) })}
            />
            Save this recipient for next time
          </label>
          <Button type="submit" className="w-full">
            Review transfer <ChevronRight className="size-4" />
          </Button>
        </form>
      )}

      {(step === 1 || step === 2) && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">You are sending</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{money(Number(form.amount), currency)}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["From", `${account?.type ?? ""} •••• ${account?.account_number.slice(-4) ?? ""}`],
                ["To", form.recipientName],
                ["Bank", form.bank],
                ["Account", form.accountNumber],
                ["Routing", form.routingNumber || "—"],
                ["Description", form.description || "—"],
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
                Confirm to submit this transfer. Your balance is only deducted once the transfer completes.
              </p>
              <div className="space-y-2">
                <Label htmlFor="pin">Transfer PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Enter your 4-digit PIN"
                  value={form.pin}
                  onChange={(e) => set({ pin: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)} disabled={busy}>
                  Back
                </Button>
                <Button className="flex-1" onClick={confirm} disabled={busy || form.pin.length !== 4}>
                  {busy ? "Submitting…" : "Confirm transfer"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && tx && (
        <div className="space-y-5 text-center">
          <div className={`mx-auto grid size-16 place-items-center rounded-full ${outcome.tone}`}>
            <outcome.Icon className={`size-8 ${outcome.spin ? "animate-spin" : ""}`} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{outcome.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reference {tx.reference} · <StatusBadge status={tx.status} />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{settleError ?? outcome.hint}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={busy}
              onClick={() => downloadReceipt(tx, currency)}
            >
              Download receipt
            </Button>
            <Button className="flex-1" onClick={() => navigate({ to: "/dashboard" })}>
              Back to home
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => navigate({ to: "/support" })}>
            <MessageCircle className="size-4" />
            Continue to Support
          </Button>
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