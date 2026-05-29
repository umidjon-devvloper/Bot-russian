import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, Send, CheckCircle, Briefcase, Users,
} from "lucide-react";

export function VacancyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<"form" | "channels" | "done">("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [contact, setContact] = useState(user?.username ? `@${user.username}` : "");
  const [selectedChannels, setSelectedChannels] = useState<number[]>([]);
  const [error, setError] = useState("");

  const { data: channels, isLoading } = trpc.vacancy.channels.useQuery();
  const createMutation = trpc.vacancy.create.useMutation();

  const toggleChannel = (id: number) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || !description.trim()) {
      setError("Заполните заголовок и описание");
      return;
    }
    if (selectedChannels.length === 0) {
      setError("Выберите хотя бы один канал");
      return;
    }
    setError("");
    try {
      await createMutation.mutateAsync({
        telegramId: user.telegramId,
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim() || undefined,
        contactInfo: contact.trim() || undefined,
        channelIds: selectedChannels,
      });
      setStep("done");
    } catch (e: any) {
      setError(e.message || "Ошибка публикации");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-[#E8EAED]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Разместить вакансию</h1>
        </div>
      </header>

      <div className="p-4">
        {step === "done" ? (
          (() => {
            const chosen = (channels || []).filter((c: any) => selectedChannels.includes(c.id));
            const totalAudience = chosen.reduce((sum: number, c: any) => sum + (c.membersCount || 0), 0);
            return (
              <div className="flex flex-col items-center justify-center pt-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-[#4CAF50]" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Вакансия опубликована!</h2>
                <p className="text-sm text-[#8E8E93] mb-4 max-w-xs">
                  Ваша вакансия разослана в {chosen.length} канал{chosen.length === 1 ? "" : chosen.length < 5 ? "а" : "ов"}.
                  Специалисты свяжутся с вами напрямую.
                </p>
                {totalAudience > 0 && (
                  <div className="bg-[#FFF8E1] rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FFB800]" />
                    <span className="text-sm font-semibold text-[#1A1A1A]">
                      Общая аудитория: {totalAudience.toLocaleString()} подписчиков
                    </span>
                  </div>
                )}
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#FFB800] text-white hover:bg-[#E6A600] rounded-xl h-12 px-8"
                >
                  На главную
                </Button>
              </div>
            );
          })()
        ) : step === "form" ? (
          <div className="space-y-4">
            <div className="bg-[#FFF8E1] rounded-2xl p-4 flex gap-3">
              <Briefcase className="w-5 h-5 text-[#FFB800] mt-0.5 shrink-0" />
              <p className="text-sm text-[#5A4A00]">
                Ваша вакансия будет опубликована в Telegram-каналах биржи. Специалисты напишут вам напрямую.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#8E8E93] mb-1 block">
                  Заголовок вакансии *
                </label>
                <Input
                  placeholder="Нужен дизайнер для лендинга"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 bg-white border-[#E8EAED] rounded-xl"
                  maxLength={200}
                />
                <p className="text-[10px] text-[#8E8E93] text-right mt-1">{title.length}/200</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[#8E8E93] mb-1 block">
                  Описание задачи *
                </label>
                <textarea
                  placeholder="Опишите задачу подробно: что нужно сделать, требования, сроки..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] p-3 bg-white border border-[#E8EAED] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
                  maxLength={2000}
                />
                <p className="text-[10px] text-[#8E8E93] text-right mt-1">{description.length}/2000</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[#8E8E93] mb-1 block">
                  Бюджет
                </label>
                <Input
                  placeholder="Например: 5000 руб., от 10 000 руб., договорная"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-11 bg-white border-[#E8EAED] rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#8E8E93] mb-1 block">
                  Контакт для связи
                </label>
                <Input
                  placeholder="@username или ссылка"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-11 bg-white border-[#E8EAED] rounded-xl"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              onClick={() => {
                if (!title.trim() || !description.trim()) {
                  setError("Заполните заголовок и описание");
                  return;
                }
                setError("");
                setStep("channels");
              }}
              className="w-full bg-[#FFB800] text-white hover:bg-[#E6A600] rounded-xl h-12 font-semibold"
            >
              Выбрать каналы →
            </Button>
          </div>
        ) : (
          // Step: channels
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-1">Выберите каналы</h2>
              <p className="text-xs text-[#8E8E93]">Ваша вакансия будет опубликована в выбранных каналах</p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : channels?.length === 0 ? (
              <div className="text-center py-8 text-[#8E8E93]">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Нет доступных каналов</p>
                <p className="text-xs mt-1">Администратор ещё не добавил каналы</p>
              </div>
            ) : (
              <div className="space-y-2">
                {channels?.map((ch) => {
                  const selected = selectedChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 text-left transition-all border-2 ${
                        selected
                          ? "bg-[#FFF8E1] border-[#FFB800]"
                          : "bg-white border-transparent"
                      }`}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-[#FFB800]" : "bg-[#F8F9FA]"}`}>
                        <Send className={`w-4 h-4 ${selected ? "text-white" : "text-[#8E8E93]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A]">{ch.name}</p>
                        {ch.description && (
                          <p className="text-xs text-[#8E8E93] truncate">{ch.description}</p>
                        )}
                        {ch.membersCount > 0 && (
                          <p className="text-[10px] text-[#8E8E93]">{ch.membersCount.toLocaleString()} подписчиков</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-[#FFB800] bg-[#FFB800]" : "border-[#E8EAED]"}`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("form")}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-[#E8EAED]"
              >
                Назад
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedChannels.length === 0 || createMutation.isPending}
                className="flex-[2] bg-[#FFB800] text-white hover:bg-[#E6A600] rounded-xl h-12 font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? "Публикую..." : `Опубликовать в ${selectedChannels.length} канал${selectedChannels.length === 1 ? "" : selectedChannels.length < 5 ? "а" : "ов"}`}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
