import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  adminGetConversations,
  adminGetConversationMessages,
  adminReplyToUser,
} from "@/lib/admin.functions";

async function uploadAdminSupportImages(files: File[], userId: string): Promise<string[]> {
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


  
export function AdminSupportPanel() {
  const queryClient = useQueryClient();
  const getConversations = useServerFn(adminGetConversations);
  const getMessages = useServerFn(adminGetConversationMessages);
  const replyToUser = useServerFn(adminReplyToUser);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: () => getConversations(),
    refetchInterval: 10000,
  });

  const messagesQuery = useQuery({
    queryKey: ["admin-conversation-messages", selectedUserId],
    queryFn: () => getMessages({ data: { userId: selectedUserId! } }),
    enabled: !!selectedUserId,
    refetchInterval: selectedUserId ? 5000 : false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleReply() {
    if (!selectedUserId || (!replyText.trim() && pendingFiles.length === 0)) return;
    setSending(true);
    try {
      let imageUrls: string[] = [];
      if (pendingFiles.length) {
        imageUrls = await uploadAdminSupportImages(pendingFiles, selectedUserId);
      }
      await replyToUser({
        data: { userId: selectedUserId, body: replyText.trim(), imageUrls },
      });
      setReplyText("");
      setPendingFiles([]);
      await queryClient.invalidateQueries({ queryKey: ["admin-conversation-messages", selectedUserId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const selectedConvo = conversations.find((c) => c.userId === selectedUserId);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3">
          <h3 className="text-sm font-semibold">Conversations</h3>
        </div>
        <div className="max-h-[560px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setSelectedUserId(c.userId)}
                className={cn(
                  "flex w-full items-start justify-between gap-2 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  selectedUserId === c.userId && "bg-muted",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {c.profile?.full_name || c.profile?.email || c.userId}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex h-[600px] flex-col rounded-2xl border border-border/70 bg-card">
        {!selectedUserId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="size-8" />
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        ) : (
          <>
            <div className="border-b border-border/70 px-4 py-3">
              <p className="text-sm font-semibold">
                {selectedConvo?.profile?.full_name || selectedConvo?.profile?.email || selectedUserId}
              </p>
              <p className="text-xs text-muted-foreground">{selectedConvo?.profile?.email}</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.sender === "admin" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5",
                      m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted",
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
                type="button"
              >
                <ImagePlus className="size-5 text-muted-foreground" />
              </button>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Type a reply..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none"
              />
              <Button size="icon" className="shrink-0 rounded-full" onClick={handleReply} disabled={sending}>
                <Send className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
