import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, MapPin, MessageCircle, Share2, ChevronLeft,
  Award, Users, Check, Loader2, ExternalLink, Briefcase, Heart,
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

export function SpecialistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"services" | "portfolio" | "reviews">("services");
  const [shareToast, setShareToast] = useState("");

  // Избранное (мастера) — храним в localStorage
  const specialistId = Number(id);
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("omnifind_favorite_specialists") || "[]");
      return Array.isArray(arr) && arr.includes(specialistId);
    } catch { return false; }
  });

  const toggleFavorite = () => {
    try {
      const arr: number[] = JSON.parse(localStorage.getItem("omnifind_favorite_specialists") || "[]");
      const set = new Set(Array.isArray(arr) ? arr : []);
      if (set.has(specialistId)) {
        set.delete(specialistId);
        setIsFavorite(false);
        setShareToast("Убрано из избранного");
      } else {
        set.add(specialistId);
        setIsFavorite(true);
        setShareToast("Добавлено в избранное");
      }
      localStorage.setItem("omnifind_favorite_specialists", JSON.stringify(Array.from(set)));
      setTimeout(() => setShareToast(""), 1800);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${fullName}${profile?.specialization ? ` — ${profile.specialization}` : ""} | OmniFind`;
    const tg = (window as any).Telegram?.WebApp;

    // 1) Внутри Telegram — открываем нативное окно "Поделиться ссылкой"
    if (tg?.openTelegramLink) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      try { tg.openTelegramLink(shareUrl); return; } catch {}
    }

    // 2) Web Share API (мобильные браузеры)
    if (navigator.share) {
      try { await navigator.share({ title: fullName, text, url }); return; }
      catch (e: any) { if (e?.name === "AbortError") return; /* пользователь отменил */ }
    }

    // 3) Fallback — копируем ссылку в буфер обмена
    try {
      await navigator.clipboard.writeText(url);
      setShareToast("Ссылка скопирована");
    } catch {
      setShareToast("Не удалось скопировать");
    }
    setTimeout(() => setShareToast(""), 2200);
  };

  const { data, isLoading } = trpc.specialist.detail.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFB800]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <p className="text-[#8E8E93] mb-4">Специалист не найден</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">Назад</Button>
        </div>
      </div>
    );
  }

  const { user, profile, services, reviews, portfolios, links } = data;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const handleContact = () => {
    if (user.username) {
      window.open(`https://t.me/${user.username}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28">
      {/* Cover */}
      <div className="relative bg-gradient-to-br from-[#FFF8E1] to-[#FFE0B2] h-32">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center z-10"
        >
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={toggleFavorite}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
            aria-label="Избранное"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isFavorite ? "fill-[#F44336] text-[#F44336]" : "text-[#1A1A1A]"}`}
            />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
            aria-label="Поделиться"
          >
            <Share2 className="w-4 h-4 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="px-4 pb-4">
        <div className="relative -mt-10 flex items-end gap-3 mb-3">
          <div className="w-20 h-20 rounded-2xl border-4 border-white bg-[#F8F9FA] overflow-hidden flex items-center justify-center shadow-md">
            {user.photoUrl
              ? <img src={user.photoUrl} alt={fullName} className="w-full h-full object-cover" />
              : <span className="text-3xl font-bold text-[#C0C0C0]">{user.firstName?.[0] || "?"}</span>
            }
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-[#1A1A1A]">{fullName}</h1>
              {profile.status && (
                <Badge className={`text-xs border-0 ${STATUS_COLORS[profile.status] || ""}`}>
                  {STATUS_LABELS[profile.status] || profile.status}
                </Badge>
              )}
            </div>
            {profile.specialization && (
              <p className="text-sm text-[#8E8E93]">{profile.specialization}</p>
            )}
          </div>
        </div>

        {/* Location */}
        {(user.city || user.country) && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span className="text-xs text-[#8E8E93]">{[user.city, user.country].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-[#1A1A1A] mb-3 leading-relaxed">{user.bio}</p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { value: profile.rating > 0 ? profile.rating.toFixed(1) : "—", label: "Рейтинг", icon: Star },
            { value: profile.totalDeals, label: "Сделок", icon: Check },
            { value: profile.totalReviews, label: "Отзывов", icon: Award },
            { value: profile.totalContacts, label: "Контактов", icon: Users },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p className="text-sm font-bold text-[#1A1A1A]">{s.value}</p>
              <p className="text-[10px] text-[#8E8E93]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {links.map((l: any, i: number) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl text-xs text-[#1A1A1A] border border-[#E8EAED]"
              >
                <ExternalLink className="w-3 h-3" />
                {l.title || l.linkType}
              </a>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-[#F8F9FA] rounded-xl p-1 mb-4">
          {(["services", "portfolio", "reviews"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tab ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8E8E93]"}`}
            >
              {tab === "services" ? `Услуги (${services.length})` : tab === "portfolio" ? `Портфолио (${portfolios.length})` : `Отзывы (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "services" && (
          <div className="space-y-2">
            {!services.length ? (
              <div className="text-center py-8 text-[#8E8E93]">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Услуги не добавлены</p>
              </div>
            ) : services.map((svc: any) => (
              <button
                key={svc.id}
                onClick={() => navigate(`/service/${svc.id}`)}
                className="w-full bg-white rounded-2xl p-3 text-left"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start gap-3">
                  {svc.coverImage ? (
                    <img src={svc.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#FFF8E1] flex items-center justify-center shrink-0 text-2xl">
                      {svc.categoryEmoji || "📦"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{svc.title}</p>
                    {svc.categoryName && (
                      <p className="text-xs text-[#8E8E93] mt-0.5">{svc.categoryEmoji} {svc.categoryName}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-[#FFB800]">
                        от {Number(svc.price).toLocaleString()} {svc.currency}
                      </p>
                      {svc.avgRating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                          <span className="text-[11px]">{svc.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-3">
            {!portfolios.length ? (
              <div className="text-center py-8 text-[#8E8E93]">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Портфолио не добавлено</p>
              </div>
            ) : portfolios.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {p.images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-0.5">
                    {p.images.slice(0, 3).map((img: string, i: number) => (
                      <img key={i} src={img} alt="" className="w-full h-24 object-cover" />
                    ))}
                  </div>
                )}
                {p.description && (
                  <div className="p-3">
                    <p className="text-sm text-[#1A1A1A]">{p.description}</p>
                    {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {p.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F8F9FA] rounded-full text-[#8E8E93]">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3">
            {!reviews.length ? (
              <div className="text-center py-8 text-[#8E8E93]">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Отзывов пока нет</p>
              </div>
            ) : reviews.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#F8F9FA] overflow-hidden flex items-center justify-center">
                    {r.customerPhoto
                      ? <img src={r.customerPhoto} alt="" className="w-full h-full object-cover" />
                      : <span className="text-sm font-bold text-[#C0C0C0]">{r.customerFirstName?.[0] || "?"}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1A1A1A]">{r.customerFirstName}</p>
                    <p className="text-[10px] text-[#8E8E93]">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <span className="text-lg">{r.overall === "thumbs_up" ? "👍" : r.overall === "thumbs_down" ? "👎" : "😐"}</span>
                </div>
                {r.text && <p className="text-sm text-[#1A1A1A]">{r.text}</p>}
                {r.qualityRating && (
                  <div className="flex gap-3 mt-2">
                    {[["Качество", r.qualityRating], ["Сроки", r.timingRating], ["Связь", r.communicationRating]].filter(([,v]) => v).map(([label, val]) => (
                      <div key={label as string} className="text-center">
                        <p className="text-[10px] text-[#8E8E93]">{label}</p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < Number(val) ? "text-[#FFB800] fill-[#FFB800]" : "text-[#E8EAED]"}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast уведомление о копировании */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-4 py-2 rounded-full z-50 shadow-lg">
          {shareToast}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EAED] p-4 z-40">
        <Button
          onClick={handleContact}
          disabled={!user.username}
          className="w-full h-12 bg-[#FFB800] hover:bg-[#E6A600] text-white rounded-xl font-semibold"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {user.username ? "Написать в Telegram" : "Контакт не указан"}
        </Button>
      </div>
    </div>
  );
}
