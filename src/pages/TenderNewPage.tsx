import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Send, CheckCircle2 } from "lucide-react";

export function TenderNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = trpc.category.list.useQuery();
  const createMutation = trpc.tender.create.useMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || title.length < 5) {
      setError("Название должно содержать минимум 5 символов");
      return;
    }
    setError("");
    try {
      await createMutation.mutateAsync({
        telegramId: user.telegramId,
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        budget: budget ? Number(budget) : undefined,
        deadline: deadline.trim() || undefined,
        priority,
      });
      setDone(true);
      setTimeout(() => navigate("/tenders"), 1500);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
        </div>
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Тендер опубликован</h2>
        <p className="text-sm text-[#8E8E93]">Специалисты скоро откликнутся</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-semibold text-[#1A1A1A]">Новый тендер</h1>
      </header>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div>
            <Label className="text-xs text-[#8E8E93]">Название *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 200))} placeholder="Что нужно сделать?" />
            <p className="text-[10px] text-[#8E8E93] mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <Label className="text-xs text-[#8E8E93]">Описание</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Подробнее о проекте..." />
          </div>

          <div>
            <Label className="text-xs text-[#8E8E93]">Категория</Label>
            <Select value={categoryId?.toString()} onValueChange={(v) => setCategoryId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.emoji} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-[#8E8E93]">Бюджет (₽)</Label>
              <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000" />
            </div>
            <div>
              <Label className="text-xs text-[#8E8E93]">Срок</Label>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="2 недели" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-[#8E8E93]">Приоритет</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { v: "normal", label: "Обычный", color: "border-[#E8EAED] text-[#8E8E93]" },
                { v: "high", label: "Высокий", color: "border-[#FF8C00] text-[#FF8C00]" },
                { v: "urgent", label: "Срочно ⚡", color: "border-[#C62828] text-[#C62828]" },
              ].map((p) => (
                <button
                  key={p.v}
                  onClick={() => setPriority(p.v as any)}
                  className={`h-10 rounded-xl border text-xs font-medium ${priority === p.v ? p.color + " bg-white" : "border-[#E8EAED] text-[#8E8E93] bg-white"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-[#C62828]">{error}</p>}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="w-full h-12 bg-[#FFB800] hover:bg-[#FF8C00] text-white rounded-2xl"
        >
          <Send className="w-5 h-5 mr-2" />
          {createMutation.isPending ? "Публикация..." : "Опубликовать"}
        </Button>
      </div>
    </div>
  );
}
