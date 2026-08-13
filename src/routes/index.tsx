import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, LineChart, Lock, Send } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wellspring Bank — Simulated digital banking" },
      {
        name: "description",
        content:
          "A portfolio-grade simulated banking experience: accounts, instant transfers, virtual cards and support — no real money involved.",
      },
      { property: "og:title", content: "Wellspring Bank — Simulated digital banking" },
      {
        property: "og:description",
        content: "Accounts, transfers, virtual cards and support in a realistic banking demo.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Send, title: "Instant transfers", body: "Four-step flow with pending settlement and PDF receipts." },
  { icon: CreditCard, title: "Virtual cards", body: "Issue tiered cards with limits, freeze and PIN reveal." },
  { icon: LineChart, title: "Live balances", body: "Checking and savings accounts with full activity history." },
  { icon: Lock, title: "Secure by design", body: "Row-level security keeps every account strictly private." },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="font-display text-lg font-extrabold tracking-tight">
          Wellspring<span className="text-primary">Bank</span>
        </span>
        <Link
          to="/auth"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 text-center">
        <p className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Simulated banking demo
        </p>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Banking that feels real,
          <br />
          without the risk.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Wellspring Bank is a learning and portfolio project — open an account, move money, issue a virtual
          card and track everything in a polished, production-style interface.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Create your account <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold"
          >
            I already have one
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border/70 bg-card p-5">
            <f.icon className="size-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
        Wellspring Bank is a fictional application. No real financial services are provided.
      </footer>
    </main>
  );
}
