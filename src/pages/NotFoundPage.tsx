import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#FFF8E1] flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🔍</span>
      </div>
      <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Страница не найдена</h1>
      <p className="text-sm text-[#8E8E93] mb-6 text-center">
        Запрашиваемая страница не существует или была удалена.
      </p>
      <Button
        onClick={() => navigate("/")}
        className="h-12 bg-[#FFB800] hover:bg-[#F5A800] text-white font-medium rounded-xl px-6"
      >
        <Home className="w-5 h-5 mr-2" />
        На главную
      </Button>
    </div>
  );
}
