import { Routes, Route, useNavigate, useLocation } from "react-router";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

import { OnboardingPage } from "./pages/OnboardingPage";
import { RoleSelectPage } from "./pages/RoleSelectPage";
import { CustomerHomePage } from "./pages/CustomerHomePage";
import { SpecialistHomePage } from "./pages/SpecialistHomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import { SpecialistProfilePage } from "./pages/SpecialistProfilePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ContactsPage } from "./pages/ContactsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { VacancyPage } from "./pages/VacancyPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { ServicesManagePage } from "./pages/ServicesManagePage";
import { PortfolioManagePage } from "./pages/PortfolioManagePage";
import { TendersPage } from "./pages/TendersPage";
import { TenderNewPage } from "./pages/TenderNewPage";
import { TenderDetailPage } from "./pages/TenderDetailPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReviewNewPage } from "./pages/ReviewNewPage";

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user && location.pathname !== "/login") {
      navigate("/login");
      return;
    }
    if (user && user.isBlocked) {
      navigate("/login");
      return;
    }
    if (user && !user.onboardingComplete && location.pathname !== "/onboarding" && location.pathname !== "/role-select") {
      if (!user.selectedRole) {
        navigate("/role-select");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFB800] flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <p className="text-sm text-[#8E8E93]">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/role-select" element={<RoleSelectPage />} />
      <Route path="/" element={<CustomerHomePage />} />
      <Route path="/specialist-home" element={<SpecialistHomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/service/:id" element={<ServiceDetailPage />} />
      <Route path="/specialist/:id" element={<SpecialistProfilePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/vacancy" element={<VacancyPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />

      {/* Profil va boshqaruv */}
      <Route path="/profile/edit" element={<ProfileEditPage />} />
      <Route path="/services/manage" element={<ServicesManagePage />} />
      <Route path="/portfolio" element={<PortfolioManagePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Tenderlar */}
      <Route path="/tenders" element={<TendersPage />} />
      <Route path="/tender/new" element={<TenderNewPage />} />
      <Route path="/tender/:id" element={<TenderDetailPage />} />

      {/* Sharh */}
      <Route path="/review/new" element={<ReviewNewPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8F9FA]">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
