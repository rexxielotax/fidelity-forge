import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      {
        title: "Admin Console — Nirmal Bank",
      },
      {
        name: "description",
        content:
          "Manage simulated users, balances, transactions and support tickets.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: AdminDashboard,
});

const TX_FILTERS = [
  "all",
  "deposit",
  "transfer",
  "card_fee",
  "admin_adjustment",
] as const;

type TxFilter = (typeof TX_FILTERS)[number];

const TX_FILTER_LABEL: Record<TxFilter, string> = {
  all: "All",
  deposit: "Deposits",
  transfer: "Transfers",
  card_fee: "Card Fees",
  admin_adjustment: "Adjustments",
};

type CreditForm = {
  userId: string;
  accountType: "checking" | "savings";
  amount: string;
  note: string;
};

function AdminDashboard() {
  const navigate = useNavigate();

  const loadAdminData = useServerFn(adminData);


  const creditAccount = useServerFn(adminCredit);
  const changeTransactionStatus = useServerFn(
    adminSetTransactionStatus,
  );
  const replyTicket = useServerFn(adminReplyTicket);
  const sendPasswordReset = useServerFn(
    adminSendPasswordReset,
  );
  const logoutAdmin = useServerFn(adminLogout);

  const [creditForm, setCreditForm] = useState<CreditForm>({
    userId: "",
    accountType: "checking",
    amount: "",
    note: "",
  });

  const [replies, setReplies] = useState<
    Record<string, string>
  >({});

  const [txFilter, setTxFilter] =
    useState<TxFilter>("all");

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [actionId, setActionId] =
    useState<string | null>(null);


  /*
   * IMPORTANT:
   *
   * There is deliberately NO useEffect here that redirects
   * the user when adminData fails.
   *
   * That was one of the causes of the dashboard blinking.
   */
  const query = useQuery({
    queryKey: ["admin-dashboard"],

    queryFn: async () => {
      return await loadAdminData();
    },

    retry: false,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    refetchOnMount: false,

    staleTime: 30_000,

    gcTime: 5 * 60_000,
  });

  const data = query.data;

  /*
   * Keep the previous data visible during a refetch.
   *
   * This means:
   *
   * initial load -> loading screen
   *
   * refresh/action -> existing dashboard stays visible
   *
   * error during refresh -> existing dashboard stays visible
   */
  const isInitialLoading =
    query.isPending && !query.data;

  const isRefreshing =
    query.isFetching && !!query.data;

  const stats = useMemo(() => {
    const profiles = data?.profiles ?? [];
    const accounts = data?.accounts ?? [];
    const transactions = data?.transactions ?? [];
    const tickets = data?.tickets ?? [];

    const totalBalance = accounts.reduce(
      (total, account) =>
        total + Number(account.balance ?? 0),
      0,
    );

    const pendingDeposits =
      transactions.filter(
        (transaction) =>
          transaction.status === "pending" &&
          transaction.category === "deposit",
      ).length;

    const pendingTransfers =
      transactions.filter(
        (transaction) =>
          transaction.status === "pending" &&
          transaction.category === "transfer",
      ).length;

    const openTickets =
      tickets.filter(
        (ticket) => ticket.status !== "resolved",
      ).length;

    return {
      users: profiles.length,
      balance: totalBalance,
      pendingDeposits,
      pendingTransfers,
      tickets: openTickets,
    };
  }, [data]);

  const filteredTransactions = useMemo(() => {
    const transactions =
      data?.transactions ?? [];

    if (txFilter === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.category === txFilter,
    );
  }, [data?.transactions, txFilter]);

  /*
   * Generic action helper.
   *
   * We do NOT replace the dashboard with a loading
   * screen while an action is running.
   */
  async function runAction(
    id: string,
    fn: () => Promise<unknown>,
    successMessage: string,
  ) {
    if (actionId) return;

    setActionId(id);

    try {
      await fn();

      toast.success(successMessage);

      await query.refetch();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Action failed";

      toast.error(message);
    } finally {
      setActionId(null);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutAdmin();

      navigate({
        to: "/admin/login",
        replace: true,
      });
    } catch (error) {
      setLoggingOut(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign out",
      );
    }
  }

  async function handleCredit() {
    if (actionId) return;

    if (!creditForm.userId) {
      toast.error("Select a user");
      return;
    }

    const amount = Number(creditForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    await runAction(
      "credit-account",
      () =>
        creditAccount({
          data: {
            userId: creditForm.userId,
            accountType:
              creditForm.accountType,
            amount,
            note: creditForm.note.trim(),
          },
        }),
      "Account credited successfully",
    );

    setCreditForm({
      userId: "",
      accountType: "checking",
      amount: "",
      note: "",
    });
  }

  /*
   * Initial loading only.
   *
   * This screen is NOT shown again during normal refetches.
   */
  if (isInitialLoading) {
    return (
      <main className="min-h-screen bg-muted/40">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
            <RefreshCw className="mx-auto size-7 animate-spin text-primary" />

            <h1 className="mt-4 font-display text-lg font-bold">
              Loading admin console
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Please wait...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Initial request failed.
   *
   * We only show this when there is NO previous dashboard data.
   *
   * We do NOT automatically redirect.
   */
  if (query.isError && !data) {
    const errorMessage =
      query.error instanceof Error
        ? query.error.message
        : "Unable to load the admin dashboard.";

    return (
      <main className="min-h-screen bg-muted/40">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </span>

              <div>
                <h1 className="font-display text-base font-bold">
                  Admin Console
                </h1>

                <p className="text-xs text-muted-foreground">
                  Nirmal Bank
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="size-4" />

              {loggingOut
                ? "Signing out..."
                : "Sign out"}
            </Button>
          </div>
        </header>

        <Button
  onClick={() => navigate({ to: "/admin/deposit-settings" })}
>
  Deposit Settings
</Button>

        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-2xl border border-destructive/30 bg-card p-6">
            <div className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold">
                  Unable to load admin data
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  The admin data request failed. The
                  dashboard has not redirected automatically.
                </p>

                <div className="mt-4 rounded-xl bg-muted p-3">
                  <p className="break-words font-mono text-xs">
                    {errorMessage}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      query.refetch()
                    }
                    disabled={query.isFetching}
                  >
                    <RefreshCw
                      className={`size-4 ${
                        query.isFetching
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    Try again
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      navigate({
                        to: "/admin/login",
                        replace: true,
                      })
                    }
                  >
                    Back to login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>

            <div>
              <h1 className="font-display text-base font-bold">
                Admin Console
              </h1>

              <p className="text-xs text-muted-foreground">
                Nirmal Bank
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRefreshing && (
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <RefreshCw className="size-3 animate-spin" />
                Updating
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                query.refetch()
              }
              disabled={query.isFetching}
            >
              <RefreshCw
                className={`size-4 ${
                  query.isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="size-4" />

              <span className="hidden sm:inline">
                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* REFRESH ERROR */}
        {query.isError && data && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Latest refresh failed
              </p>

              <p className="mt-1 break-words text-xs text-muted-foreground">
                {query.error instanceof Error
                  ? query.error.message
                  : "Unable to refresh admin data."}
              </p>
            </div>

            <Button
              className="ml-auto shrink-0"
              size="sm"
              variant="secondary"
              onClick={() =>
                query.refetch()
              }
            >
              Retry
            </Button>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Users"
            value={String(stats.users)}
          />

          <StatCard
            label="Total balances"
            value={money(
              stats.balance,
              "USD",
            )}
          />

          <StatCard
            label="Pending deposits"
            value={String(
              stats.pendingDeposits,
            )}
          />

          <StatCard
            label="Pending transfers"
            value={String(
              stats.pendingTransfers,
            )}
          />

          <StatCard
            label="Open tickets"
            value={String(stats.tickets)}
          />
        </div>

        {/* MAIN TABS */}
        <Tabs
          defaultValue="users"
          className="mt-6"
        >
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="users">
                Users
              </TabsTrigger>

              <TabsTrigger value="transactions">
                Transactions
              </TabsTrigger>

              <TabsTrigger value="tickets">
                Tickets
              </TabsTrigger>

              <TabsTrigger value="audit">
                Audit Log
              </TabsTrigger>
            </TabsList>
          </div>

          {/* USERS */}
          <TabsContent
            value="users"
            className="space-y-4"
          >
            {/* CREDIT ACCOUNT */}
            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <div>
                <h2 className="font-display text-base font-semibold">
                  Credit an account
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add funds to a user's checking or
                  savings account.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 lg:col-span-2">
                  <Label>User</Label>

                  <Select
                    value={creditForm.userId}
                    onValueChange={(value) =>
                      setCreditForm(
                        (current) => ({
                          ...current,
                          userId: value,
                        }),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>

                    <SelectContent>
                      {(data?.profiles ?? []).map(
                        (profile) => (
                          <SelectItem
                            key={profile.id}
                            value={profile.id}
                          >
                            {profile.full_name ||
                              profile.email ||
                              profile.id}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Account</Label>

                  <Select
                    value={
                      creditForm.accountType
                    }
                    onValueChange={(value) =>
                      setCreditForm(
                        (current) => ({
                          ...current,
                          accountType:
                            value as
                              | "checking"
                              | "savings",
                        }),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="checking">
                        Checking
                      </SelectItem>

                      <SelectItem value="savings">
                        Savings
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      creditForm.amount
                    }
                    onChange={(event) =>
                      setCreditForm(
                        (current) => ({
                          ...current,
                          amount:
                            event.target.value,
                        }),
                      )
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <Label>Note</Label>

                  <Input
                    placeholder="Optional note"
                    value={creditForm.note}
                    onChange={(event) =>
                      setCreditForm(
                        (current) => ({
                          ...current,
                          note: event.target.value,
                        }),
                      )
                    }
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    className="w-full"
                    disabled={
                      !!actionId ||
                      !creditForm.userId ||
                      !creditForm.amount ||
                      !Number.isFinite(
                        Number(
                          creditForm.amount,
                        ),
                      ) ||
                      Number(
                        creditForm.amount,
                      ) <= 0
                    }
                    onClick={
                      handleCredit
                    }
                  >
                    {actionId ===
                    "credit-account" ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" />
                        Crediting...
                      </>
                    ) : (
                      "Credit Account"
                    )}
                  </Button>
                </div>
              </div>
            </section>

            {/* USERS TABLE */}
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">
                        Name
                      </th>

                      <th className="px-4 py-3">
                        Email
                      </th>

                      <th className="px-4 py-3">
                        Balances
                      </th>

                      <th className="px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data?.profiles ?? []).map(
                      (profile) => {
                        const balance =
                          (
                            data?.accounts ??
                            []
                          )
                            .filter(
                              (account) =>
                                account.user_id ===
                                profile.id,
                            )
                            .reduce(
                              (
                                total,
                                account,
                              ) =>
                                total +
                                Number(
                                  account.balance ??
                                    0,
                                ),
                              0,
                            );

                        return (
                          <tr
                            key={
                              profile.id
                            }
                            className="border-t border-border/60"
                          >
                            <td className="px-4 py-3 font-medium">
                              {profile.full_name ||
                                "—"}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                              {profile.email ||
                                "—"}
                            </td>

                            <td className="px-4 py-3">
                              {money(
                                balance,
                                profile.currency ||
                                  "USD",
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    navigate({
                                      to: "/admin/users/$userId",
                                      params: {
                                        userId:
                                          profile.id,
                                      },
                                    })
                                  }
                                >
                                  View Details
                                </Button>

                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={
                                    !!actionId
                                  }
                                  onClick={() =>
                                    runAction(
                                      `reset-${profile.id}`,
                                      () =>
                                        sendPasswordReset(
                                          {
                                            data: {
                                              email:
                                                profile.email,
                                              redirectTo:
                                                `${window.location.origin}/auth`,
                                            },
                                          },
                                        ),
                                      "Password reset link sent",
                                    )
                                  }
                                >
                                  Send Reset Link
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {(data?.profiles ?? [])
                .length === 0 && (
                <EmptyTable message="No users found." />
              )}
            </section>
          </TabsContent>

          {/* TRANSACTIONS */}
          <TabsContent
            value="transactions"
            className="space-y-3"
          >
            <div className="flex flex-wrap gap-2">
              {TX_FILTERS.map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setTxFilter(filter)
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      txFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {
                      TX_FILTER_LABEL[
                        filter
                      ]
                    }
                  </button>
                ),
              )}
            </div>

            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">
                        Reference
                      </th>

                      <th className="px-4 py-3">
                        Category
                      </th>

                      <th className="px-4 py-3">
                        Amount
                      </th>

                      <th className="px-4 py-3">
                        Recipient / Description
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Change Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map(
                      (transaction) => (
                        <tr
                          key={
                            transaction.id
                          }
                          className="border-t border-border/60"
                        >
                          <td className="px-4 py-3 font-mono text-xs">
                            {
                              transaction.reference
                            }
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                              {
                                transaction.category
                              }
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {money(
                              Number(
                                transaction.amount ??
                                  0,
                              ),
                              "USD",
                            )}
                          </td>

                          <td className="max-w-xs px-4 py-3 text-muted-foreground">
                            <div className="truncate">
                              {transaction.recipient_name ||
                                transaction.description ||
                                "—"}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge
                              status={
                                transaction.status
                              }
                            />
                          </td>

                          <td className="px-4 py-3">
                            <Select
                              value={
                                transaction.status
                              }
                              disabled={
                                !!actionId
                              }
                              onValueChange={(
                                value,
                              ) =>
                                runAction(
                                  `tx-${transaction.id}`,
                                  () =>
                                    changeTransactionStatus(
                                      {
                                        data: {
                                          transactionId:
                                            transaction.id,
                                          status:
                                            value as
                                              | "pending"
                                              | "completed"
                                              | "failed"
                                              | "cancelled",
                                        },
                                      },
                                    ),
                                  "Transaction status updated",
                                )
                              }
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>

                              <SelectContent>
                                {[
                                  "pending",
                                  "completed",
                                  "failed",
                                  "cancelled",
                                ].map(
                                  (
                                    status,
                                  ) => (
                                    <SelectItem
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {status}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length ===
                0 && (
                <EmptyTable message="No transactions in this category." />
              )}
            </section>
          </TabsContent>

          {/* TICKETS */}
          <TabsContent
            value="tickets"
            className="space-y-3"
          >
            {(data?.tickets ?? []).map(
              (ticket) => {
                const reply =
                  replies[ticket.id] ??
                  ticket.admin_reply ??
                  "";

                const replyActionId =
                  `reply-${ticket.id}`;

                const resolveActionId =
                  `resolve-${ticket.id}`;

                return (
                  <section
                    key={ticket.id}
                    className="rounded-2xl border border-border/70 bg-card p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {ticket.subject}
                        </p>

                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {ticket.category} ·{" "}
                          {dateTime(
                            ticket.created_at,
                          )}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          ticket.status ===
                          "in_progress"
                            ? "pending"
                            : ticket.status ===
                                "resolved"
                              ? "completed"
                              : "pending"
                        }
                      />
                    </div>

                    <div className="mt-3 rounded-xl bg-muted/60 p-3">
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {ticket.message}
                      </p>
                    </div>

                    {ticket.admin_reply && (
                      <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          Admin Reply
                        </p>

                        <p className="mt-1 text-sm whitespace-pre-wrap">
                          {ticket.admin_reply}
                        </p>
                      </div>
                    )}

                    <Textarea
                      className="mt-3"
                      rows={3}
                      placeholder="Write a reply..."
                      value={reply}
                      onChange={(
                        event,
                      ) =>
                        setReplies(
                          (current) => ({
                            ...current,
                            [ticket.id]:
                              event.target
                                .value,
                          }),
                        )
                      }
                    />

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={
                          !!actionId ||
                          !reply.trim()
                        }
                        onClick={() =>
                          runAction(
                            replyActionId,
                            () =>
                              replyTicket({
                                data: {
                                  ticketId:
                                    ticket.id,
                                  reply:
                                    reply.trim(),
                                  status:
                                    "in_progress",
                                },
                              }),
                            "Reply sent",
                          )
                        }
                      >
                        {actionId ===
                        replyActionId ? (
                          <>
                            <RefreshCw className="size-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Reply"
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={
                          !!actionId
                        }
                        onClick={() =>
                          runAction(
                            resolveActionId,
                            () =>
                              replyTicket({
                                data: {
                                  ticketId:
                                    ticket.id,
                                  reply:
                                    reply.trim() ||
                                    "Resolved.",
                                  status:
                                    "resolved",
                                },
                              }),
                            "Ticket resolved",
                          )
                        }
                      >
                        {actionId ===
                        resolveActionId ? (
                          <>
                            <RefreshCw className="size-4 animate-spin" />
                            Resolving...
                          </>
                        ) : (
                          "Resolve"
                        )}
                      </Button>
                    </div>
                  </section>
                );
              },
            )}

            {(data?.tickets ?? [])
              .length === 0 && (
              <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                No support tickets.
              </div>
            )}
          </TabsContent>

          {/* AUDIT LOG */}
          <TabsContent value="audit">
            <section className="space-y-2">
              {(data?.actions ?? []).map(
                (action) => (
                  <div
                    key={action.id}
                    className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="font-medium">
                          {action.action}
                        </span>

                        <span className="text-muted-foreground">
                          {" "}
                          by{" "}
                          {
                            action.admin_email
                          }
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {dateTime(
                          action.created_at,
                        )}
                      </span>
                    </div>
                  </div>
                ),
              )}

              {(data?.actions ?? [])
                .length === 0 && (
                <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                  No audit records.
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL UI COMPONENTS                                                        */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function EmptyTable({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}