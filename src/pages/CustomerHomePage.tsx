import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search, Star, TrendingUp, Users, FileText, Heart, MessageSquare,
  ChevronRight, Zap, Briefcase, Plus, Bell, Settings as SettingsIcon,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  candidate: "bg-[#E3F2FD] text-[#1565C0]",
  master: "bg-[#E8F5E9] text-[#2E7D32]",
  expert: "bg-[#FFF8E1] text-[#F57F17]",
  top: "bg-[#FCE4EC] text-[#C62828]",
};
const STATUS_LABELS: Record<string, string> = {
  candidate: "Кандидат", master: "Мастер", expert: "Эксперт", top: "Топ",
};

export function CustomerHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: categories } = trpc.category.list.useQuery();
  const { data: specialists, isLoading: specsLoading } = trpc.specialist.list.useQuery({ limit: 6 });
  const { data: tenders } = trpc.tender.list.useQuery({ limit: 3 });
  const { data: stats } = trpc.stats.overview.useQuery();

  const firstName = user?.firstName || "Гость";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalog?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-[#1A1A1A]">
              {greeting}, {firstName}!
            </h1>
            <p className="text-xs text-[#8E8E93]">Найдите проверенного мастера</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/notifications")} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#8E8E93]" />
            </button>
            <button onClick={() => navigate("/favorites")} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#8E8E93]" />
            </button>
            <button onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-[#8E8E93]" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
          <Input
            placeholder="Поиск специалистов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 bg-[#F8F9FA] border-0 rounded-xl text-sm"
          />
        </form>
      </header>

      <div className="p-4 space-y-5">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users, label: "Специалистов", value: stats.totalSpecialists, color: "text-[#2196F3]", bg: "bg-[#E3F2FD]" },
              { icon: TrendingUp, label: "Сделок", value: stats.totalDeals, color: "text-[#4CAF50]", bg: "bg-[#E8F5E9]" },
              { icon: Star, label: "Отзывов", value: stats.totalReviews, color: "text-[#FFB800]", bg: "bg-[#FFF8E1]" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-1`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-base font-bold text-[#1A1A1A]">{Number(s.value || 0).toLocaleString()}</p>
                <p className="text-[10px] text-[#8E8E93]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/catalog")}
            className="bg-[#FFB800] text-white rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all"
          >
            <Search className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Найти специалиста</span>
          </button>
          <button
            onClick={() => navigate("/tender/new")}
            className="bg-white text-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <FileText className="w-5 h-5 shrink-0 text-[#FFB800]" />
            <span className="text-sm font-semibold">Создать тендер</span>
          </button>
          <button
            onClick={() => navigate("/vacancy")}
            className="bg-white text-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <Briefcase className="w-5 h-5 shrink-0 text-[#FFB800]" />
            <span className="text-sm font-semibold">Разместить вакансию</span>
          </button>
          <button
            onClick={() => navigate("/contacts")}
            className="bg-white text-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-all"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <MessageSquare className="w-5 h-5 shrink-0 text-[#FFB800]" />
            <span className="text-sm font-semibold">Мои контакты</span>
          </button>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">Категории услуг</h2>
            <ScrollArea>
              <div className="flex gap-2 pb-2">
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/catalog?categoryId=${cat.id}`)}
                    className="shrink-0 bg-white rounded-xl px-3 py-2 flex items-center gap-2 text-sm whitespace-nowrap active:scale-[0.97] transition-all"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  >
                    <span>{cat.emoji}</span>
                    <span className="text-[#1A1A1A] font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Top specialists */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Топ специалисты</h2>
            <button onClick={() => navigate("/catalog")} className="text-xs text-[#FFB800] flex items-center gap-0.5">
              Все <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {specsLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : !specialists?.length ? (
            <div className="bg-white rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-[#E8EAED] mx-auto mb-2" />
              <p className="text-sm text-[#8E8E93]">Специалисты появятся после регистрации</p>
            </div>
          ) : (
            <div className="space-y-2">
              {specialists.map((sp: any) => (
                <button
                  key={sp.id}
                  onClick={() => navigate(`/specialist/${sp.id}`)}
                  className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] flex items-center justify-center shrink-0 overflow-hidden">
                    {sp.photoUrl
                      ? <img src={sp.photoUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-lg font-bold text-[#8E8E93]">{sp.firstName?.[0] || "?"}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                        {sp.firstName} {sp.lastName}
                      </p>
                      {sp.status && (
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 ${STATUS_COLORS[sp.status] || ""} border-0`}>
                          {STATUS_LABELS[sp.status] || sp.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#8E8E93] truncate">{sp.specialization || "Специалист"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                        <span className="text-[11px] font-medium text-[#1A1A1A]">
                          {sp.rating > 0 ? sp.rating.toFixed(1) : "—"}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8E8E93]">·</span>
                      <span className="text-[11px] text-[#8E8E93]">{sp.totalDeals} сделок</span>
                      {(sp.city || sp.country) && (
                        <>
                          <span className="text-[11px] text-[#8E8E93]">·</span>
                          <span className="text-[11px] text-[#8E8E93] truncate">{sp.city || sp.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#E8EAED] shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active tenders */}
        {tenders && tenders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Активные тендеры</h2>
            </div>
            <div className="space-y-2">
              {tenders.map((t: any) => (
                <div key={t.id} className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{t.title}</p>
                      <p className="text-xs text-[#8E8E93] mt-0.5 line-clamp-2">{t.description}</p>
                    </div>
                    {t.priority !== "normal" && (
                      <Badge className="bg-[#FCE4EC] text-[#C62828] border-0 text-[10px] shrink-0">
                        <Zap className="w-2.5 h-2.5 mr-1" />
                        {t.priority === "urgent" ? "Срочно" : "Приоритет"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {t.budget && (
                      <span className="text-xs font-semibold text-[#FFB800]">
                        {Number(t.budget).toLocaleString()} ₽
                      </span>
                    )}
                    <span className="text-xs text-[#8E8E93]">{t.responses} откликов</span>
                    {t.deadline && <span className="text-xs text-[#8E8E93]">до {t.deadline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EAED] px-4 py-2 z-40">
        <div className="flex justify-around">
          {[
            { icon: Search, label: "Каталог", path: "/catalog" },
            { icon: FileText, label: "Тендеры", path: "/tenders" },
            { icon: Plus, label: "Вакансия", path: "/vacancy" },
            { icon: Heart, label: "Избранное", path: "/favorites" },
            { icon: MessageSquare, label: "Чаты", path: "/contacts" },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-0.5 py-1 px-2">
              <item.icon className="w-5 h-5 text-[#8E8E93]" />
              <span className="text-[10px] text-[#8E8E93]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
