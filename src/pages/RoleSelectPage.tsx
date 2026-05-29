import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight } from "lucide-react";

export function RoleSelectPage() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    setRole(role);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#1A1A1A] text-center mb-2">Кто вы?</h1>
        <p className="text-sm text-[#8E8E93] text-center mb-8">Выберите вашу роль в Гильдии</p>

        <div className="space-y-4">
          <button
            onClick={() => selectRole("specialist")}
            className="w-full p-5 rounded-2xl bg-[#F8F9FA] border-2 border-transparent hover:border-[#FFB800] transition-all text-left group active:scale-[0.97]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-[#FFB800]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A] text-base mb-1 group-hover:text-[#FFB800] transition-colors">
                  Я СПЕЦИАЛИСТ
                </h3>
                <p className="text-sm text-[#8E8E93]">
                  Предоставляю профессиональные услуги и ищу заказчиков
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#E8EAED] group-hover:text-[#FFB800] transition-colors mt-1" />
            </div>
          </button>

          <button
            onClick={() => selectRole("customer")}
            className="w-full p-5 rounded-2xl bg-[#F8F9FA] border-2 border-transparent hover:border-[#FFB800] transition-all text-left group active:scale-[0.97]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-[#2196F3]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A] text-base mb-1 group-hover:text-[#2196F3] transition-colors">
                  Я ЗАКАЗЧИК
                </h3>
                <p className="text-sm text-[#8E8E93]">
                  Ищу проверенных специалистов для своих проектов
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#E8EAED] group-hover:text-[#2196F3] transition-colors mt-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
