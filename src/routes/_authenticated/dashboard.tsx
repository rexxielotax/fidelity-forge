import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeftRight,
  CreditCard,
  Download,
  LifeBuoy,
  MoreHorizontal,
  Receipt,
  Eye,
  EyeOff,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ListSkeleton, ReceiptDialog, TxRow, type Tx } from "@/components/bank-bits";
import { useAccounts, useProfile, useTransactions } from "@/hooks/useBank";
import { greeting, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — wellsfargo Bank" },
      { name: "description", content: "Your balances, quick actions and recent activity in wellsfargo Bank." },
      { property: "og:title", content: "Dashboard — wellsfargo Bank" },
      { property: "og:description", content: "Balances, quick actions and recent activity." },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { to: "/transfer", label: "Transfer", icon: ArrowLeftRight },
  { to: "/cards", label: "My Cards", icon: CreditCard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/support", label: "Support", icon: LifeBuoy },
  { to: "/more", label: "More", icon: MoreHorizontal },
] as const;

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: transactions, isLoading: loadingTx } = useTransactions(6);
  const [hidden, setHidden] = useState(false);
  const [receipt, setReceipt] = useState<Tx | null>(null);

  const currency = profile?.currency ?? "USD";
  const total = (accounts ?? []).reduce((sum, a) => sum + Number(a.balance), 0);
  const firstName = (profile?.full_name || profile?.email || "there").split(" ")[0];
const QUICK = [
  {
    to: "/deposit",
    label: "Deposit",
    icon: Download,
  },
  {
    to: "/transfer",
    label: "Transfer",
    icon: ArrowLeftRight,
  },
  {
    to: "/cards",
    label: "My Cards",
    icon: CreditCard,
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: Receipt,
  },
  {
    to: "/support",
    label: "Support",
    icon: LifeBuoy,
  },
  {
    to: "/more",
    label: "More",
    icon: MoreHorizontal,
  },
] as const;

  return (
    <AppShell title="Home">
      <p className="text-sm text-muted-foreground">{greeting()},</p>
      <h2 className="font-display text-2xl font-bold capitalize">{firstName}</h2>

      <section className="mt-4 rounded-3xl bg-brand p-6 text-primary-foreground shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/70">Total balance</p>
          <button onClick={() => setHidden((h) => !h)} aria-label="Toggle balance visibility">
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="mt-2 font-display text-1=3xl font-extrabold">
          {hidden ? "••••••" : money(total, currency)}
        </p>
        <p className="mt-1 text-sm text-primary-foreground/75">
          Available: {hidden ? "••••" : money(total, currency)}
        </p>
      </section>

      <section className="mt-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 py-3.5 text-center transition-colors hover:bg-muted/60"
            >
              <q.icon className="size-5 text-primary" />
              <span className="text-[11px] font-medium leading-tight">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Accounts overview</h3>
          <Link to="/accounts" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        {loadingAccounts ? (
          <ListSkeleton rows={2} />
        ) : (
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {(accounts ?? []).map((a) => (
              <div
                key={a.id}
                className="min-w-[240px] snap-start rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-elev)]"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{a.type}</p>
                <p className="mt-2 font-display text-xl font-bold">{money(Number(a.balance), currency)}</p>
                <p className="mt-1 text-xs text-muted-foreground">•••• {a.account_number.slice(-4)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent transactions</h3>
          <Link to="/transactions" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        {loadingTx ? (
          <ListSkeleton />
        ) : (transactions ?? []).length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Once money moves in or out of your accounts, it will show up right here."
          />
        ) : (
          <div className="space-y-2.5">
            {(transactions ?? []).map((t) => (
              <TxRow key={t.id} tx={t as Tx} currency={currency} onClick={() => setReceipt(t as Tx)} />
            ))}
          </div>
        )}
      </section>

      <ReceiptDialog tx={receipt} currency={currency} onOpenChange={(o) => !o && setReceipt(null)} />
    </AppShell>
  );
}