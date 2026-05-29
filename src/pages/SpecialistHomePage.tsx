import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Progress } from "@/components/ui/progress";
import {
  Star, FileText, Briefcase, MessageSquare, TrendingUp,
  Plus, ChevronRight, Settings, Zap, Users, Award,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  candidate: "Кандидат", master: "Мастер", expert: "Эксперт", top: "Топ",
};
const STATUS_NEXT: Record<string, string> = {
  candidate: "До статуса Мастер: завершите 3 сделки и заполните профиль",
  master: "До статуса Эксперт: 10 сделок и рейтинг 4.5+",
  expert: "До статуса Топ: 25 сделок и рейтинг 4.8+",
  top: "Вы достигли высшего статуса!",
};

export function SpecialistHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.firstName || "Мастер";

  const { data: profile } = trpc.user.me.useQuery(
    { telegramId: user?.telegramId ?? 0 },
    { enabled: !!user?.telegramId }
  );

  const { data: tenders } = trpc.tender.list.useQuery({ limit: 5 });

  const specProfile = profile?.specialistProfile as any;
  const completion = profile?.profileCompletion || 0;
  const status = specProfile?.status || "candidate";
  const rating = Number(specProfile?.rating || 0);
  const totalDeals = specProfile?.total_deals || 0;
  const totalReviews = specProfile?.total_reviews || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold text-[#1A1A1A]">{greeting}, {firstName}!</h1>
            <p className="text-xs text-[#8E8E93]">Профиль заполнен на {completion}%</p>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-[#8E8E93]" />
          </button>
        </div>
        <Progress value={completion} className="h-1.5" />
      </header>

      <div className="p-4 space-y-4">
        {/* Status card */}
        <div className="bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs opacity-80">Ваш статус</p>
              <p className="text-xl font-bold">{STATUS_LABELS[status] || status}</p>
            </div>
            <Award className="w-10 h-10 opacity-60" />
          </div>
          <p className="text-xs opacity-80">{STATUS_NEXT[status]}</p>
        </div>

        {/* My stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Star, value: rating > 0 ? rating.toFixed(1) : "—", label: "Рейтинг", color: "text-[#FFB800]", bg: "bg-[#FFF8E1]" },
            { icon: TrendingUp, value: totalDeals, label: "Сделок", color: "text-[#4CAF50]", bg: "bg-[#E8F5E9]" },
            { icon: Users, value: totalReviews, label: "Отзывов", color: "text-[#2196F3]", bg: "bg-[#E3F2FD]" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-1`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-base font-bold text-[#1A1A1A]">{s.value}</p>
              <p className="text-[10px] text-[#8E8E93]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate(`/specialist/${profile?.id}`)}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all text-left"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#FFB800]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A]">Мой профиль</p>
              <p className="text-[10px] text-[#8E8E93]">Как видят клиенты</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/contacts")}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all text-left"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[#2196F3]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A]">Контакты</p>
              <p className="text-[10px] text-[#8E8E93]">Заказчики</p>
            </div>
          </button>
        </div>

        {/* Tenders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Свежие тендеры</h2>
          </div>
          {!tenders?.length ? (
            <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <FileText className="w-8 h-8 text-[#E8EAED] mx-auto mb-2" />
              <p className="text-sm text-[#8E8E93]">Тендеров пока нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tenders.map((t: any) => (
                <div key={t.id} className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{t.title}</p>
                      {t.description && <p className="text-xs text-[#8E8E93] mt-0.5 line-clamp-2">{t.description}</p>}
                    </div>
                    {t.priority !== "normal" && (
                      <span className="shrink-0 px-2 py-0.5 bg-[#FCE4EC] text-[#C62828] text-[10px] rounded-full flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        {t.priority === "urgent" ? "Срочно" : "Приоритет"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {t.budget && (
                      <span className="text-xs font-semibold text-[#FFB800]">{Number(t.budget).toLocaleString()} ₽</span>
                    )}
                    <span className="text-xs text-[#8E8E93]">{t.responses} откликов</span>
                    {t.categoryName && <span className="text-xs text-[#8E8E93]">{t.categoryEmoji} {t.categoryName}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EAED] px-4 py-2 z-40">
        <div className="flex justify-around">
          {[
            { icon: Briefcase, label: "Тендеры", action: () => navigate("/tenders") },
            { icon: Plus, label: "Услуги", action: () => navigate("/services/manage") },
            { icon: MessageSquare, label: "Контакты", action: () => navigate("/contacts") },
            { icon: Award, label: "Профиль", action: () => navigate("/settings") },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="flex flex-col items-center gap-0.5 py-1 px-2">
              <item.icon className="w-5 h-5 text-[#8E8E93]" />
              <span className="text-[10px] text-[#8E8E93]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
