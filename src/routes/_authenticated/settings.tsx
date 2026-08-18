import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/hooks/useBank";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Nirmal Bank" },
      { name: "description", content: "Update your profile, currency preference and notification settings." },
      { property: "og:title", content: "Settings — Nirmal Bank" },
      { property: "og:description", content: "Profile, currency and notification preferences." },
    ],
  }),
  component: SettingsPage,
});

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD"];

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    address: "",
    city: "",
    country: "",
    currency: "USD",
    notify_push: true,
    notify_email: true,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      currency: profile.currency ?? "USD",
      notify_push: profile.notify_push,
      notify_email: profile.notify_email,
    });
  }, [profile]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...form, date_of_birth: form.date_of_birth || null })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function resetPassword() {
    if (!profile?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell title="Settings">
      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-base font-semibold">Profile</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fn">Full name</Label>
              <Input id="fn" value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="em">Email</Label>
              <Input id="em" value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ph">Phone</Label>
              <Input id="ph" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                value={form.date_of_birth}
                onChange={(e) => set({ date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ad">Address</Label>
              <Input id="ad" value={form.address} onChange={(e) => set({ address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci">City</Label>
              <Input id="ci" value={form.city} onChange={(e) => set({ city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co">Country</Label>
              <Input id="co" value={form.country} onChange={(e) => set({ country: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-base font-semibold">Preferences</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Display currency</Label>
              <Select value={form.currency} onValueChange={(v) => set({ currency: v })}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="np">Push notifications</Label>
              <Switch id="np" checked={form.notify_push} onCheckedChange={(v) => set({ notify_push: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ne">Email notifications</Label>
              <Switch id="ne" checked={form.notify_email} onCheckedChange={(v) => set({ notify_email: v })} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-base font-semibold">Security</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll email you a secure link to choose a new password.
          </p>
          <Button type="button" variant="secondary" className="mt-3" onClick={resetPassword}>
            Send password reset link
          </Button>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" className="text-destructive" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </form>
    </AppShell>
  );
}