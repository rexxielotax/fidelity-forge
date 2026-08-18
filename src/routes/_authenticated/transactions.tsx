import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ListSkeleton, ReceiptDialog, TxRow, type Tx } from "@/components/bank-bits";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useTransactions } from "@/hooks/useBank";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Nirmal Bank" },
      { name: "description", content: "Search your full transaction history and download PDF receipts." },
      { property: "og:title", content: "Transactions — Nirmal Bank" },
      { property: "og:description", content: "Full transaction history with downloadable receipts." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: profile } = useProfile();
  const { data: transactions, isLoading } = useTransactions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [direction, setDirection] = useState("all");
  const [receipt, setReceipt] = useState<Tx | null>(null);
  const currency = profile?.currency ?? "USD";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (transactions ?? []).filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (direction !== "all" && t.direction !== direction) return false;
      if (!q) return true;
      return [t.reference, t.recipient_name, t.description, t.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [transactions, query, status, direction]);

  return (
    <AppShell title="Transactions">
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by reference, recipient or note"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["all", "pending", "completed", "failed", "cancelled"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="credit">Money in</SelectItem>
              <SelectItem value="debit">Money out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching transactions"
          description="Try clearing the search or changing the filters above."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => (
            <TxRow key={t.id} tx={t as Tx} currency={currency} onClick={() => setReceipt(t as Tx)} />
          ))}
        </div>
      )}

      <ReceiptDialog tx={receipt} currency={currency} onOpenChange={(o) => !o && setReceipt(null)} />
    </AppShell>
  );
}