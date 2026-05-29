import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { ChevronLeft, Heart, Star, Trash2 } from "lucide-react";

const SERVICES_KEY = "omnifind_favorites";
const SPECIALISTS_KEY = "omnifind_favorite_specialists";

function loadIds(key: string): number[] {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"services" | "specialists">("services");

  const [favServiceIds, setFavServiceIds] = useState<number[]>(() => loadIds(SERVICES_KEY));
  const [favSpecIds, setFavSpecIds] = useState<number[]>(() => loadIds(SPECIALISTS_KEY));

  const { data: allServices } = trpc.service.list.useQuery({ limit: 100 });
  const { data: allSpecialists } = trpc.specialist.list.useQuery({ limit: 100 });

  const favServices = allServices?.filter((s: any) => favServiceIds.includes(s.id)) || [];
  const favSpecialists = allSpecialists?.filter((s: any) => favSpecIds.includes(s.id)) || [];

  const removeService = (id: number) => {
    const updated = favServiceIds.filter((x) => x !== id);
    setFavServiceIds(updated);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
  };
  const removeSpecialist = (id: number) => {
    const updated = favSpecIds.filter((x) => x !== id);
    setFavSpecIds(updated);
    localStorage.setItem(SPECIALISTS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-6">
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Избранное</h1>
        </div>
        <div className="flex bg-[#F8F9FA] rounded-xl p-1">
          {([
            { v: "services", label: `Услуги (${favServices.length})` },
            { v: "specialists", label: `Мастера (${favSpecialists.length})` },
          ] as const).map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === t.v ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8E8E93]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {tab === "services" ? (
          favServices.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF8E1] flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-[#FFB800]" />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-1">Услуг в избранном нет</p>
              <p className="text-xs text-[#8E8E93]">Добавляйте услуги в избранное из каталога</p>
              <button onClick={() => navigate("/catalog")} className="mt-4 text-sm text-[#FFB800] font-medium">
                Перейти в каталог
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {favServices.map((svc: any) => (
                <div key={svc.id} className="bg-white rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/service/${svc.id}`)}>
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{svc.title}</p>
                    <p className="text-xs text-[#8E8E93]">{svc.specialistFirstName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#FFB800]">
                        {Number(svc.price).toLocaleString()} {svc.currency}
                      </span>
                      {svc.avgRating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                          <span className="text-[11px]">{svc.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeService(svc.id)} className="w-9 h-9 rounded-full bg-[#FFEBEE] flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-[#F44336]" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          favSpecialists.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF8E1] flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-[#FFB800]" />
              </div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-1">Мастеров в избранном нет</p>
              <p className="text-xs text-[#8E8E93]">Откройте профиль мастера и нажмите ♡</p>
              <button onClick={() => navigate("/catalog")} className="mt-4 text-sm text-[#FFB800] font-medium">
                Перейти в каталог
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {favSpecialists.map((sp: any) => (
                <div key={sp.id} className="bg-white rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] overflow-hidden flex items-center justify-center shrink-0 cursor-pointer"
                    onClick={() => navigate(`/specialist/${sp.id}`)}>
                    {sp.photoUrl
                      ? <img src={sp.photoUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-lg font-bold text-[#C0C0C0]">{sp.firstName?.[0] || "?"}</span>}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/specialist/${sp.id}`)}>
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{sp.firstName} {sp.lastName || ""}</p>
                    <p className="text-xs text-[#8E8E93] truncate">{sp.specialization || "Специалист"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                        <span className="text-[11px]">{sp.rating > 0 ? sp.rating.toFixed(1) : "—"}</span>
                      </div>
                      <span className="text-[11px] text-[#8E8E93]">{sp.totalDeals} сделок</span>
                    </div>
                  </div>
                  <button onClick={() => removeSpecialist(sp.id)} className="w-9 h-9 rounded-full bg-[#FFEBEE] flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-[#F44336]" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
