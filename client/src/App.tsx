import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import LandingPage from "@/pages/landing";

const NotFound = lazy(() => import("@/pages/not-found"));
const CalendarPage = lazy(() => import("@/pages/calendar"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const AdminPage = lazy(() => import("@/pages/admin"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const AccountPage = lazy(() => import("@/pages/account"));
const HelpPage = lazy(() => import("@/pages/help"));
const TodayPage = lazy(() => import("@/pages/today"));
const StreaksPage = lazy(() => import("@/pages/streaks"));
const TrendsPage = lazy(() => import("@/pages/trends"));
const PostPage = lazy(() => import("@/pages/post"));
const TermsPage = lazy(() => import("@/pages/terms"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const ContactPage = lazy(() => import("@/pages/contact"));
const SubscribePage = lazy(() => import("@/pages/subscribe"));
const SignupPage = lazy(() => import("@/pages/signup"));
const WelcomePage = lazy(() => import("@/pages/welcome"));
const SalonPricingPage = lazy(() => import("@/pages/salon-pricing"));
const SalonSetupPage = lazy(() => import("@/pages/salon-setup"));
const SalonDashboardPage = lazy(() => import("@/pages/salon-dashboard"));
const JoinSalonPage = lazy(() => import("@/pages/join-salon"));
const PricingPage = lazy(() => import("@/pages/pricing"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const InstagramPage = lazy(() => import("@/pages/instagram"));
const AboutPage = lazy(() => import("@/pages/about"));
const SubscriptionSuccessPage = lazy(() => import("@/pages/subscription-success"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Skeleton className="h-12 w-48" />
    </div>
  );
}

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
    return <PageLoader />;
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
    return <PageLoader />;
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
    return <PageLoader />;
  }

  if (user) {
    return null;
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
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
        <Route path="/help" component={HelpPage} />
        <Route path="/today" component={TodayPage} />
        <Route path="/trends" component={TrendsPage} />
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
        <Route path="/about" component={AboutPage} />
        <Route path="/subscription/success" component={SubscriptionSuccessPage} />
        <Route path="/subscription/cancel" component={PricingPage} />
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
        <Route path="/instagram">
          <ProtectedRoute>
            <InstagramPage />
          </ProtectedRoute>
        </Route>
        <Route path="/join-salon/:token" component={JoinSalonPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
