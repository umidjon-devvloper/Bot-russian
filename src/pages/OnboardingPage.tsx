import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Shield, Users, MessageCircle, ArrowRight, ChevronRight } from "lucide-react";

const specialistSlides = [
  {
    icon: <Shield className="w-12 h-12 text-[#FFB800]" />,
    title: "Добро пожаловать в OmniFind Гильдию",
    text: "Здесь нет спама. Только проверенные заказчики и конкретные тендеры.",
  },
  {
    icon: <Users className="w-12 h-12 text-[#FFB800]" />,
    title: "Как получить заказ",
    text: "Заполните профиль и добавьте услугу. Ваша услуга появится в каталоге. Чтобы откликаться на тендеры, перейдите в раздел Тендеры.",
  },
  {
    icon: <MessageCircle className="w-12 h-12 text-[#FFB800]" />,
    title: "Безопасная сделка включена всегда",
    text: "Вы получаете 100% денег после завершения работы. Гарантия сделки — наш стандарт.",
  },
];

const customerSlides = [
  {
    icon: <Shield className="w-12 h-12 text-[#FFB800]" />,
    title: "Добро пожаловать в OmniFind Гильдию",
    text: "Здесь собраны проверенные мастера. Безопасная сделка включена по умолчанию.",
  },
  {
    icon: <Users className="w-12 h-12 text-[#FFB800]" />,
    title: "Как найти мастера",
    text: "Откройте Каталог, выберите категорию, установите фильтры, нажмите «Написать».",
  },
  {
    icon: <MessageCircle className="w-12 h-12 text-[#FFB800]" />,
    title: "Прямой контакт без комиссий",
    text: "Обсуждаете детали, фиксируете сделку через кнопку «Начать сделку». Никаких комиссий.",
  },
];

export function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const isSpecialist = user?.selectedRole === "specialist";
  const slides = isSpecialist ? specialistSlides : customerSlides;

  const next = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      completeOnboarding();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="animate-fade-in text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#FFF8E1] flex items-center justify-center mx-auto mb-6">
            {slides[slide].icon}
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-3 leading-tight">
            {slides[slide].title}
          </h2>
          <p className="text-[15px] text-[#8E8E93] leading-relaxed max-w-xs mx-auto">
            {slides[slide].text}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? "w-6 bg-[#FFB800]" : "w-1.5 bg-[#E8EAED]"
              }`}
            />
          ))}
        </div>
        <Button
          onClick={next}
          className="w-full h-14 bg-[#FFB800] hover:bg-[#F5A800] text-white font-medium rounded-xl text-base transition-all active:scale-[0.97]"
        >
          {slide < slides.length - 1 ? (
            <>
              Далее <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Начать <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
