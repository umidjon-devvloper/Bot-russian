import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Trash2, Eye, Clock, X, ImagePlus, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "На модерации", color: "bg-[#FFF8E1] text-[#FF8C00]" },
  active: { label: "Активна", color: "bg-[#E8F5E9] text-[#4CAF50]" },
  rejected: { label: "Отклонена", color: "bg-[#FCE4EC] text-[#C62828]" },
  archived: { label: "Архив", color: "bg-[#F0F0F0] text-[#8E8E93]" },
};

export function ServicesManagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data: services, refetch } = trpc.service.myList.useQuery(
    { telegramId: user?.telegramId ?? 0 },
    { enabled: !!user?.telegramId }
  );
  const { data: categories } = trpc.category.list.useQuery();
  const createMutation = trpc.service.create.useMutation();
  const removeMutation = trpc.service.remove.useMutation();

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("RUB");
  const [deadlineValue, setDeadlineValue] = useState("");
  const [deadlineUnit, setDeadlineUnit] = useState("days");
  const [whatIncluded, setWhatIncluded] = useState<string[]>([]);
  const [includedInput, setIncludedInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

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

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategoryId(undefined); setPrice("");
    setCurrency("RUB"); setDeadlineValue(""); setDeadlineUnit("days");
    setWhatIncluded([]); setIncludedInput(""); setTags([]); setTagInput("");
    setImageUrls([]); setUploadError(""); setError("");
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!title.trim() || !categoryId || !price) {
      setError("Заполните название, категорию и цену");
      return;
    }
    setError("");
    try {
      await createMutation.mutateAsync({
        telegramId: user.telegramId,
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        price: Number(price),
        currency,
        deadlineValue: deadlineValue ? Number(deadlineValue) : undefined,
        deadlineUnit: deadlineValue ? deadlineUnit : undefined,
        whatIncluded: whatIncluded.length ? whatIncluded : undefined,
        tags: tags.length ? tags : undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
      });
      resetForm();
      setShowForm(false);
      await refetch();
    } catch (e: any) {
      setError(e.message || "Ошибка");
    }
  };

  const handleRemove = async (id: number) => {
    if (!user || !confirm("Архивировать услугу?")) return;
    await removeMutation.mutateAsync({ telegramId: user.telegramId, serviceId: id });
    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-base font-semibold text-[#1A1A1A]">Мои услуги</h1>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#FFB800] hover:bg-[#FF8C00] text-white rounded-full h-9">
            <Plus className="w-4 h-4 mr-1" /> Новая
          </Button>
        )}
      </header>

      <div className="p-4 space-y-3">
        {showForm && (
          <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Новая услуга</h2>
              <button onClick={() => { resetForm(); setShowForm(false); }}>
                <X className="w-5 h-5 text-[#8E8E93]" />
              </button>
            </div>

            <div>
              <Label className="text-xs text-[#8E8E93]">Фото услуги (до 10 шт.)</Label>
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
                  <><ImagePlus className="w-5 h-5" /><span className="text-xs">Добавить фото из галереи</span></>
                )}
              </button>
              <p className="text-[10px] text-[#8E8E93] mt-1">
                Первое фото станет обложкой в каталоге. Сжимаются автоматически до 1200px
              </p>
              {uploadError && <p className="text-[10px] text-[#C62828] mt-1">{uploadError}</p>}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {imageUrls.map((u, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#F0F0F0]">
                      <img src={u} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#FFB800] text-white text-[8px] px-1 py-0.5 rounded">
                          обложка
                        </span>
                      )}
                      <button onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-[#8E8E93]">Название *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 100))} placeholder="Например: Дизайн логотипа" />
            </div>

            <div>
              <Label className="text-xs text-[#8E8E93]">Категория *</Label>
              <Select value={categoryId?.toString()} onValueChange={(v) => setCategoryId(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-[#8E8E93]">Описание</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 2000))} rows={3} placeholder="Подробнее об услуге..." />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-[#8E8E93]">Цена *</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" />
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Валюта</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="UZS">UZS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-[#8E8E93]">Срок</Label>
                <Input type="number" value={deadlineValue} onChange={(e) => setDeadlineValue(e.target.value)} placeholder="3" />
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Единица</Label>
                <Select value={deadlineUnit} onValueChange={setDeadlineUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Часов</SelectItem>
                    <SelectItem value="days">Дней</SelectItem>
                    <SelectItem value="weeks">Недель</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-[#8E8E93]">Что входит</Label>
              <div className="flex gap-2">
                <Input value={includedInput} onChange={(e) => setIncludedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (includedInput.trim()) { setWhatIncluded([...whatIncluded, includedInput.trim()]); setIncludedInput(""); } } }}
                  placeholder="Добавьте пункт и нажмите Enter" />
              </div>
              {whatIncluded.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {whatIncluded.map((it, i) => (
                    <li key={i} className="text-xs flex items-center justify-between bg-[#F8F9FA] rounded-lg px-2 py-1">
                      <span>✓ {it}</span>
                      <button onClick={() => setWhatIncluded(whatIncluded.filter((_, j) => j !== i))}>
                        <X className="w-3 h-3 text-[#8E8E93]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <Label className="text-xs text-[#8E8E93]">Теги</Label>
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(""); } } }}
                placeholder="Добавьте тег и нажмите Enter" />
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

            {error && <p className="text-xs text-[#C62828]">{error}</p>}

            <Button onClick={handleCreate} disabled={createMutation.isPending}
              className="w-full bg-[#FFB800] hover:bg-[#FF8C00] text-white">
              {createMutation.isPending ? "Создание..." : "Создать"}
            </Button>
            <p className="text-[10px] text-[#8E8E93] text-center">
              Услуга появится в каталоге после модерации
            </p>
          </div>
        )}

        {!services?.length && !showForm ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-sm text-[#8E8E93]">У вас пока нет услуг</p>
            <Button onClick={() => setShowForm(true)} className="mt-3 bg-[#FFB800] hover:bg-[#FF8C00] text-white">
              <Plus className="w-4 h-4 mr-1" /> Добавить первую услугу
            </Button>
          </div>
        ) : (
          services?.map((s: any) => {
            const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
            return (
              <div key={s.id} className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="flex items-start gap-3 mb-2">
                  {s.coverImage ? (
                    <img src={s.coverImage} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#FFF8E1] flex items-center justify-center shrink-0 text-2xl">
                      {s.categoryEmoji || "📦"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{s.title}</p>
                    <p className="text-xs text-[#8E8E93]">{s.categoryEmoji} {s.categoryName}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>{st.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-[#FFB800]">{Number(s.price).toLocaleString()} {s.currency}</span>
                    <span className="text-[#8E8E93] flex items-center gap-0.5"><Eye className="w-3 h-3" /> {s.views}</span>
                    {s.deadlineValue && (
                      <span className="text-[#8E8E93] flex items-center gap-0.5"><Clock className="w-3 h-3" /> {s.deadlineValue}{s.deadlineUnit === "hours" ? "ч" : s.deadlineUnit === "weeks" ? "нед" : "дн"}</span>
                    )}
                  </div>
                  <button onClick={() => handleRemove(s.id)} className="text-[#C62828] p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {s.rejectionReason && (
                  <p className="text-[10px] text-[#C62828] mt-1">Причина отклонения: {s.rejectionReason}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
