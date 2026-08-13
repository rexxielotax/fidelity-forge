import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PendingDeposit = {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  description: string | null;
  reference: string | null;
  created_at: string;
};

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPending() {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("id, user_id, account_id, amount, description, reference, created_at")
      .eq("category", "deposit")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error) setDeposits((data ?? []) as PendingDeposit[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function approve(id: string) {
    const { error } = await supabase
      .from("transactions")
      .update({ status: "completed" })
      .eq("id", id);
    if (!error) loadPending();
  }

  async function reject(id: string) {
    const { error } = await supabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("id", id);
    if (!error) loadPending();
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Pending Deposits</h1>
      {deposits.length === 0 && (
        <p className="text-muted-foreground">No pending deposits.</p>
      )}
      {deposits.map((d) => (
        <div key={d.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">${d.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{d.description}</p>
            <p className="text-xs text-muted-foreground">{d.reference}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => approve(d.id)}
              className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm"
            >
              Approve
            </button>
            <button
              onClick={() => reject(d.id)}
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}