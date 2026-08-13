import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CreditCard, Eye, Lock, Plus, ShieldAlert, Unlock } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ListSkeleton, StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts, useCards, useProfile } from "@/hooks/useBank";
import { money } from "@/lib/format";
import { TIER_FEES } from "@/lib/bank-helpers";
import { getCardPin, requestCard, setCardStatus } from "@/lib/bank.functions";

export const Route = createFileRoute("/_authenticated/cards")({
  head: () => ({
    meta: [
      { title: "Cards — Wellspring Bank" },
      { name: "description", content: "Request and manage simulated virtual cards with spend limits and lock controls." },
      { property: "og:title", content: "Cards — Wellspring Bank" },
      { property: "og:description", content: "Request and manage your virtual cards." },
    ],
  }),
  component: CardsPage,
});

const TIERS = Object.entries(TIER_FEES).map(([key, v]) => ({ key, ...v }));

function CardsPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: accounts } = useAccounts();
  const { data: cards, isLoading } = useCards();
  const issue = useServerFn(requestCard);
  const changeStatus = useServerFn(setCardStatus);
  const fetchPin = useServerFn(getCardPin);

  const currency = profile?.currency ?? "USD";
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tier, setTier] = useState("standard");
  const [accountId, setAccountId] = useState("");
  const [pins, setPins] = useState<Record<string, string>>({});

  const funding = accountId || accounts?.[0]?.id || "";
  const fee = TIER_FEES[tier]?.fee ?? 0;

  async function submit() {
    setBusy(true);
    try {
      await issue({ data: { accountId: funding, cardType: tier, payWith: "account balance" } });
      toast.success("Card issued successfully");
      setOpen(false);
      queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not issue card");
    } finally {
      setBusy(false);
    }
  }

  async function toggleLock(id: string, status: string) {
    try {
      await changeStatus({ data: { cardId: id, status: status === "active" ? "locked" : "active" } });
      queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function reportLost(id: string) {
    try {
      await changeStatus({ data: { cardId: id, status: "lost" } });
      toast.success("Card reported and blocked");
      queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function revealPin(id: string) {
    try {
      const { pin } = await fetchPin({ data: { cardId: id } });
      setPins((p) => ({ ...p, [id]: pin }));
    } catch {
      toast.error("Could not reveal PIN");
    }
  }

  return (
    <AppShell title="Cards">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Virtual cards issued on your accounts</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> New card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Request a virtual card</DialogTitle>
              <DialogDescription>
                A one-time processing fee is deducted from the funding account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Card tier</Label>
                <div className="grid gap-2">
                  {TIERS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTier(t.key)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
                        tier === t.key ? "border-primary bg-muted/50" : "border-border"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold capitalize">{t.key}</span>
                        <span className="block text-xs text-muted-foreground">
                          Daily limit {money(t.limit, currency)}
                        </span>
                      </span>
                      <span className="text-sm font-bold">{money(t.fee, currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Funding account</Label>
                <Select value={funding} onValueChange={setAccountId}>
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
              <Button className="w-full" onClick={submit} disabled={busy}>
                {busy ? "Processing…" : `Pay ${money(fee, currency)} and issue card`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : (cards ?? []).length === 0 ? (
        <EmptyState
          icon={<CreditCard className="size-5" />}
          title="No cards yet"
          description="Request a virtual card to start making simulated online payments."
          action={<Button onClick={() => setOpen(true)}>Request a card</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(cards ?? []).map((c) => (
            <div key={c.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="rounded-2xl bg-brand p-5 text-primary-foreground">
                <div className="flex items-start justify-between">
                  <span className="text-xs uppercase tracking-widest text-primary-foreground/70">
                    {c.card_type}
                  </span>
                  <CreditCard className="size-5 opacity-80" />
                </div>
                <p className="mt-6 font-mono text-lg tracking-widest">{c.masked_number}</p>
                <div className="mt-4 flex items-end justify-between text-xs">
                  <span className="uppercase">{c.holder_name}</span>
                  <span>{c.expiry}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Daily limit {money(Number(c.daily_limit), currency)}
                </span>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => toggleLock(c.id, c.status)}>
                  {c.status === "active" ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                  {c.status === "active" ? "Freeze" : "Unfreeze"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => revealPin(c.id)}>
                  <Eye className="size-4" /> {pins[c.id] ? `PIN ${pins[c.id]}` : "Show PIN"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => reportLost(c.id)}>
                  <ShieldAlert className="size-4" /> Report lost
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
