import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useProfile, useSupportMessages, sendSupportMessage, uploadSupportImages } from "@/hooks/useBank";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support — rexxie" },
      { name: "description", content: "Chat with the rexxie support team." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: messages } = useSupportMessages();
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`support-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${profile.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["support-messages"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient]);

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    if (!profile?.id || (!text.trim() && pendingFiles.length === 0)) return;
    setSending(true);
    try {
      let imageUrls: string[] = [];
      if (pendingFiles.length) {
        imageUrls = await uploadSupportImages(pendingFiles, profile.id);
      }
      await sendSupportMessage({ userId: profile.id, body: text.trim(), imageUrls });
      setText("");
      setPendingFiles([]);
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell title="Support">
      <div className="flex h-[calc(100vh-160px)] flex-col rounded-2xl border border-border/70 bg-card">
        <div className="border-b border-border/70 px-5 py-4">
          <h3 className="font-display text-base font-semibold">Support Chat</h3>
          <p className="text-xs text-muted-foreground">Chat with our support team</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {(messages ?? []).map((m) => (
            <div key={m.id} className={cn("flex", m.sender === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5",
                  m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.body && <p className="text-sm">{m.body}</p>}
                {m.image_urls?.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {m.image_urls.map((url: string, i: number) => (
                      <img key={i} src={url} alt="attachment" className="rounded-lg" />
                    ))}
                  </div>
                )}
                <p className="mt-1 text-[10px] opacity-70">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border/70 px-4 py-2">
            {pendingFiles.map((f, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(f)} alt="" className="size-14 rounded-lg object-cover" />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border/70 px-4 py-3">
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={pickFiles} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-muted"
          >
            <ImagePlus className="size-5 text-muted-foreground" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none"
          />
          <Button size="icon" className="shrink-0 rounded-full" onClick={handleSend} disabled={sending}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}