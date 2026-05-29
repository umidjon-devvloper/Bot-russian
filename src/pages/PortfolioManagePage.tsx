import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Trash2, X, Link as LinkIcon, ImagePlus, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image";

const LINK_TYPES = [
  { value: "website", label: "Сайт" },
  { value: "behance", label: "Behance" },
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "telegram_channel", label: "Telegram-канал" },
  { value: "other", label: "Другое" },
];

export function PortfolioManagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);

  const { data: portfolios, refetch: refetchP } = trpc.portfolio.myList.useQuery(
    { telegramId: user?.telegramId ?? 0 },
    { enabled: !!user?.telegramId }
  );
  const { data: links, refetch: refetchL } = trpc.portfolio.myLinks.useQuery(
    { telegramId: user?.telegramId ?? 0 },
    { enabled: !!user?.telegramId }
  );
  const createP = trpc.portfolio.create.useMutation();
  const removeP = trpc.portfolio.remove.useMutation();
  const addLink = trpc.portfolio.addLink.useMutation();
  const removeLink = trpc.portfolio.removeLink.useMutation();

  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [linkType, setLinkType] = useState("website");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      const compressed: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 15 * 1024 * 1024) {
          setUploadError("Файл больше 15 МБ — пропущен");
          continue;
        }
        compressed.push(await compressImage(file));
      }
      setImageUrls((prev) => [...prev, ...compressed].slice(0, 10));
    } catch (e: any) {
      setUploadError(e?.message || "Ошибка обработки файла");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!user || !description.trim()) return;
    await createP.mutateAsync({
      telegramId: user.telegramId,
      description: description.trim(),
      tags: tags.length ? tags : undefined,
      imageUrls: imageUrls.length ? imageUrls : undefined,
    });
    setDescription(""); setTags([]); setImageUrls([]);
    setShowForm(false);
    await refetchP();
  };

  const handleAddLink = async () => {
    if (!user || !linkUrl.trim()) return;
    await addLink.mutateAsync({
      telegramId: user.telegramId,
      linkType,
      url: linkUrl.trim(),
      title: linkTitle.trim() || undefined,
    });
    setLinkUrl(""); setLinkTitle("");
    setShowLinkForm(false);
    await refetchL();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-semibold text-[#1A1A1A]">Портфолио</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Loyihalar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Проекты</h2>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="sm" variant="outline" className="h-8 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Добавить
              </Button>
            )}
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-4 space-y-3 mb-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Новый проект</h3>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-[#8E8E93]" /></button>
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Описание *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 1000))} rows={3} placeholder="О проекте..." />
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Теги</Label>
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(""); } } }}
                  placeholder="Тег + Enter" />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        #{t} <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="ml-1">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Изображения (до 10 шт.)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || imageUrls.length >= 10}
                  className="w-full h-20 rounded-xl border-2 border-dashed border-[#E8EAED] flex flex-col items-center justify-center gap-1 text-[#8E8E93] hover:border-[#FFB800] hover:text-[#FFB800] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">Обработка...</span></>
                  ) : (
                    <><ImagePlus className="w-5 h-5" /><span className="text-xs">Выбрать фото из галереи</span></>
                  )}
                </button>
                <p className="text-[10px] text-[#8E8E93] mt-1">
                  Фото автоматически сжимаются до 1200px. Поддерживаются JPG, PNG, WebP
                </p>
                {uploadError && <p className="text-[10px] text-[#C62828] mt-1">{uploadError}</p>}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {imageUrls.map((u, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#F0F0F0]">
                        <img src={u} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleCreate} disabled={createP.isPending} className="w-full bg-[#FFB800] hover:bg-[#FF8C00] text-white">
                {createP.isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          )}

          {!portfolios?.length ? (
            <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p className="text-sm text-[#8E8E93]">Проектов пока нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              {portfolios.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-[#1A1A1A]">{p.description}</p>
                      {p.tags && Array.isArray(p.tags) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] text-[#8E8E93]">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={async () => {
                      if (!user || !confirm("Удалить проект?")) return;
                      await removeP.mutateAsync({ telegramId: user.telegramId, portfolioId: p.id });
                      await refetchP();
                    }} className="text-[#C62828] p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {p.images?.length > 0 && (
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {p.images.slice(0, 4).map((img: string, i: number) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F0F0F0]">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tashqi havolalar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Внешние ссылки</h2>
            {!showLinkForm && (
              <Button onClick={() => setShowLinkForm(true)} size="sm" variant="outline" className="h-8 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Добавить
              </Button>
            )}
          </div>

          {showLinkForm && (
            <div className="bg-white rounded-2xl p-4 space-y-3 mb-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Новая ссылка</h3>
                <button onClick={() => setShowLinkForm(false)}><X className="w-5 h-5 text-[#8E8E93]" /></button>
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Тип</Label>
                <select value={linkType} onChange={(e) => setLinkType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#E8EAED] px-3 text-sm">
                  {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">URL *</Label>
                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Название</Label>
                <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Например: Мой сайт" />
              </div>
              <Button onClick={handleAddLink} disabled={addLink.isPending} className="w-full bg-[#FFB800] hover:bg-[#FF8C00] text-white">
                Добавить
              </Button>
            </div>
          )}

          {!links?.length ? (
            <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p className="text-sm text-[#8E8E93]">Ссылок нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((l: any) => (
                <div key={l.id} className="bg-white rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
                    <LinkIcon className="w-4 h-4 text-[#2196F3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{l.title || l.url}</p>
                    <p className="text-[10px] text-[#8E8E93] truncate">{l.linkType}</p>
                  </div>
                  <button onClick={async () => {
                    if (!user) return;
                    await removeLink.mutateAsync({ telegramId: user.telegramId, linkId: l.id });
                    await refetchL();
                  }} className="text-[#C62828] p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
