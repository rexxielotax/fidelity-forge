import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Wellspring Bank" },
      { name: "description", content: "Restricted administrator access for the Wellspring Bank simulation." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin sign in — Wellspring Bank" },
      { property: "og:description", content: "Restricted administrator access." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const login = useServerFn(adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login({ data: { email, password } });
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold">Admin console</h1>
            <p className="text-xs text-muted-foreground">Restricted access</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ae">Email</Label>
            <Input id="ae" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap">Password</Label>
            <Input id="ap" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Verifying…" : "Sign in"}
          </Button>
        </div>
      </form>
    </main>
  );
}
