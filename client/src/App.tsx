import { useEffect } from "react";
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
import SalonPricingPage from "@/pages/salon-pricing";
import SalonSetupPage from "@/pages/salon-setup";
import SalonDashboardPage from "@/pages/salon-dashboard";
import JoinSalonPage from "@/pages/join-salon";
import PricingPage from "@/pages/pricing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import { Skeleton } from "@/components/ui/skeleton";

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

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/");
    }
  }, [userLoading, user, setLocation]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
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

  const isLoading = userLoading || (user && profileLoading);
  const isUnauthorized = !isLoading && (!user || !profile?.isAdmin);

  useEffect(() => {
    if (isUnauthorized) {
      setLocation("/");
    }
  }, [isUnauthorized, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (isUnauthorized) {
    return null;
  }

  return <>{children}</>;
}

function HomePage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const isLoading = userLoading || (user && profileLoading);

  useEffect(() => {
    if (!isLoading && user) {
      if (profile?.isAdmin) {
        setLocation("/admin");
      } else if (profile?.onboardingComplete) {
        setLocation("/today");
      } else {
        setLocation("/onboarding");
      }
    }
  }, [isLoading, user, profile, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/onboarding" component={OnboardingPage} />
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
      <Route path="/pricing" component={PricingPage} />
      <Route path="/salon-pricing" component={SalonPricingPage} />
      <Route path="/salon-setup">
        <ProtectedRoute>
          <SalonSetupPage />
        </ProtectedRoute>
      </Route>
      <Route path="/salon-dashboard">
        <ProtectedRoute>
          <SalonDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/join-salon/:token" component={JoinSalonPage} />
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
