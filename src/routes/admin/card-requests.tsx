import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Check, CreditCard, Eye, RefreshCw, ShieldCheck, X } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { StatusBadge } from "@/components/bank-bits";

import {
  adminApproveCardRequest,
  adminGetCardRequests,
  adminRejectCardRequest,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/card-requests")({
  head: () => ({
    meta: [
      { title: "Card Requests — Nirmal Bank Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCardRequests,
});

function AdminCardRequests() {
  const queryClient = useQueryClient();

  const load = useServerFn(adminGetCardRequests);
  const approve = useServerFn(adminApproveCardRequest);
  const reject = useServerFn(adminRejectCardRequest);

  const query = useQuery({
    queryKey: ["admin-card-requests"],
    queryFn: () => load(),
    retry: false,
  });

  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await approve({ data: { requestId: id, note: note.trim() } });
      toast.success("Card request approved");
      setSelected(null);
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["admin-card-requests"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      await reject({ data: { requestId: id, note: note.trim() } });
      toast.success("Card request rejected");
      setSelected(null);
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["admin-card-requests"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Rejection failed");
    } finally {
      setBusyId(null);
    }
  }

  if (query.isPending) {
    return (
      <main className="min-h-screen bg-muted/40">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
          <RefreshCw className="size-6 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="font-display font-bold">Card Requests</h1>
            <p className="text-xs text-muted-foreground">Nirmal Bank Admin</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Requests</h2>
            <p className="text-sm text-muted-foreground">Review submitted simulated card requests.</p>
          </div>

          <Button variant="secondary" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {query.isError && (
          <div className="rounded-2xl border border-destructive/30 bg-card p-5">
            <p className="font-semibold">Unable to load requests</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query.error instanceof Error ? query.error.message : "Unknown error"}
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {(query.data ?? []).map((request: any) => {
            const profile = request.profiles;

            return (
              <div key={request.id} className="rounded-2xl border border-border/70 bg-card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                      <CreditCard className="size-5" />
                    </span>

                    <div>
                      <p className="font-semibold capitalize">
                        {request.card_type} {request.delivery_type} card
                      </p>
                      <p className="mt-1 text-sm">{profile?.full_name ?? "Unknown customer"}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email ?? "No email"}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Payment: <span className="font-medium">{formatPayment(request.payment_method)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={
                        request.status === "approved"
                          ? "completed"
                          : request.status === "rejected"
                            ? "failed"
                            : "pending"
                      }
                    />

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelected(request);
                        setNote(request.admin_note ?? "");
                      }}
                    >
                      <Eye className="size-4" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(query.data ?? []).length === 0 && !query.isError && (
          <div className="rounded-2xl border border-border/70 bg-card p-10 text-center">
            <CreditCard className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No card requests</p>
            <p className="mt-1 text-sm text-muted-foreground">New requests will appear here.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Card request</p>
                <h2 className="mt-1 font-display text-xl font-bold capitalize">
                  {selected.card_type} {selected.delivery_type}
                </h2>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelected(null)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info label="Customer" value={selected.profiles?.full_name ?? "Unknown"} />
              <Info label="Email" value={selected.profiles?.email ?? "Unknown"} />
              <Info label="Card" value={`${selected.card_type} / ${selected.delivery_type}`} />
              <Info label="Payment" value={formatPayment(selected.payment_method)} />
              <Info label="Fee" value={`$${Number(selected.amount ?? 0).toFixed(2)}`} />
              <Info label="Status" value={selected.status} />
            </div>

            {selected.payment_method === "gift_card" && (
              <div className="mt-5">
                <p className="text-sm font-semibold">Gift Card</p>
                <p className="mt-1 text-sm text-muted-foreground capitalize">
                  {selected.gift_card_type ?? "Unknown"}
                </p>
                {selected.gift_card_image_url && (
                  <div className="mt-3 overflow-hidden rounded-2xl border bg-muted">
                    <img
                      src={selected.gift_card_image_url}
                      alt="Submitted gift card"
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-5">
              <p className="text-sm font-semibold">Admin note</p>
              <Textarea
                className="mt-2"
                rows={4}
                placeholder="Optional note..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>

            {selected.status === "pending" && (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="flex-1" disabled={busyId === selected.id} onClick={() => handleApprove(selected.id)}>
                  <Check className="size-4" />
                  {busyId === selected.id ? "Processing..." : "Approve"}
                </Button>

                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={busyId === selected.id}
                  onClick={() => handleReject(selected.id)}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function formatPayment(value: string) {
  switch (value) {
    case "btc":
      return "Bitcoin";
    case "usdt":
      return "USDT";
    case "ethereum":
      return "Ethereum";
    case "bank_transfer":
      return "Bank Transfer";
    case "gift_card":
      return "Gift Card";
    default:
      return value;
  }
}