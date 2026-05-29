import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Zap, Eye, MessageSquare, Calendar, Tag, CheckCircle2 } from "lucide-react";

export function TenderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenderId = Number(id);

  const { data: tender } = trpc.tender.byId.useQuery({ id: tenderId }, { enabled: !!tenderId });
  const respond = trpc.tender.respond.useMutation();

  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const isSpecialist = user?.selectedRole === "specialist" || user?.selectedRole === "both";

  const handleRespond = async () => {
    if (!user) return;
    setError("");
    try {
      await respond.mutateAsync({
        telegramId: user.telegramId,
        tenderId,
        message: message.trim() || undefined,
      });
      setDone(true);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    }
  };

  if (!tender) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-sm text-[#8E8E93]">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-semibold text-[#1A1A1A] truncate">Тендер</h1>
      </header>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="flex items-start gap-2 mb-3">
            <h2 className="flex-1 text-lg font-semibold text-[#1A1A1A]">{tender.title}</h2>
            {tender.priority !== "normal" && (
              <span className="shrink-0 px-2 py-0.5 bg-[#FCE4EC] text-[#C62828] text-[10px] rounded-full flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                {tender.priority === "urgent" ? "Срочно" : "Приоритет"}
              </span>
            )}
          </div>

          {tender.description && <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap mb-3">{tender.description}</p>}

          <div className="space-y-2">
            {tender.budget && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#8E8E93]">Бюджет:</span>
                <span className="font-semibold text-[#FFB800]">{Number(tender.budget).toLocaleString()} ₽</span>
              </div>
            )}
            {tender.deadline && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#8E8E93]" />
                <span>{tender.deadline}</span>
              </div>
            )}
            {tender.categoryName && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-[#8E8E93]" />
                <span>{tender.categoryEmoji} {tender.categoryName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-3 mt-3 border-t border-[#F0F0F0]">
            <span className="text-xs text-[#8E8E93] flex items-center gap-1"><Eye className="w-3 h-3" /> {tender.views}</span>
            <span className="text-xs text-[#8E8E93] flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {tender.responses}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Заказчик</p>
          <p className="text-sm text-[#8E8E93]">{tender.customerFirstName} {tender.customerLastName || ""}</p>
          {tender.customerUsername && (
            <a
              href={`https://t.me/${tender.customerUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-[#2196F3]"
            >
              @{tender.customerUsername}
            </a>
          )}
        </div>

        {isSpecialist && !done && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Откликнуться на тендер</p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              rows={3}
              placeholder="Ваше предложение заказчику..."
            />
            {error && <p className="text-xs text-[#C62828] mt-2">{error}</p>}
            <Button
              onClick={handleRespond}
              disabled={respond.isPending}
              className="w-full mt-3 bg-[#FFB800] hover:bg-[#FF8C00] text-white"
            >
              {respond.isPending ? "Отправка..." : "Отправить отклик"}
            </Button>
          </div>
        )}

        {done && (
          <div className="bg-[#E8F5E9] rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#4CAF50]" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Отклик отправлен</p>
              <p className="text-xs text-[#8E8E93]">Заказчик ответит вам в Telegram</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
