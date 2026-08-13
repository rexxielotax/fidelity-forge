import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Wellspring Bank" },
      { name: "description", content: "Sign in or create an account on the Wellspring Bank simulated banking demo." },
      { property: "og:title", content: "Sign in — Wellspring Bank" },
      { property: "og:description", content: "Access your simulated Wellspring Bank accounts." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!remember) sessionStorage.setItem("wellspring:ephemeral", "1");
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Check your inbox to verify your email address before signing in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent. Check your email.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-gold font-display text-lg font-extrabold text-accent-foreground">
            W
          </span>
          <span className="font-display text-xl font-bold">Wellspring Bank</span>
        </Link>
        <div className="max-w-sm">
          <h2 className="font-display text-4xl font-extrabold leading-tight">Banking, simulated end to end.</h2>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Accounts, transfers, virtual cards, receipts and support tickets — all backed by real server-side rules,
            none of it backed by real money.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Fictional demonstration product. Not a real financial institution.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden">
            <span className="grid size-11 place-items-center rounded-xl bg-brand font-display text-lg font-extrabold text-primary-foreground">
              W
            </span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to your simulated accounts."
                : mode === "signup"
                  ? "Email verification is required before access."
                  : "We'll email you a secure reset link."}
            </p>
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          )}

          {mode === "signin" && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-primary" onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to Wellspring?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
