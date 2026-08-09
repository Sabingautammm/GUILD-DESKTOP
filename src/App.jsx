import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/layout/Navbar";
import ProtectedRoutes from "./components/layout/ProtectedRoutes";
import { ToastProvider } from "./components/toast/ToastProvider";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";

// Heavy/route-level chunks load on demand to keep first paint fast.
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const MemberDetailsPage = lazy(() => import("./pages/MemberDetailsPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const GuildPage = lazy(() => import("./pages/GuildPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const ReelPage = lazy(() => import("./pages/ReelPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ToastDemoPage = lazy(() => import("./pages/ToastDemo"));

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-amber-500" />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const needsOnboarding = isAuthenticated && !user?.onboardingCompleted;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/reel" element={<ReelPage />} />
        <Route path="/guild" element={<MembersPage />} />
        <Route path="/guild/:guildUid" element={<GuildPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/toast-demo" element={<ToastDemoPage />} />

        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route
            path="/onboarding"
            element={needsOnboarding ? <OnboardingPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <ProfilePage />}
          />
          <Route
            path="/notifications"
            element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <NotificationsPage />}
          />
          <Route
            path="/members/:id"
            element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <MemberDetailsPage />}
          />
          <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated && isAdmin} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-center">
      <p className="text-3xl font-bold text-[#17120D]">404</p>
      <p className="text-sm text-[#6B5B45]">Page not found. Check the URL or head back home.</p>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-100">
            <Navbar />
            <main className="flex-1 pt-16 pb-20 lg:pt-16 lg:pb-0">
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}