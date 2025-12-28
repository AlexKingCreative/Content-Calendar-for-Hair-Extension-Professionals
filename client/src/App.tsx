import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CalendarPage from "@/pages/calendar";
import OnboardingPage from "@/pages/onboarding";
import AdminPage from "@/pages/admin";
import LandingPage from "@/pages/landing";
import SettingsPage from "@/pages/settings";
import AccountPage from "@/pages/account";
import TodayPage from "@/pages/today";
import StreaksPage from "@/pages/streaks";
import PostPage from "@/pages/post";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import ContactPage from "@/pages/contact";
import SubscribePage from "@/pages/subscribe";
import SignupPage from "@/pages/signup";
import WelcomePage from "@/pages/welcome";
import { Skeleton } from "@/components/ui/skeleton";
import { Capacitor } from "@capacitor/core";

interface UserProfile {
  id: number;
  userId: string;
  city: string | null;
  certifiedBrands: string[];
  extensionMethods: string[];
  isAdmin: boolean;
  onboardingComplete: boolean;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile, isLoading: profileLoading } =
    useQuery<UserProfile | null>({
      queryKey: ["/api/profile"],
      queryFn: getQueryFn({ on401: "returnNull" }),
      enabled: !!user,
    });

  if (userLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user || !profile?.isAdmin) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}

function HomePage() {
  const isNative = Capacitor.isNativePlatform();
  return isNative ? <WelcomePage /> : <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <div
        style={{
          background: "#00ff00",
          padding: "10px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        🚀 CAPGO LIVE UPDATE TEST - v1.0.2 🚀
      </div>
      <Route path="/" component={HomePage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/onboarding">
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/account">
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      </Route>
      <Route path="/today" component={TodayPage} />
      <Route path="/streaks" component={StreaksPage} />
      <Route path="/post/:id" component={PostPage} />
      <Route path="/subscribe">
        <ProtectedRoute>
          <SubscribePage />
        </ProtectedRoute>
      </Route>
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
