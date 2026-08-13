import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, CreditCard, LifeBuoy, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState, ListSkeleton, StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useTickets } from "@/hooks/useBank";
import { supabase } from "@/integrations/supabase/client";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support — Wellspring Bank" },
      { name: "description", content: "Open a support ticket and track replies from the Wellspring Bank team." },
      { property: "og:title", content: "Support — Wellspring Bank" },
      { property: "og:description", content: "Open a ticket and track replies." },
    ],
  }),
  component: SupportPage,
});

const TILES = [
  { icon: CreditCard, title: "Cards & limits", body: "Freeze a card, view your PIN or upgrade your tier." },
  { icon: ShieldCheck, title: "Account security", body: "Reset your password and review security alerts." },
  { icon: BookOpen, title: "Transfers", body: "Understand pending status and settlement windows." },
];

const CATEGORIES = ["general", "transfer", "card", "account", "security"];

function SupportPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: tickets, isLoading } = useTickets();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: profile.id,
      subject: form.subject,
      category: form.category,
      message: form.message,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ticket submitted — we'll reply shortly");
    setForm({ subject: "", category: "general", message: "" });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
  }

  return (
    <AppShell title="Support">
      <div className="grid gap-3 sm:grid-cols-3">
        {TILES.map((t) => (
          <div key={t.title} className="rounded-2xl border border-border/70 bg-card p-4">
            <t.icon className="size-5 text-primary" />
            <p className="mt-3 text-sm font-semibold">{t.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border/70 bg-card p-5">
        <h3 className="font-display text-base font-semibold">Contact support</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sj">Subject</Label>
            <Input
              id="sj"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ms">How can we help?</Label>
          <Textarea
            id="ms"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            required
          />
        </div>
        <Button type="submit" disabled={busy}>
          <Send className="size-4" /> {busy ? "Sending…" : "Submit ticket"}
        </Button>
      </form>

      <h3 className="mb-3 mt-7 text-sm font-semibold text-muted-foreground">Your tickets</h3>
      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : (tickets ?? []).length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="size-5" />}
          title="No tickets yet"
          description="When you contact support, your conversation history appears here."
        />
      ) : (
        <div className="space-y-3">
          {(tickets ?? []).map((t) => (
            <div key={t.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{t.subject}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {t.category} · {dateTime(t.created_at)}
                  </p>
                </div>
                <StatusBadge status={t.status === "in_progress" ? "pending" : t.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.message}</p>
              {t.admin_reply && (
                <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Support reply
                  </p>
                  <p className="mt-1">{t.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
