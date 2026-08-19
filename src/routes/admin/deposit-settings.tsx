import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  getDepositSettings,
  updateDepositSetting,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/deposit-settings")({
  head: () => ({
    meta: [
      { title: "Deposit settings — Nirmal Bank Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DepositSettingsAdmin,
});

const METHOD_TITLE: Record<string, string> = {
  paypal: "PayPal",
  cashapp: "Cash App",
  bank_transfer: "Bank Transfer",
  usdt: "USDT",
  btc: "Bitcoin",
};

type Row = {
  id: string;
  method: string;
  field_key: string;
  field_label: string;
  field_value: string;
  description: string | null;
  notice: string | null;
};

type Draft = {
  fieldValue: string;
  notice: string;
};

function DepositSettingsAdmin() {
  const navigate = useNavigate();

  const load = useServerFn(getDepositSettings);
  const save = useServerFn(updateDepositSetting);

  const query = useQuery<Row[]>({
    queryKey: ["admin-deposit-settings"],
    queryFn: () => load(),
    retry: false,
  });

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (query.isError) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [query.isError, navigate]);

  useEffect(() => {
    if (!query.data) return;

    setDrafts(
      Object.fromEntries(
        query.data.map((row) => [
          `${row.method}:${row.field_key}`,
          {
            fieldValue: row.field_value,
            notice: row.notice ?? "",
          },
        ])
      )
    );
  }, [query.data]);

  const grouped = (query.data ?? []).reduce<Record<string, Row[]>>(
  (acc, row) => {
    const existing = acc[row.method] ?? [];
    acc[row.method] = [...existing, row];
    return acc;
  }, {});

  async function saveField(row: Row) {
    const key = `${row.method}:${row.field_key}`;
    const draft = drafts[key];

    if (!draft) return;

    setSavingKey(key);

    try {
      await save({
        data: {
          method: row.method as any,
          fieldKey: row.field_key,
          fieldLabel: row.field_label,
          fieldValue: draft.fieldValue,
          description: row.description ?? "",
          notice: draft.notice,
        },
      });

      toast.success(`${row.field_label} updated`);

      await query.refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Update failed"
      );
    } finally {
      setSavingKey(null);
    }
  }

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
        Loading deposit settings…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/admin/dashboard" })}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>

          <div>
            <h1 className="font-display text-base font-bold">
              Deposit method settings
            </h1>

            <p className="text-xs text-muted-foreground">
              live values shown on the user Deposit page.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {Object.entries(grouped).map(([method, rows]) => (
          <section
            key={method}
            className="rounded-2xl border border-border/70 bg-card p-5"
          >
            <h3 className="font-display text-base font-semibold">
              {METHOD_TITLE[method] ?? method}
            </h3>

            <div className="mt-4 space-y-4">
              {rows.map((row) => {
                const key = `${row.method}:${row.field_key}`;
                const draft = drafts[key];

                if (!draft) return null;

                return (
                  <div
                    key={row.id}
                    className="space-y-3 rounded-xl border border-border/60 p-4"
                  >
                    <div className="space-y-2">
                      <Label>{row.field_label}</Label>

                      <Input
                        value={draft.fieldValue}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [key]: {
                              ...draft,
                              fieldValue: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notice shown to users</Label>

                      <Textarea
                        rows={2}
                        value={draft.notice}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [key]: {
                              ...draft,
                              notice: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => saveField(row)}
                      disabled={savingKey === key}
                    >
                      {savingKey === key ? "Saving…" : "Save"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}