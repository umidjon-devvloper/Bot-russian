import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Save, CheckCircle2 } from "lucide-react";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: me, refetch } = trpc.user.me.useQuery(
    { telegramId: user?.telegramId ?? 0 },
    { enabled: !!user?.telegramId }
  );
  const { data: categories } = trpc.category.list.useQuery();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) return;
    setFirstName(me.firstName || "");
    setLastName(me.lastName || "");
    setBio(me.bio || "");
    setCity(me.city || "");
    setCountry(me.country || "");
    const sp = me.specialistProfile as any;
    setSpecialization(sp?.specialization || "");
    setCategoryId(sp?.primary_category_id ? Number(sp.primary_category_id) : undefined);
  }, [me]);

  const updateUser = trpc.user.updateProfile.useMutation();
  const updateSpec = trpc.specialist.updateProfile.useMutation();

  const isSpecialist = me?.selectedRole === "specialist" || me?.selectedRole === "both";

  const handleSave = async () => {
    if (!user) return;
    await updateUser.mutateAsync({
      telegramId: user.telegramId,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      bio: bio.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
    });
    if (isSpecialist) {
      await updateSpec.mutateAsync({
        telegramId: user.telegramId,
        specialization: specialization.trim() || undefined,
        categoryId,
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
      });
    }
    await refetch();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#E8EAED] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-semibold text-[#1A1A1A]">Редактировать профиль</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 pb-3 border-b border-[#F0F0F0]">
            {me?.photoUrl ? (
              <img src={me.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#FFB800] flex items-center justify-center text-white font-bold">
                {(firstName[0] || "?").toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-[#8E8E93]">Из Telegram</p>
              <p className="text-xs text-[#8E8E93]">@{me?.username || "—"}</p>
            </div>
          </div>

          <div>
            <Label className="text-xs text-[#8E8E93]">Имя</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Имя" />
          </div>
          <div>
            <Label className="text-xs text-[#8E8E93]">Фамилия</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Фамилия" />
          </div>
          <div>
            <Label className="text-xs text-[#8E8E93]">Город</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" />
          </div>
          <div>
            <Label className="text-xs text-[#8E8E93]">Страна</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Россия" />
          </div>
          <div>
            <Label className="text-xs text-[#8E8E93]">О себе (до 500 символов)</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Кратко о себе..."
              rows={4}
            />
            <p className="text-[10px] text-[#8E8E93] mt-1 text-right">{bio.length}/500</p>
          </div>

          {isSpecialist && (
            <>
              <div>
                <Label className="text-xs text-[#8E8E93]">Основная категория</Label>
                <Select
                  value={categoryId?.toString() ?? ""}
                  onValueChange={(v) => setCategoryId(v ? Number(v) : undefined)}
                >
                  <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.emoji} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-[#8E8E93] mt-1">
                  По этой категории вас будут находить в каталоге
                </p>
              </div>
              <div>
                <Label className="text-xs text-[#8E8E93]">Специализация</Label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Например: Веб-дизайнер, Frontend-разработчик"
                />
              </div>
            </>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={updateUser.isPending || updateSpec.isPending}
          className="w-full h-12 bg-[#FFB800] hover:bg-[#FF8C00] text-white rounded-2xl"
        >
          {saved ? (
            <><CheckCircle2 className="w-5 h-5 mr-2" /> Сохранено</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Сохранить</>
          )}
        </Button>
      </div>
    </div>
  );
}
