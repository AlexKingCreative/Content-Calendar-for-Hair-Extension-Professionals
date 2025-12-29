import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Crown, Users, Sparkles, Calendar, Flame, BarChart3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/MobileNav";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
}

interface AccessStatus {
  hasAccess: boolean;
  subscriptionStatus?: string;
}

const individualFeatures = [
  "365 days of pre-planned content",
  "AI-powered captions",
  "Multiple service categories",
  "Posting streak tracker",
  "Personalized voice settings",
];

const salonFeatures = [
  "Everything in Individual plan",
  "Manage your team from one dashboard",
  "Invite stylists via email",
  "Monitor team posting streaks",
  "Team performance insights",
  "Bulk seat discounts",
];

export default function PricingPage() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: accessStatus } = useQuery<AccessStatus | null>({
    queryKey: ["/api/billing/access-status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const isSubscribed = accessStatus?.subscriptionStatus === "active";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Pricing</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground">
            Start with a 7-day free trial. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative" data-testid="card-individual-plan">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-primary" />
                <CardTitle className="font-heading">Individual</CardTitle>
              </div>
              <CardDescription>Perfect for solo stylists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-foreground">$60</span>
                  <span className="text-muted-foreground">/year</span>
                  <Badge variant="secondary" className="text-xs">Best Value</Badge>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {individualFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {isSubscribed ? (
                <Button variant="outline" className="w-full" disabled data-testid="button-subscribed">
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => setLocation("/subscribe")}
                  data-testid="button-subscribe-individual"
                >
                  Start Free Trial
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="relative border-primary" data-testid="card-salon-plan">
            <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
              Best for Teams
            </Badge>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="font-heading">Salon Owner</CardTitle>
              </div>
              <CardDescription>Manage your whole team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="text-3xl font-bold text-foreground">$5-8</span>
                <span className="text-muted-foreground">/seat/month</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                5 seats: $40/mo | 10+ seats: $50/mo
              </p>
              
              <ul className="space-y-3 mb-6">
                {salonFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => setLocation("/salon-pricing")}
                data-testid="button-view-salon-plans"
              >
                View Salon Plans
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h3 className="font-heading text-lg font-semibold text-center mb-6">
            Why Hair Pros Love Us
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground text-sm">365 Days Planned</h4>
                <p className="text-xs text-muted-foreground">Never wonder what to post again</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground text-sm">AI Captions</h4>
                <p className="text-xs text-muted-foreground">Personalized to your voice</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Flame className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground text-sm">Streak Tracking</h4>
                <p className="text-xs text-muted-foreground">Stay motivated and consistent</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground text-sm">All Categories</h4>
                <p className="text-xs text-muted-foreground">Extensions, wigs, toppers & more</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
