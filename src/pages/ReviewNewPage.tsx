import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Star, CheckCircle2, ThumbsUp, ThumbsDown, Meh } from "lucide-react";

export function ReviewNewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();

  const specialistId = Number(params.get("specialistId"));
  const serviceId = params.get("serviceId") ? Number(params.get("serviceId")) : undefined;
  const contactId = params.get("contactId") ? Number(params.get("contactId")) : undefined;

  const create = trpc.review.create.useMutation();

  const [overall, setOverall] = useState<"thumbs_up" | "neutral" | "thumbs_down" | null>(null);
  const [quality, setQuality] = useState(0);
  const [timing, setTiming] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const Stars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} type="button">
          <Star className={`w-7 h-7 ${n <= value ? "fill-[#FFB800] text-[#FFB800]" : "text-[#E8EAED]"}`} />
        </button>
      ))}
    </div>
  );

  const handleSubmit = async () => {
    if (!user) return;
    if (!overall) { setError("Выберите общую оценку"); return; }
    if (!specialistId) { setError("Специалист не указан"); return; }
    setError("");
    try {
      await create.mutateAsync({
        telegramId: user.telegramId,
        specialistId,
        serviceId,
        contactId,
        overall,
        qualityRating: quality || undefined,
        timingRating: timing || undefined,
        communicationRating: communication || undefined,
        text: text.trim() || undefined,
      });
      setDone(true);
      setTimeout(() => navigate(-1), 1800);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
        </div>
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Отзыв оставлен</h2>
        <p className="text-sm text-[#8E8E93]">Спасибо!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-semibold text-[#1A1A1A]">Оставить отзыв</h1>
      </header>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Label className="text-sm font-semibold text-[#1A1A1A] block mb-3">Общая оценка *</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "thumbs_up", icon: ThumbsUp, label: "Хорошо", color: "text-[#4CAF50]", bg: "bg-[#E8F5E9]" },
              { v: "neutral", icon: Meh, label: "Средне", color: "text-[#FF8C00]", bg: "bg-[#FFF8E1]" },
              { v: "thumbs_down", icon: ThumbsDown, label: "Плохо", color: "text-[#C62828]", bg: "bg-[#FCE4EC]" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setOverall(o.v as any)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 ${overall === o.v ? "border-[#FFB800]" : "border-transparent"} ${o.bg}`}
              >
                <o.icon className={`w-6 h-6 ${o.color}`} />
                <span className="text-xs font-medium text-[#1A1A1A]">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-sm font-semibold text-[#1A1A1A]">Детальные оценки</p>
          <div>
            <Label className="text-xs text-[#8E8E93] mb-2 block">Качество работы</Label>
            <Stars value={quality} onChange={setQuality} />
          </div>
          <div>
            <Label className="text-xs text-[#8E8E93] mb-2 block">Соблюдение сроков</Label>
            <Stars value={timing} onChange={setTiming} />
          </div>
          <div>
            <Label className="text-xs text-[#8E8E93] mb-2 block">Коммуникация</Label>
            <Stars value={communication} onChange={setCommunication} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Label className="text-xs text-[#8E8E93] mb-1 block">Комментарий (до 1000 символов)</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            rows={4}
            placeholder="Поделитесь опытом работы..."
          />
          <p className="text-[10px] text-[#8E8E93] mt-1 text-right">{text.length}/1000</p>
        </div>

        {error && <p className="text-xs text-[#C62828]">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={create.isPending}
          className="w-full h-12 bg-[#FFB800] hover:bg-[#FF8C00] text-white rounded-2xl"
        >
          {create.isPending ? "Отправка..." : "Оставить отзыв"}
        </Button>
      </div>
    </div>
  );
}
