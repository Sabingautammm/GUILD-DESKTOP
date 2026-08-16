import { lazy, Suspense, Component } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/layout/Navbar";
import ProtectedRoutes from "./components/layout/ProtectedRoutes";
import { ToastProvider } from "./components/toast/ToastProvider";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import { Skeleton, SkeletonCard, FullPageSkeleton } from "./components/ui/Skeleton";

// Heavy/route-level chunks load on demand to keep first paint fast.
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const MemberDetailsPage = lazy(() => import("./pages/MemberDetailsPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const EnterUidRegionPage = lazy(() => import("./pages/EnterUidRegionPage"));
const GuildPage = lazy(() => import("./pages/GuildPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const ReelPage = lazy(() => import("./pages/ReelPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ToastDemoPage = lazy(() => import("./pages/ToastDemo"));

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-guild-950">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-guild-950/90 backdrop-blur-xl border-b border-guild-700">
        <div className="flex h-full items-center justify-between px-5">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
      <main className="flex-1 pt-16 pb-20 lg:pt-16 lg:pb-0 p-4 sm:p-6 lg:p-8">
        <FullPageSkeleton />
      </main>
    </div>
  );
}

// Last line of defense: a crash in any page shows a recoverable screen
// instead of a blank white page. Reload restores the app.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[App] Route crashed:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.hash = "";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
          <p className="text-3xl font-bold text-cream font-display">Something went wrong</p>
          <p className="text-sm text-guild-300">An unexpected error occurred on this page.</p>
          <button
            onClick={this.handleReset}
            className="mt-2 rounded-full gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 hover:brightness-110"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, isLoading, user, membership } = useAuth();
  // Redirect to Enter UID/Region page if user needs to complete initial profile setup
  const needsUidRegion = isAuthenticated && !user?.onboardingCompleted && !membership;

  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={needsUidRegion ? <Navigate to="/enter-uid-region" replace /> : <HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/reel" element={<ReelPage />} />
        <Route path="/guild" element={<MembersPage />} />
        <Route path="/guild/:guildUid" element={<GuildPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/toast-demo" element={<ToastDemoPage />} />

        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route
            path="/enter-uid-region"
            element={needsUidRegion ? <EnterUidRegionPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/onboarding"
            element={needsUidRegion ? <OnboardingPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={needsUidRegion ? <Navigate to="/enter-uid-region" replace /> : <ProfilePage />}
          />
          <Route
            path="/notifications"
            element={needsUidRegion ? <Navigate to="/enter-uid-region" replace /> : <NotificationsPage />}
          />
          <Route
            path="/members/:id"
            element={needsUidRegion ? <Navigate to="/enter-uid-region" replace /> : <MemberDetailsPage />}
          />
          <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated && isAdmin} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-center">
      <p className="text-3xl font-bold font-display gold-gradient-text">404</p>
      <p className="text-sm text-guild-300">Page not found. Check the URL or head back home.</p>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-guild-950">
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