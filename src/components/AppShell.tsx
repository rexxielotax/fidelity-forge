import { useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  MoreHorizontal,
  Bell,
  LogOut,
  Receipt,
  LifeBuoy,
  Settings,
  Download,
  Menu,
  X,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useNotifications, useProfile } from "@/hooks/useBank";
import { useQueryClient as _unused } from "@tanstack/react-query"; // (safe to remove if flagged unused)
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transfer", label: "Transfer", icon: ArrowLeftRight },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/more", label: "More", icon: MoreHorizontal },
] as const;

const SIDE_LINKS = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/deposit", label: "Deposit", icon: Download },
  { to: "/transfer", label: "Transfer", icon: ArrowLeftRight },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/support", label: "Support", icon: LifeBuoy },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: notifications } = useNotifications();
  const { data: profile } = useProfile();
const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const unread = (notifications ?? []).filter((n) => !n.read_at).length;

  const [navOpen, setNavOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setNavOpen(false)}
          className="absolute right-3 top-6 rounded-lg p-1.5 hover:bg-sidebar-accent/60 lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>

        <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-gold font-display text-lg font-extrabold text-sidebar-primary-foreground">
            W
          </span>
          <span className="font-display text-lg font-bold">wellsfargo</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {SIDE_LINKS.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60",
                )}
              >
                <l.icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3.5 backdrop-blur lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setNavOpen(true)}
              className="mr-3 rounded-lg p-2 hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="font-display text-lg font-bold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

           <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handleAvatarChange}
/>

<div className="relative">
  <button
    type="button"
    onClick={() => setAvatarMenuOpen((o) => !o)}
    disabled={uploading}
    className="relative grid size-12 place-items-center overflow-hidden rounded-full border-2 border-border bg-muted transition hover:opacity-80 disabled:opacity-50"
    aria-label="Profile menu"
    title="Profile"
  >
    {profile?.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt="Profile"
        className="size-full object-cover"
      />
    ) : (
      <User className="size-6 text-muted-foreground" />
    )}
    {uploading && (
      <span className="absolute inset-0 grid place-items-center bg-black/40 text-[9px] font-medium text-white">
        ...
      </span>
    )}
  </button>

  {avatarMenuOpen && (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setAvatarMenuOpen(false)}
      />
      <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setAvatarMenuOpen(false);
            fileInputRef.current?.click();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted"
        >
          {profile?.avatar_url ? "Change profile picture" : "Add profile picture"}
        </button>
        <Link
          to="/profile"
          onClick={() => setAvatarMenuOpen(false)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted"
        >
          View profile
        </Link>
      </div>
    </>
  )}
</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 lg:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        {TABS.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <t.icon className="size-5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}