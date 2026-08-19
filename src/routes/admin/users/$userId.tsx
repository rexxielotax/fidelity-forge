import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dateTime, money } from "@/lib/format";
import {
  adminGetUser,
  adminSetAccountBalance,
  adminSetTransferLock,
  adminUpdateUserProfile,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({
    meta: [
      { title: "User details — wellsfargo Bank Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUserDetails,
});

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD"];

type ProfileForm = {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  date_of_birth: string;
  notify_email: boolean;
  notify_push: boolean;
};

function AdminUserDetails() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();

  const load = useServerFn(adminGetUser);
  const updateProfile = useServerFn(adminUpdateUserProfile);
  const setBalance = useServerFn(adminSetAccountBalance);
  const lockTransfers = useServerFn(adminSetTransferLock);

  const query = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => load({ data: { userId } }),
    retry: false,
  });

  useEffect(() => {
    if (query.isError) navigate({ to: "/admin/dashboard" });
  }, [query.isError, navigate]);

  const data = query.data;

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    currency: "USD",
    date_of_birth: "",
    notify_email: true,
    notify_push: true,
  });

  const [balanceDrafts, setBalanceDrafts] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAccount, setSavingAccount] = useState<string | null>(null);
  const [transfersLocked, setTransfersLocked] = useState(false);

  useEffect(() => {
    if (!data?.profile) return;
    setProfileForm({
      full_name: data.profile.full_name ?? "",
      phone: data.profile.phone ?? "",
      address: data.profile.address ?? "",
      city: data.profile.city ?? "",
      country: data.profile.country ?? "",
      currency: data.profile.currency ?? "USD",
      date_of_birth: data.profile.date_of_birth ?? "",
      notify_email: data.profile.notify_email,
      notify_push: data.profile.notify_push,
    });
    setBalanceDrafts(
      Object.fromEntries((data.accounts ?? []).map((a) => [a.id, String(a.balance)]))
    );
    setTransfersLocked(Boolean((data.profile as any).transfers_locked));
  }, [data?.profile, data?.accounts]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await updateProfile({
        data: {
          userId,
          ...profileForm,
          date_of_birth: profileForm.date_of_birth || null,
        },
      });
      toast.success("Profile updated");
      query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveBalance(accountId: string) {
    setSavingAccount(accountId);
    try {
      await setBalance({ data: { accountId, balance: Number(balanceDrafts[accountId]) } });
      toast.success("Balance updated");
      query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingAccount(null);
    }
  }

  async function toggleTransfers(next: boolean) {
    setTransfersLocked(next);
    try {
      await lockTransfers({ data: { userId, locked: next } });
      toast.success(next ? "Transfers disabled for this user" : "Transfers re-enabled for this user");
    } catch (err) {
      setTransfersLocked(!next);
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
        Loading user…
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/dashboard" })}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-base font-bold">
                {data.profile.full_name || data.profile.email}
              </h1>
              <p className="text-xs text-muted-foreground">{data.profile.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-base font-semibold">Profile</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Email is managed by Supabase Auth and can't be edited here.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input
                value={profileForm.address}
                onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={profileForm.city}
                onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={profileForm.country}
                onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={profileForm.date_of_birth ?? ""}
                onChange={(e) => setProfileForm((f) => ({ ...f, date_of_birth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={profileForm.currency}
                onValueChange={(v) => setProfileForm((f) => ({ ...f, currency: v }))}
              >
                <SelectTrigger>
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
            <div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={profileForm.notify_email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, notify_email: e.target.checked }))}
                  className="size-4 rounded border-input"
                />
                Email notifications
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={profileForm.notify_push}
                  onChange={(e) => setProfileForm((f) => ({ ...f, notify_push: e.target.checked }))}
                  className="size-4 rounded border-input"
                />
                Push notifications
              </label>
            </div>
          </div>

          <Button className="mt-4" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save profile"}
          </Button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold">Transfer access</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Disabling this blocks transfers for this user. They'll see a message directing them to Support.
              </p>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={transfersLocked}
                onChange={(e) => toggleTransfers(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Block transfers
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-base font-semibold">Accounts</h3>

          <div className="mt-4 space-y-3">
            {data.accounts.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold capitalize">{a.type}</p>
                  <p className="text-xs text-muted-foreground">•••• {a.account_number.slice(-4)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current: {money(Number(a.balance), profileForm.currency)}
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-2">
                    <Label>New balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-36"
                      value={balanceDrafts[a.id] ?? ""}
                      onChange={(e) => setBalanceDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => saveBalance(a.id)}
                    disabled={savingAccount === a.id}
                  >
                    {savingAccount === a.id ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            ))}
            {data.accounts.length === 0 && (
              <p className="text-sm text-muted-foreground">No accounts found for this user.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-base font-semibold">Recent activity</h3>
          <div className="mt-4 space-y-2">
            {data.transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{t.reference}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {t.category} · {dateTime(t.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{money(Number(t.amount), profileForm.currency)}</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
            {data.transactions.length === 0 && (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}