import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — wellsfargo Bank" },
      { name: "description", content: "Restricted administrator access for the wellsfargo Bank simulation." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin sign in — wellsfargo Bank" },
      { property: "og:description", content: "Restricted administrator access." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const login = useServerFn(adminLogin);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function enterAdmin() {
    if (!password) {
      toast.error("Please enter the admin password");
      return;
    }
    setLoading(true);
    try {
      await login({ data: { password } });
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to enter admin panel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold">Admin console</h1>
            <p className="text-xs text-muted-foreground">wellsfargo Bank · Restricted access</p>
          </div>
        </div>

        <Input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enterAdmin()}
          className="mb-4"
          autoFocus
        />

        <Button type="button" className="w-full" onClick={enterAdmin} disabled={loading}>
          {loading ? "Verifying…" : "Enter admin panel"}
        </Button>
      </div>
    </main>
  );
}