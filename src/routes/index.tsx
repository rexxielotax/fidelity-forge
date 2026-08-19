import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, LineChart, Lock, Send } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weellsfargo Bank — Digital Banking" },
      {
        name: "description",
        content:
          "Manage your accounts, transfer money, manage your cards, and stay in control of your finances with Wellsfargo Bank.",
      },
      {
        property: "og:title",
        content: "Wellsfargo Bank — Digital Banking",
      },
      {
        property: "og:description",
        content:
          "Secure online banking designed to make managing your money simple.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Send,
    title: "Move money securely",
    body: "Transfer funds quickly and conveniently between your accounts.",
  },
  {
    icon: CreditCard,
    title: "Manage your cards",
    body: "Manage your cards, monitor spending, and keep your accounts secure.",
  },
  {
    icon: LineChart,
    title: "Stay on top of your money",
    body: "View balances, review transactions, and manage your finances in one place.",
  },
  {
    icon: Lock,
    title: "Bank with confidence",
    body: "Modern security features help protect your account and personal information.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="font-display text-lg font-extrabold tracking-tight">
          Wellsfargo<span className="text-primary">Bank</span>
        </span>

        <Link
          to="/auth"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-20 pt-14 text-center sm:pt-20">
        <p className="inline-flex rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Digital banking
        </p>

        <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Banking made simple.
          <br />
          Secure. Built around you.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Manage your money with secure online banking. View your accounts,
          transfer funds, manage your cards, and stay in control of your
          finances from anywhere.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open an account
            <ArrowRight className="size-4" />
          </Link>

          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border/70 bg-card p-5"
          >
            <feature.icon className="size-5 text-primary" />

            <h2 className="mt-4 text-sm font-semibold">
              {feature.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {feature.body}
            </p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
        wellsfargo Bank — Secure digital banking.
      </footer>
    </main>
  );
}