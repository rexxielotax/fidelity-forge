import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dateTime, money } from "@/lib/format";
import {
  adminCredit,
  adminData,
  adminLogout,
  adminReplyTicket,
  adminSendPasswordReset,
  adminSetTransactionStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin console — Wellspring Bank" },
      { name: "description", content: "Manage simulated users, balances, transactions and support tickets." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin console — Wellspring Bank" },
      { property: "og:description", content: "Manage users, balances and tickets." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const load = useServerFn(adminData);
  const credit = useServerFn(adminCredit);
  const setStatus = useServerFn(adminSetTransactionStatus);
  const reply = useServerFn(adminReplyTicket);
  const sendReset = useServerFn(adminSendPasswordReset);
  const logout = useServerFn(adminLogout);

  const query = useQuery({ queryKey: ["admin-data"], queryFn: () => load(), retry: false });
  const [creditForm, setCreditForm] = useState({ userId: "", accountType: "checking", amount: "", note: "" });
  const [replies, setReplies] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query.isError) navigate({ to: "/admin/login" });
  }, [query.isError, navigate]);

  const data = query.data;
  const stats = useMemo(() => {
    const balance = (data?.accounts ?? []).reduce((s, a) => s + Number(a.balance), 0);
    return {
      users: data?.profiles.length ?? 0,
      balance,
      pending: (data?.transactions ?? []).filter((t) => t.status === "pending").length,
      tickets: (data?.tickets ?? []).filter((t) => t.status !== "resolved").length,
    };
  }, [data]);

  async function run(fn: () => Promise<unknown>, msg: string) {
    try {
      await fn();
      toast.success(msg);
      query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-base font-bold">Admin console</h1>
              <p className="text-xs text-muted-foreground">Wellspring Bank simulation</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logout();
              navigate({ to: "/admin/login" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Users", String(stats.users)],
            ["Total balances", money(stats.balance, "USD")],
            ["Pending transfers", String(stats.pending)],
            ["Open tickets", String(stats.tickets)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users" className="mt-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h3 className="font-display text-base font-semibold">Credit an account</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>User</Label>
                  <Select
                    value={creditForm.userId}
                    onValueChange={(v) => setCreditForm((f) => ({ ...f, userId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {(data?.profiles ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name || p.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account</Label>
                  <Select
                    value={creditForm.accountType}
                    onValueChange={(v) => setCreditForm((f) => ({ ...f, accountType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={creditForm.amount}
                    onChange={(e) => setCreditForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label>Note</Label>
                  <Input
                    value={creditForm.note}
                    onChange={(e) => setCreditForm((f) => ({ ...f, note: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full"
                    onClick={() =>
                      run(
                        () =>
                          credit({
                            data: {
                              userId: creditForm.userId,
                              accountType: creditForm.accountType as "checking" | "savings",
                              amount: Number(creditForm.amount),
                              note: creditForm.note,
                            },
                          }),
                        "Account credited",
                      )
                    }
                  >
                    Credit
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Balances</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.profiles ?? []).map((p) => {
                    const bal = (data?.accounts ?? [])
                      .filter((a) => a.user_id === p.id)
                      .reduce((s, a) => s + Number(a.balance), 0);
                    return (
                      <tr key={p.id} className="border-t border-border/60">
                        <td className="px-4 py-3 font-medium">{p.full_name || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                        <td className="px-4 py-3">{money(bal, p.currency)}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              run(
                                () =>
                                  sendReset({
                                    data: { email: p.email, redirectTo: `${window.location.origin}/auth` },
                                  }),
                                "Reset link sent",
                              )
                            }
                          >
                            Send reset link
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Set status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.transactions ?? []).map((t) => (
                    <tr key={t.id} className="border-t border-border/60">
                      <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                      <td className="px-4 py-3">{money(Number(t.amount), "USD")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.recipient_name ?? t.description}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={t.status}
                          onValueChange={(v) =>
                            run(
                              () =>
                                setStatus({
                                  data: {
                                    transactionId: t.id,
                                    status: v as "pending" | "completed" | "failed" | "cancelled",
                                  },
                                }),
                              "Status updated",
                            )
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["pending", "completed", "failed", "cancelled"].map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-3">
            {(data?.tickets ?? []).map((t) => (
              <div key={t.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {t.category} · {dateTime(t.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={t.status === "in_progress" ? "pending" : "completed"} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.message}</p>
                <Textarea
                  className="mt-3"
                  rows={2}
                  placeholder="Write a reply…"
                  value={replies[t.id] ?? t.admin_reply ?? ""}
                  onChange={(e) => setReplies((r) => ({ ...r, [t.id]: e.target.value }))}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      run(
                        () =>
                          reply({
                            data: { ticketId: t.id, reply: replies[t.id] ?? "", status: "in_progress" },
                          }),
                        "Reply sent",
                      )
                    }
                  >
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run(
                        () =>
                          reply({
                            data: {
                              ticketId: t.id,
                              reply: replies[t.id] ?? t.admin_reply ?? "Resolved.",
                              status: "resolved",
                            },
                          }),
                        "Ticket resolved",
                      )
                    }
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-2">
              {(data?.actions ?? []).map((a) => (
                <div key={a.id} className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm">
                  <span className="font-medium">{a.action}</span>{" "}
                  <span className="text-muted-foreground">by {a.admin_email} · {dateTime(a.created_at)}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
