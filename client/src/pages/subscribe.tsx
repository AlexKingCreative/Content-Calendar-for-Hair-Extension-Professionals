import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Star, 
  Clock,
  Flame,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email?: string;
}

const pricingPlans = [
  {
    id: 'month',
    name: '30 Days',
    price: 10,
    perMonth: 10,
    savings: null,
    interval: 'month' as const,
    hasTrial: true,
    popular: false,
    resultsText: 'Start building consistency',
  },
  {
    id: 'quarter',
    name: '90 Days',
    price: 25,
    perMonth: 8.33,
    savings: 17,
    interval: 'quarter' as const,
    hasTrial: false,
    popular: true,
    resultsText: 'See real growth in your following',
  },
  {
    id: 'year',
    name: '1 Year',
    price: 50,
    perMonth: 4.17,
    savings: 58,
    interval: 'year' as const,
    hasTrial: false,
    popular: false,
    resultsText: 'Transform your entire business',
  },
];

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('quarter');

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: accessStatus } = useQuery<{
    hasAccess?: boolean;
    freeAccessEndsAt?: string;
  } | null>({
    queryKey: ["/api/billing/access-status"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ trial, interval }: { trial: boolean; interval: 'month' | 'quarter' | 'year' }) => {
      const res = await apiRequest("POST", "/api/billing/checkout", { withTrial: trial, interval });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to start checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: typeof pricingPlans[0]) => {
    if (!user?.id) {
      toast({
        title: "Please log in first",
        description: "You need to be logged in to subscribe.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    checkoutMutation.mutate({ trial: plan.hasTrial, interval: plan.interval });
  };
  
  const daysRemaining = accessStatus?.freeAccessEndsAt 
    ? Math.max(0, Math.ceil((new Date(accessStatus.freeAccessEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const selected = pricingPlans.find(p => p.id === selectedPlan)!;
  const isLoading = checkoutMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold">Choose Your Plan</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-4 py-6">
        <div className="space-y-6">
          {daysRemaining > 0 && (
            <div className="text-center">
              <Badge variant="outline" className="text-primary border-primary">
                <Clock className="w-3 h-3 mr-1" />
                {daysRemaining} days left in free trial
              </Badge>
            </div>
          )}
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-heading font-bold">
              Commit to Your Growth
            </h2>
            <p className="text-muted-foreground text-sm">
              Longer commitment = bigger savings + better results
            </p>
          </div>

          <div className="space-y-3">
            {pricingPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === plan.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover-elevate'
                }`}
                data-testid={`pricing-option-${plan.id}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-xs px-2">
                    <Star className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                )}
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {selectedPlan === plan.id && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{plan.name}</span>
                        {plan.savings && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Save {plan.savings}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {plan.resultsText}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">${plan.price}</div>
                    <div className="text-xs text-muted-foreground">
                      ${plan.perMonth.toFixed(2)}/mo
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              What you get:
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Daily post ideas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">AI captions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Custom hashtags</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Streak rewards</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleSubscribe(selected)}
              disabled={isLoading || userLoading}
              data-testid="button-subscribe"
            >
              {checkoutMutation.isPending ? "Redirecting..." : 
                selected.hasTrial 
                  ? "Start 7-Day Free Trial" 
                  : `Get Started - $${selected.price}`
              }
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              {selected.hasTrial 
                ? "No charge today. Cancel anytime during your trial."
                : "Cancel anytime. No questions asked."
              }
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
