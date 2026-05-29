import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Users, Star, FileText, TrendingUp, Shield,
  ChevronLeft, BarChart3, DollarSign, Award, Loader2,
  Settings, Send, MessageSquare,
} from "lucide-react";

type Section = "dashboard" | "moderation" | "channels" | "settings";

export function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const { data: stats, isLoading } = trpc.stats.dashboard.useQuery();
  const { data: modQueue } = trpc.stats.moderationQueue.useQuery();
  const { data: channels } = trpc.vacancy.channels.useQuery();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#E8EAED] mx-auto mb-3" />
          <p className="text-sm text-[#8E8E93]">Доступ только для администраторов</p>
          <button onClick={() => navigate("/")} className="text-xs text-[#FFB800] mt-2 block">На главную</button>
        </div>
      </div>
    );
  }

  const sections: { key: Section; label: string; icon: any }[] = [
    { key: "dashboard", label: "Дашборд", icon: BarChart3 },
    { key: "moderation", label: "Модерация", icon: Shield },
    { key: "channels", label: "Каналы", icon: Send },
    { key: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#1A1A1A]">Админ-панель</h1>
            <p className="text-xs text-[#8E8E93]">OmniFind управление</p>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeSection === s.key ? "bg-[#FFB800] text-white" : "bg-[#F8F9FA] text-[#8E8E93]"}`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
              {s.key === "moderation" && modQueue && modQueue.totalPending > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {modQueue.totalPending}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {/* DASHBOARD */}
        {activeSection === "dashboard" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#FFB800]" />
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Пользователей", value: stats.totalUsers, icon: Users, color: "text-[#2196F3]", bg: "bg-[#E3F2FD]" },
                    { label: "Специалистов", value: stats.totalSpecialists, icon: Award, color: "text-[#9C27B0]", bg: "bg-[#F3E5F5]" },
                    { label: "Активных услуг", value: stats.totalServices, icon: FileText, color: "text-[#FF9800]", bg: "bg-[#FFF3E0]" },
                    { label: "Сделок", value: stats.totalDeals, icon: TrendingUp, color: "text-[#4CAF50]", bg: "bg-[#E8F5E9]" },
                    { label: "Отзывов", value: stats.totalReviews, icon: Star, color: "text-[#FFB800]", bg: "bg-[#FFF8E1]" },
                    { label: "Тендеров", value: stats.totalTenders, icon: MessageSquare, color: "text-[#F44336]", bg: "bg-[#FFEBEE]" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{Number(s.value || 0).toLocaleString()}</p>
                        <p className="text-[11px] text-[#8E8E93]">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {stats.totalDealsVolume > 0 && (
                  <div className="bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Объём сделок</span>
                    </div>
                    <p className="text-2xl font-bold">{Number(stats.totalDealsVolume).toLocaleString()} ₽</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MODERATION */}
        {activeSection === "moderation" && (
          <div className="space-y-3">
            {modQueue && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Услуги", value: modQueue.pendingServices },
                  { label: "Отзывы", value: modQueue.pendingReviews },
                  { label: "Вакансии", value: modQueue.pendingVacancies },
                  { label: "Верификация", value: modQueue.pendingVerifications },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-3 flex justify-between items-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <span className="text-xs text-[#8E8E93]">{s.label}</span>
                    <Badge className={`border-0 text-xs ${Number(s.value) > 0 ? "bg-red-100 text-red-600" : "bg-[#E8F5E9] text-[#2E7D32]"}`}>
                      {s.value}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p className="text-sm text-[#8E8E93] text-center">
                Модерация контента доступна через Telegram бота командой <code className="text-[#FFB800]">/admin</code>
              </p>
            </div>
          </div>
        )}

        {/* CHANNELS */}
        {activeSection === "channels" && (
          <div className="space-y-3">
            <div className="bg-[#FFF8E1] rounded-2xl p-3 flex gap-2">
              <Send className="w-4 h-4 text-[#FFB800] mt-0.5 shrink-0" />
              <p className="text-xs text-[#5A4A00]">
                Управление каналами — через бота: <code>/add_channel</code>, <code>/del_channel</code>
              </p>
            </div>
            {!channels?.length ? (
              <div className="text-center py-8 text-[#8E8E93]">
                <Send className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Каналы не добавлены</p>
              </div>
            ) : channels.map((ch: any) => (
              <div key={ch.id} className="bg-white rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-[#2196F3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{ch.name}</p>
                  {ch.description && <p className="text-xs text-[#8E8E93] truncate">{ch.description}</p>}
                  {ch.membersCount > 0 && <p className="text-[10px] text-[#8E8E93]">{ch.membersCount.toLocaleString()} подписчиков</p>}
                </div>
                <Badge className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-xs">Активен</Badge>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === "settings" && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Настройки бота</h3>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Все настройки (топики, группа, гифка, Mini App URL) управляются через Telegram бота.<br /><br />
                Команды администратора:<br />
                <code className="text-[#FFB800]">/admin</code> — открыть панель<br />
                <code className="text-[#FFB800]">/set_group &lt;id&gt;</code> — ID группы<br />
                <code className="text-[#FFB800]">/set_topic specialists &lt;id&gt;</code> — анкеты<br />
                <code className="text-[#FFB800]">/set_topic deals &lt;id&gt;</code> — логи сделок<br />
                <code className="text-[#FFB800]">/set_gif</code> — загрузить гифку<br />
                <code className="text-[#FFB800]">/publish_rules</code> — правила чата<br />
                <code className="text-[#FFB800]">/stats</code> — статистика<br />
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
