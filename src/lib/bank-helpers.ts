export const TIER_FEES: Record<string, { fee: number; limit: number }> = {
  standard: { fee: 2000, limit: 5000 },
  gold: { fee: 5000, limit: 15000 },
  platinum: { fee: 10000, limit: 50000 },
};

export function reference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `TRX-${out}`;
}

export function adminSessionConfig() {
  return {
    password: process.env["ADMIN_SESSION_SECRET"]!,
    name: "admin-session",
    maxAge: 60 * 60 * 8,
  };
}
