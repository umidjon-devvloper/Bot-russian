import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, SlidersHorizontal, X, ChevronLeft, Shield, Users } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  candidate: "bg-[#E3F2FD] text-[#1565C0]",
  master: "bg-[#E8F5E9] text-[#2E7D32]",
  expert: "bg-[#FFF8E1] text-[#F57F17]",
  top: "bg-[#FCE4EC] text-[#C62828]",
};
const STATUS_LABELS: Record<string, string> = {
  candidate: "Кандидат", master: "Мастер", expert: "Эксперт", top: "Топ",
};

export function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories } = trpc.category.list.useQuery();
  const { data: specialists, isLoading } = trpc.specialist.list.useQuery({
    search: debouncedSearch || undefined,
    minRating,
    categoryId: selectedCategory ?? undefined,
    limit: 30,
    offset: 0,
  });

  const filtered = specialists;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-6">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A] flex-1">Каталог специалистов</h1>
          <button onClick={() => setShowFilters(v => !v)} className={`w-9 h-9 rounded-full flex items-center justify-center ${showFilters ? "bg-[#FFB800]" : "bg-[#F8F9FA]"}`}>
            <SlidersHorizontal className={`w-4 h-4 ${showFilters ? "text-white" : "text-[#8E8E93]"}`} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
          <Input
            placeholder="Поиск по специализации..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 bg-[#F8F9FA] border-0 rounded-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-[#8E8E93]" />
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white px-4 py-3 border-b border-[#E8EAED]">
          <p className="text-xs font-medium text-[#8E8E93] mb-2">Минимальный рейтинг</p>
          <div className="flex gap-2">
            {[undefined, 3, 4, 4.5].map(r => (
              <button
                key={r ?? "any"}
                onClick={() => setMinRating(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${minRating === r ? "bg-[#FFB800] text-white" : "bg-[#F8F9FA] text-[#8E8E93]"}`}
              >
                {r === undefined ? "Любой" : `${r}+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category chips */}
      {categories && categories.length > 0 && (
        <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${!selectedCategory ? "bg-[#FFB800] text-white" : "bg-white text-[#8E8E93]"}`}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            Все
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? "bg-[#FFB800] text-white" : "bg-white text-[#8E8E93]"}`}
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="px-4 pt-2 space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="w-12 h-12 text-[#E8EAED] mb-3" />
            <p className="text-sm font-medium text-[#8E8E93]">Специалисты не найдены</p>
            <p className="text-xs text-[#8E8E93] mt-1">Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#8E8E93] py-1">{filtered.length} специалистов</p>
            {filtered.map((sp: any) => (
              <button
                key={sp.id}
                onClick={() => navigate(`/specialist/${sp.id}`)}
                className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#F8F9FA] shrink-0 overflow-hidden flex items-center justify-center">
                  {sp.photoUrl
                    ? <img src={sp.photoUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-[#C0C0C0]">{sp.firstName?.[0] || "?"}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#1A1A1A]">
                      {sp.firstName} {sp.lastName}
                    </span>
                    {sp.status && (
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 ${STATUS_COLORS[sp.status] || ""}`}>
                        {STATUS_LABELS[sp.status] || sp.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#8E8E93] truncate mt-0.5">{sp.specialization || "Специалист"}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                      <span className="text-[11px] font-medium">{sp.rating > 0 ? sp.rating.toFixed(1) : "—"}</span>
                    </div>
                    <span className="text-[11px] text-[#8E8E93]">{sp.totalDeals} сделок</span>
                    {sp.totalReviews > 0 && <span className="text-[11px] text-[#8E8E93]">{sp.totalReviews} отзывов</span>}
                    {(sp.city || sp.country) && (
                      <span className="text-[11px] text-[#8E8E93] truncate">📍{sp.city || sp.country}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
