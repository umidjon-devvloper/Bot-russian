import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, ChevronLeft, Shield, MessageCircle, Clock,
  CheckCircle, Loader2, Eye, Share2,
} from "lucide-react";

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: service, isLoading } = trpc.service.byId.useQuery(
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

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <p className="text-[#8E8E93] mb-4">Услуга не найдена</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">Назад</Button>
        </div>
      </div>
    );
  }

  const handleContact = () => {
    if (service.specialist.username) {
      window.open(`https://t.me/${service.specialist.username}`, "_blank");
    } else {
      navigate(`/specialist/${service.userId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-base font-semibold text-[#1A1A1A] flex-1 truncate">{service.title}</h1>
          <button
            onClick={() => navigator.share?.({ title: service.title, url: window.location.href })}
            className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-[#8E8E93]" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Images */}
        {service.images && service.images.length > 0 && (
          <div className="rounded-2xl overflow-hidden">
            <div className={`grid gap-1 ${service.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {service.images.slice(0, 4).map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-full h-40 object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Price block */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{service.title}</h2>
              {service.categoryName && (
                <p className="text-xs text-[#8E8E93] mt-0.5">{service.categoryEmoji} {service.categoryName}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#FFB800]">
                {Number(service.price).toLocaleString()} {service.currency}
              </p>
              {service.deadlineValue && (
                <p className="text-xs text-[#8E8E93] flex items-center gap-0.5 justify-end mt-0.5">
                  <Clock className="w-3 h-3" />
                  {service.deadlineValue} {service.deadlineUnit}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {service.avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" />
                <span className="text-sm font-medium">{service.avgRating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[#8E8E93]">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs">{service.views}</span>
            </div>
            {service.safeDeal && (
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span className="text-xs text-[#4CAF50]">Безопасная сделка</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {service.description && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Описание</h3>
            <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>
        )}

        {/* What's included */}
        {service.whatIncluded && Array.isArray(service.whatIncluded) && service.whatIncluded.length > 0 && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Что входит</h3>
            <div className="space-y-1.5">
              {service.whatIncluded.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                  <span className="text-sm text-[#1A1A1A]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialist */}
        <div
          className="bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          onClick={() => navigate(`/specialist/${service.userId}`)}
        >
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] overflow-hidden flex items-center justify-center shrink-0">
            {service.specialist.photoUrl
              ? <img src={service.specialist.photoUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-xl font-bold text-[#C0C0C0]">{service.specialist.firstName?.[0] || "?"}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {service.specialist.firstName} {service.specialist.lastName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {service.specialist.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                  <span className="text-[11px]">{service.specialist.rating.toFixed(1)}</span>
                </div>
              )}
              <span className="text-[11px] text-[#8E8E93]">{service.specialist.totalDeals} сделок</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#E8EAED] rotate-180" />
        </div>

        {/* Tags */}
        {service.tags && Array.isArray(service.tags) && service.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {service.tags.map((tag: string, i: number) => (
              <Badge key={i} className="bg-[#F8F9FA] text-[#8E8E93] border-0 text-xs">#{tag}</Badge>
            ))}
          </div>
        )}

        {/* Reviews */}
        {service.reviews && service.reviews.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Отзывы ({service.reviews.length})</h3>
            {service.reviews.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-[#F8F9FA] overflow-hidden flex items-center justify-center">
                    {r.customerPhoto
                      ? <img src={r.customerPhoto} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold text-[#C0C0C0]">{r.customerName?.[0] || "?"}</span>
                    }
                  </div>
                  <span className="text-xs font-medium text-[#1A1A1A]">{r.customerName}</span>
                  <span className="ml-auto text-base">{r.overall === "thumbs_up" ? "👍" : r.overall === "thumbs_down" ? "👎" : "😐"}</span>
                </div>
                {r.text && <p className="text-xs text-[#1A1A1A]">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EAED] p-4 z-40">
        <Button
          onClick={handleContact}
          className="w-full h-12 bg-[#FFB800] hover:bg-[#E6A600] text-white rounded-xl font-semibold"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Написать специалисту
        </Button>
      </div>
    </div>
  );
}
