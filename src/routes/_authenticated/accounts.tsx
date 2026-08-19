import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ListSkeleton, ReceiptDialog, TxRow, type Tx } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { useAccounts, useProfile, useTransactions } from "@/hooks/useBank";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Wellspring Bank" },
      { name: "description", content: "View your live checking and savings account balances and activity." },
      { property: "og:title", content: "Accounts — Wellspring Bank" },
      { property: "og:description", content: "Checking and savings balances and activity." },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { data: profile } = useProfile();
  const { data: accounts, isLoading } = useAccounts();
  const { data: transactions } = useTransactions();
  const [selected, setSelected] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Tx | null>(null);
  const currency = profile?.currency ?? "USD";

  const activeId = selected ?? accounts?.[0]?.id ?? null;
  const activity = (transactions ?? []).filter((t) => t.account_id === activeId).slice(0, 10);

  return (
    <AppShell title="Accounts">
      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(accounts ?? []).map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`rounded-2xl border p-5 text-left transition-shadow ${
                a.id === activeId ? "border-primary shadow-[var(--shadow-elev)]" : "border-border/70"
              } bg-card`}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{a.type} account</p>
              <p className="mt-2 font-display text-2xl font-bold">{money(Number(a.balance), currency)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Acct •••• {a.account_number.slice(-4)}</p>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button asChild className="flex-1">
          <Link to="/transfer">Send money</Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <Link to="/transactions">All transactions</Link>
        </Button>
      </div>

      <h3 className="mb-3 mt-7 text-sm font-semibold text-muted-foreground">Account activity</h3>
      {activity.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="This account has no activity. Transfers and credits will appear here."
        />
      ) : (
        <div className="space-y-2.5">
          {activity.map((t) => (
            <TxRow key={t.id} tx={t as Tx} currency={currency} onClick={() => setReceipt(t as Tx)} />
          ))}
        </div>
      )}

      <ReceiptDialog tx={receipt} currency={currency} onOpenChange={(o) => !o && setReceipt(null)} />
    </AppShell>
  );
}
