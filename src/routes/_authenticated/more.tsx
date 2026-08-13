import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Receipt,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useProfile, useRecipients } from "@/hooks/useBank";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/more")({
  head: () => ({
    meta: [
      { title: "More — Wellspring Bank" },
      { name: "description", content: "Beneficiaries, notifications, statements, settings and support shortcuts." },
      { property: "og:title", content: "More — Wellspring Bank" },
      { property: "og:description", content: "All your account shortcuts in one place." },
    ],
  }),
  component: MorePage,
});

const LINKS = [
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Transactions & statements", icon: Receipt },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/support", label: "Help & support", icon: LifeBuoy },
] as const;

function MorePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: recipients } = useRecipients();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell title="More">
      <div className="rounded-2xl bg-brand p-5 text-primary-foreground">
        <p className="font-display text-lg font-bold capitalize">{profile?.full_name || "Account holder"}</p>
        <p className="text-sm text-primary-foreground/75">{profile?.email}</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-card">
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 text-sm font-medium last:border-0 hover:bg-muted/50"
          >
            <l.icon className="size-4 text-primary" />
            <span className="flex-1">{l.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <section className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="size-4" /> Saved beneficiaries
        </h3>
        {(recipients ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
            You haven't saved any beneficiaries yet.
          </p>
        ) : (
          <div className="space-y-2">
            {(recipients ?? []).map((r) => (
              <div key={r.id} className="rounded-2xl border border-border/70 bg-card px-4 py-3">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.bank} · •••• {r.account_number.slice(-4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Button variant="ghost" className="mt-6 w-full text-destructive" onClick={signOut}>
        <LogOut className="size-4" /> Sign out
      </Button>
    </AppShell>
  );
}
