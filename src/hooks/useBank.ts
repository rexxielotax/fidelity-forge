import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function uid() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const id = await uid();
      if (!id) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").order("type");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTransactions(limit?: number) {
  return useQuery({
    queryKey: ["transactions", limit ?? "all"],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecipients() {
  return useQuery({
    queryKey: ["recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 20000,
  });
}

export function useNotificationsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId || cancelled) return;

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const incoming = payload.new as Record<string, unknown>;
            queryClient.setQueryData<Record<string, unknown>[]>(
              ["notifications"],
              (old) => {
                const list = old ?? [];
                if (list.some((n) => n.id === incoming.id)) return list;
                return [incoming, ...list];
              },
            );
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useSupportMessages() {
  return useQuery({
    queryKey: ["support-messages"],
    queryFn: async () => {
      const id = await uid();
      if (!id) return [];
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function sendSupportMessage(params: {
  userId: string;
  body: string;
  imageUrls?: string[];
}) {
  const { error } = await supabase.from("support_messages").insert({
    user_id: params.userId,
    sender: "user",
    body: params.body || null,
    image_urls: params.imageUrls ?? [],
  });
  if (error) throw error;
}

export async function uploadSupportImages(files: File[], userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
   const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("support-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("support-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
export function useTierRequests() {
  return useQuery({
    queryKey: ["tier-requests"],
    queryFn: async () => {
      const id = await uid();
      if (!id) return [];
      const { data, error } = await supabase
        .from("tier_upgrade_requests")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function uploadTierImages(files: File[], userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
   const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("tier-upgrade-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("tier-upgrade-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}