import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Users, Flame, BarChart3, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
}

interface UserProfile {
  salonId?: number;
  salonRole?: string;
}

const salonTiers = [
  {
    id: "5-seats",
    name: "Small Team",
    seats: 5,
    pricePerSeat: 8,
    totalPrice: 40,
    description: "Perfect for boutique salons with a small team",
    popular: false,
  },
  {
    id: "10-plus-seats",
    name: "Growing Salon",
    seats: 10,
    pricePerSeat: 5,
    totalPrice: 50,
    description: "Best value for larger teams",
    popular: true,
  },
];

const salonBenefits = [
  {
    icon: Users,
    title: "Manage Your Team",
    description: "Invite stylists to join your salon and manage their access from one dashboard.",
  },
  {
    icon: Flame,
    title: "Track Posting Streaks",
    description: "Monitor your team's posting consistency and celebrate their achievements.",
  },
  {
    icon: BarChart3,
    title: "Team Insights",
    description: "See which stylists are most active and encourage friendly competition.",
  },
  {
    icon: Mail,
    title: "Easy Invitations",
    description: "Send email invites to your stylists - they get instant access when they join.",
  },
];

export default function SalonPricingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const handleSelectTier = (tierId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start your salon plan.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTier(tierId);
    setLocation(`/salon-setup?tier=${tierId}`);
  };

  if (profile?.salonRole === "owner") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/account")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Salon Plan</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="font-heading text-lg font-medium text-foreground mb-2">
              You already have a salon
            </h3>
            <p className="text-muted-foreground mb-6">
              Manage your salon and team from the dashboard.
            </p>
            <Button onClick={() => setLocation("/salon-dashboard")} data-testid="button-go-to-dashboard">
              Go to Salon Dashboard
            </Button>
          </div>
        </main>
        <MobileNav isLoggedIn={!!user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/account")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Salon Owner Plan</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-page-enter">
        <div className="text-center animate-fade-in-up stagger-1">
          <Building2 className="w-12 h-12 mx-auto text-primary mb-3" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Empower Your Entire Team
          </h2>
          <p className="text-muted-foreground">
            Get your whole salon posting consistently with shared content ideas and team management.
          </p>
        </div>

        <div className="space-y-4 animate-fade-in-up stagger-2">
          {salonBenefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">{benefit.title}</h3>
                <p className="text-muted-foreground text-xs">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 animate-fade-in-up stagger-3">
          <h3 className="font-heading font-medium text-foreground">Choose Your Plan</h3>
          {salonTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative cursor-pointer transition-all ${
                tier.popular ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelectTier(tier.id)}
              data-testid={`card-tier-${tier.id}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-4 text-xs">Most Popular</Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-heading text-lg">{tier.name}</CardTitle>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">${tier.totalPrice}</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Up to {tier.seats} stylists</span>
                  <span className="text-primary font-medium">(${tier.pricePerSeat}/seat)</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {[
                    "All stylists get full access",
                    "Team posting streak tracking",
                    "Easy invitation system",
                    "Owner management dashboard",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Need more than 10 seats? Contact us for enterprise pricing.
        </p>
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
