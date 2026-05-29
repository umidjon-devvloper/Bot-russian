import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { ChevronLeft, MessageCircle, ExternalLink, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  chat: "Переписка",
  deal_started: "Сделка",
  completed: "Завершено",
  cancelled: "Отменено",
};
const STATUS_COLORS: Record<string, string> = {
  chat: "text-[#2196F3]",
  deal_started: "text-[#FF9800]",
  completed: "text-[#4CAF50]",
  cancelled: "text-[#F44336]",
};

export function ContactsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: myProfile } = trpc.user.me.useQuery(
    { telegramId: user?.telegramId ?? 0 },
    { enabled: !!user?.telegramId }
  );

  // Контакты — в текущей архитектуре прямые, через Telegram
  // Показываем информационный экран с ссылкой на Telegram

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Контакты</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-[#E3F2FD] rounded-2xl p-4 flex gap-3">
          <MessageCircle className="w-5 h-5 text-[#2196F3] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#1565C0]">Прямая связь через Telegram</p>
            <p className="text-xs text-[#1565C0] mt-1 leading-relaxed">
              OmniFind не ограничивает общение — биржа является точкой встречи.
              После нахождения специалиста связь происходит напрямую в Telegram.
            </p>
          </div>
        </div>

        {user?.username && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-xs text-[#8E8E93] mb-2">Ваш Telegram</p>
            <a
              href={`https://t.me/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between"
            >
              <span className="text-sm font-medium text-[#1A1A1A]">@{user.username}</span>
              <ExternalLink className="w-4 h-4 text-[#8E8E93]" />
            </a>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Как связаться со специалистом</p>
          <ol className="space-y-2 text-sm text-[#8E8E93] list-none">
            {[
              "Найдите специалиста в каталоге",
              "Откройте его профиль",
              "Нажмите «Написать в Telegram»",
              "Договаривайтесь напрямую",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FFF8E1] text-[#FFB800] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => navigate("/catalog")}
          className="w-full h-12 bg-[#FFB800] text-white rounded-xl font-semibold active:scale-[0.97] transition-all"
        >
          Перейти в каталог
        </button>
      </div>
    </div>
  );
}
