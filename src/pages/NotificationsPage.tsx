import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bell, CheckCheck, Star, MessageSquare, Briefcase, Award } from "lucide-react";

const TYPE_ICONS: Record<string, any> = {
  new_review: Star,
  new_tender_application: Briefcase,
  service_status_changed: Award,
  deal_completed: CheckCheck,
  new_contact: MessageSquare,
};
const TYPE_COLORS: Record<string, string> = {
  new_review: "bg-[#FFF8E1] text-[#FFB800]",
  new_tender_application: "bg-[#E3F2FD] text-[#2196F3]",
  service_status_changed: "bg-[#F3E5F5] text-[#9C27B0]",
  deal_completed: "bg-[#E8F5E9] text-[#4CAF50]",
  new_contact: "bg-[#FFF3E0] text-[#FF8C00]",
};

function formatTime(d: string | Date) {
  const date = new Date(d);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return date.toLocaleDateString("ru-RU");
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, refetch } = trpc.notification.list.useQuery(
    { telegramId: user?.telegramId ?? 0, limit: 50 },
    { enabled: !!user?.telegramId }
  );
  const markRead = trpc.notification.markRead.useMutation();

  const handleMarkAll = async () => {
    if (!user) return;
    await markRead.mutateAsync({ telegramId: user.telegramId, all: true });
    await refetch();
  };

  const handleClick = async (id: number, data: any) => {
    if (!user) return;
    await markRead.mutateAsync({ telegramId: user.telegramId, notificationId: id });
    await refetch();
    // Tegishli sahifaga o'tish
    if (data?.tenderId) navigate(`/tender/${data.tenderId}`);
    else if (data?.serviceId) navigate(`/service/${data.serviceId}`);
    else if (data?.specialistId) navigate(`/specialist/${data.specialistId}`);
    else if (data?.contactId) navigate("/contacts");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-base font-semibold text-[#1A1A1A]">Уведомления</h1>
          {data?.unreadCount ? (
            <span className="text-xs bg-[#C62828] text-white rounded-full w-5 h-5 flex items-center justify-center">
              {data.unreadCount}
            </span>
          ) : null}
        </div>
        {data?.unreadCount ? (
          <Button onClick={handleMarkAll} size="sm" variant="ghost" className="text-xs text-[#FFB800] h-9">
            <CheckCheck className="w-4 h-4 mr-1" /> Прочитать всё
          </Button>
        ) : null}
      </header>

      <div className="p-4">
        {!data?.items.length ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Bell className="w-10 h-10 text-[#E8EAED] mx-auto mb-2" />
            <p className="text-sm text-[#8E8E93]">Уведомлений пока нет</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.items.map((n: any) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              const colors = TYPE_COLORS[n.type] || "bg-[#F0F0F0] text-[#8E8E93]";
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.id, n.data)}
                  className={`w-full text-left rounded-2xl p-3 flex items-start gap-3 ${n.isRead ? "bg-white" : "bg-[#FFF8E1]"}`}
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <div className={`w-9 h-9 rounded-xl ${colors} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{n.title}</p>
                    {n.body && <p className="text-xs text-[#8E8E93] mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-[#8E8E93] mt-1">{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#FFB800] shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
