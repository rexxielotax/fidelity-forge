export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "NGN",
  "ZAR",
  "BRL",
  "MXN",
  "SEK",
  "NOK",
  "DKK",
  "SGD",
  "HKD",
  "NZD",
  "AED",
  "SAR",
  "KES",
  "GHS",
  "EGP",
  "TRY",
  "PLN",
  "KRW",
] as const;

export const CARD_TIERS = [
  { id: "standard", label: "Standard Debit", fee: 2000, limit: 5000 },
  { id: "gold", label: "Gold Debit", fee: 5000, limit: 15000 },
  { id: "platinum", label: "Platinum Debit", fee: 10000, limit: 50000 },
] as const;

export function money(amount: number | string, currency = "USD") {
  const value = typeof amount === "string" ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  } catch {
    return `${currency} ${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
  }
}

export function dateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
