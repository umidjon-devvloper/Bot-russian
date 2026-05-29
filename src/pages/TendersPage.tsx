import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Zap, Eye, MessageSquare } from "lucide-react";

export function TendersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tenders } = trpc.tender.list.useQuery({ limit: 50 });

  const isCustomer = user?.selectedRole === "customer" || user?.selectedRole === "both";

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-base font-semibold text-[#1A1A1A]">Тендеры</h1>
        </div>
        {isCustomer && (
          <Button onClick={() => navigate("/tender/new")} size="sm" className="bg-[#FFB800] hover:bg-[#FF8C00] text-white rounded-full h-9">
            <Plus className="w-4 h-4 mr-1" /> Новый
          </Button>
        )}
      </header>

      <div className="p-4 space-y-2">
        {!tenders?.length ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-sm text-[#8E8E93]">Активных тендеров нет</p>
          </div>
        ) : (
          tenders.map((t: any) => (
            <button
              key={t.id}
              onClick={() => navigate(`/tender/${t.id}`)}
              className="w-full text-left bg-white rounded-2xl p-3"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start gap-2 mb-2">
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
              <div className="flex items-center gap-3 text-xs">
                {t.budget && <span className="font-semibold text-[#FFB800]">{Number(t.budget).toLocaleString()} ₽</span>}
                <span className="text-[#8E8E93] flex items-center gap-0.5"><Eye className="w-3 h-3" /> {t.views}</span>
                <span className="text-[#8E8E93] flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {t.responses}</span>
                {t.categoryName && <span className="text-[#8E8E93]">{t.categoryEmoji} {t.categoryName}</span>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
