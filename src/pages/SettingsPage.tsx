import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Briefcase, Users, ChevronRight, Edit3, FolderOpen, Image, Bell, Shield } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  specialist: "Специалист",
  customer: "Заказчик",
  both: "Обе роли",
  admin: "Администратор",
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, refetch } = useAuth();
  const setRole = trpc.auth.setRole.useMutation();

  const isSpecialist = user?.selectedRole === "specialist" || user?.selectedRole === "both";
  const isAdmin = user?.role === "admin";

  const switchRole = async (role: "specialist" | "customer" | "both") => {
    if (!user) return;
    await setRole.mutateAsync({ telegramId: user.telegramId, role });
    await refetch();
    if (role === "specialist") navigate("/specialist-home");
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-semibold text-[#1A1A1A]">Настройки</h1>
      </header>

      <div className="p-4 space-y-3">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FFB800] flex items-center justify-center text-white font-bold">
              {(user?.firstName?.[0] || "?").toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#1A1A1A] truncate">{user?.firstName} {user?.lastName || ""}</p>
            {user?.username && <p className="text-xs text-[#8E8E93]">@{user.username}</p>}
            <p className="text-[10px] text-[#FFB800] mt-0.5">{ROLE_LABELS[user?.selectedRole || ""]}</p>
          </div>
        </div>

        {/* Profile actions */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {[
            { icon: Edit3, label: "Редактировать профиль", path: "/profile/edit", show: true },
            { icon: FolderOpen, label: "Мои услуги", path: "/services/manage", show: isSpecialist },
            { icon: Image, label: "Портфолио", path: "/portfolio", show: isSpecialist },
            { icon: Bell, label: "Уведомления", path: "/notifications", show: true },
            { icon: Shield, label: "Админ-панель", path: "/admin", show: isAdmin },
          ].filter((i) => i.show).map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0] last:border-0 active:bg-[#F8F9FA]"
            >
              <item.icon className="w-5 h-5 text-[#8E8E93]" />
              <span className="flex-1 text-left text-sm text-[#1A1A1A]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
            </button>
          ))}
        </div>

        {/* Role switcher */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-semibold text-[#8E8E93] uppercase mb-3">Сменить роль</p>
          <div className="space-y-2">
            {[
              { v: "specialist", icon: Briefcase, label: "Специалист", desc: "Оказание услуг, портфолио, отклики на тендеры" },
              { v: "customer", icon: User, label: "Заказчик", desc: "Поиск мастеров, вакансии, размещение тендеров" },
              { v: "both", icon: Users, label: "Обе роли", desc: "Одновременно специалист и заказчик" },
            ].map((r) => {
              const active = user?.selectedRole === r.v;
              return (
                <button
                  key={r.v}
                  onClick={() => !active && switchRole(r.v as any)}
                  disabled={active || setRole.isPending}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border ${active ? "border-[#FFB800] bg-[#FFF8E1]" : "border-[#E8EAED] bg-white"} ${active ? "" : "active:bg-[#F8F9FA]"}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-[#FFB800] text-white" : "bg-[#F8F9FA] text-[#8E8E93]"}`}>
                    <r.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{r.label} {active && <span className="text-[10px] text-[#FFB800]">(текущая)</span>}</p>
                    <p className="text-[10px] text-[#8E8E93]">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-3">
            При смене роли услуги, портфолио и отзывы сохраняются
          </p>
        </div>

        <Button
          onClick={() => navigate("/contacts")}
          variant="outline"
          className="w-full h-12 rounded-2xl"
        >
          Помощь и контакты
        </Button>
      </div>
    </div>
  );
}
