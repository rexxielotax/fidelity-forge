import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ListSkeleton } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useBank";
import { supabase } from "@/integrations/supabase/client";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Wellspring Bank" },
      { name: "description", content: "Transaction, security and system alerts for your Wellspring Bank account." },
      { property: "og:title", content: "Notifications — Wellspring Bank" },
      { property: "og:description", content: "Transaction, security and system alerts." },
    ],
  }),
  component: NotificationsPage,
});

const FILTERS = ["all", "transaction", "security", "promotion", "system"] as const;

function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useNotifications();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const list = (notifications ?? []).filter((n) => filter === "all" || n.type === filter);
  const unread = (notifications ?? []).filter((n) => !n.read_at);

  async function markAll() {
    if (unread.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread.map((n) => n.id));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function markOne(id: string) {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <AppShell title="Notifications">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize",
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={markAll} disabled={unread.length === 0}>
          <CheckCheck className="size-4" /> Mark all
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-5" />}
          title="Nothing to catch up on"
          description="Alerts about transfers, cards and security will show up here."
        />
      ) : (
        <div className="space-y-2.5">
          {list.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read_at && markOne(n.id)}
              className={cn(
                "flex w-full gap-3 rounded-2xl border p-4 text-left transition-colors",
                n.read_at ? "border-border/70 bg-card" : "border-primary/30 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.read_at ? "bg-transparent" : "bg-primary",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{n.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{dateTime(n.created_at)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}
