import { ArrowDownLeft, ArrowUpRight, Download, Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { dateTime, money, shortDate } from "@/lib/format";
import { downloadReceipt } from "@/lib/receipt";

export type Tx = {
  id: string;
  reference: string;
  category: string;
  direction: string;
  amount: number | string;
  status: string;
  description: string | null;
  recipient_name: string | null;
  recipient_bank: string | null;
  recipient_account: string | null;
  routing_number?: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/12 text-success",
  pending: "bg-warning/18 text-warning-foreground",
  failed: "bg-destructive/12 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function TxRow({ tx, currency, onClick }: { tx: Tx; currency: string; onClick: () => void }) {
  const credit = tx.direction === "credit";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          credit ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive",
        )}
      >
        {credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {tx.recipient_name ?? tx.description ?? tx.category.replace(/_/g, " ")}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {shortDate(tx.created_at)} · {tx.reference}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className={cn("block text-sm font-bold", credit ? "text-success" : "text-foreground")}>
          {credit ? "+" : "−"}
          {money(Number(tx.amount), currency)}
        </span>
        <StatusBadge status={tx.status} />
      </span>
    </button>
  );
}

export function ReceiptDialog({
  tx,
  currency,
  onOpenChange,
}: {
  tx: Tx | null;
  currency: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(tx)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Transaction receipt</DialogTitle>
        </DialogHeader>
        {tx && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-brand px-5 py-6 text-center text-primary-foreground">
              <p className="text-3xl font-bold">
                {tx.direction === "credit" ? "+" : "−"}
                {money(Number(tx.amount), currency)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-primary-foreground/70">{tx.status}</p>
            </div>
            <dl className="space-y-2.5 text-sm">
              {(
                [
                  ["Reference", tx.reference],
                  ["Type", tx.category.replace(/_/g, " ")],
                  ["Date / Time", dateTime(tx.created_at)],
                  ["Description", tx.description ?? "—"],
                  ["Recipient", tx.recipient_name ?? "—"],
                  ["Bank", tx.recipient_bank ?? "—"],
                  ["Account", tx.recipient_account ?? "—"],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium capitalize">{v}</dd>
                </div>
              ))}
            </dl>
            <Button className="w-full" variant="secondary" onClick={() => downloadReceipt(tx, currency)}>
              <Download className="size-4" /> Download PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
