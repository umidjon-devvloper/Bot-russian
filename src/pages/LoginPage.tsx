/**
 * LoginPage — точка входа.
 * В Telegram Mini App авторизация происходит автоматически через useAuth.
 * Эта страница показывается только если что-то пошло не так.
 */
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { Shield, Loader2 } from "lucide-react";

export function LoginPage() {
  const { user, isLoading, refetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (!user.selectedRole) {
        navigate("/role-select");
      } else if (!user.onboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#FFB800] flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">OmniFind</h1>
        <p className="text-sm text-[#8E8E93] mb-10">Биржа проверенных специалистов</p>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFB800]" />
            <p className="text-sm text-[#8E8E93]">Авторизация через Telegram...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#8E8E93] mb-4">
              Откройте приложение через Telegram бота или Mini App
            </p>
            <button
              onClick={() => refetch()}
              className="w-full h-12 bg-[#FFB800] text-white font-semibold rounded-xl active:scale-[0.97] transition-all"
            >
              Повторить вход
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
