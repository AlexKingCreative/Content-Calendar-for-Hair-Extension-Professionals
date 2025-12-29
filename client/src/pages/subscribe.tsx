import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Sparkles, 
  Check, 
  Heart, 
  Gift, 
  Star, 
  Crown,
  Clock,
  Flame,
  Percent
} from "lucide-react";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email?: string;
}

interface UserProfile {
  currentStreak?: number;
  longestStreak?: number;
  firstStreakRewardClaimed?: boolean;
  firstStreakRewardCoupon?: string | null;
}

const features = [
  { icon: Calendar, text: "Monthly pre-planned content ideas" },
  { icon: Sparkles, text: "AI-powered caption generation" },
  { icon: Heart, text: "Personalized to your voice and brand" },
  { icon: Gift, text: "Never miss special industry days" },
  { icon: Star, text: "Custom hashtags (max 5)" },
  { icon: Crown, text: "Posting streaks with badges" },
];

const pricingPlans = [
  {
    id: 'month',
    name: '30 Days',
    commitment: 'Commit to posting for 30 days',
    price: 10,
    billingText: '$10/month',
    interval: 'month' as const,
    hasTrial: true,
    popular: false,
  },
  {
    id: 'quarter',
    name: '90 Days',
    commitment: 'Commit to posting for 90 days',
    price: 25,
    billingText: '$25 every 3 months',
    interval: 'quarter' as const,
    hasTrial: false,
    popular: true,
  },
  {
    id: 'year',
    name: '1 Year',
    commitment: 'Commit to posting for a full year',
    price: 50,
    billingText: '$50/year',
    interval: 'year' as const,
    hasTrial: false,
    popular: false,
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

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/users/me/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: accessStatus } = useQuery<{
    hasAccess?: boolean;
    accessibleMonths?: number[];
    freeAccessEndsAt?: string;
    subscriptionStatus?: string;
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

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/billing/claim-streak-reward");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to claim reward");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/profile"] });
      toast({
        title: "Reward Claimed!",
        description: "Congratulations on completing your 7-day streak!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not claim reward",
        description: error.message,
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

  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const bestStreak = Math.max(currentStreak, longestStreak);
  const streakProgress = Math.min(bestStreak / 7 * 100, 100);
  const hasEarnedReward = bestStreak >= 7;
  const hasClaimedReward = profile?.firstStreakRewardClaimed ?? false;

  const isLoading = checkoutMutation.isPending || claimRewardMutation.isPending;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          {daysRemaining > 0 && (
            <Badge variant="outline" className="text-primary border-primary">
              <Clock className="w-3 h-3 mr-1" />
              {daysRemaining} days left in free trial
            </Badge>
          )}
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            Choose Your Commitment
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The longer you commit, the more you save. Pick the plan that matches your posting goals.
          </p>
        </div>

        {user && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">7-Day Streak Challenge</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasEarnedReward 
                      ? hasClaimedReward 
                        ? "Amazing! You completed the 7-day streak challenge!"
                        : "You did it! Claim your streak milestone reward."
                      : `Post for 7 days straight to complete the challenge`
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {currentStreak} day{currentStreak !== 1 ? 's' : ''} current streak
                  </span>
                  <span>{bestStreak}/7 days</span>
                </div>
                <Progress value={streakProgress} className="h-2" />
              </div>

              {hasEarnedReward && !hasClaimedReward && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => claimRewardMutation.mutate()}
                  disabled={claimRewardMutation.isPending}
                  data-testid="button-claim-reward"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {claimRewardMutation.isPending ? "Claiming..." : "Claim Your Streak Reward"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-visible cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover-elevate'
              } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`pricing-card-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg px-4">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className={plan.popular ? 'pt-8' : ''}>
                <CardTitle className="text-center">
                  <span className="text-lg text-muted-foreground block mb-1">{plan.name}</span>
                  <span className="text-4xl font-bold">${plan.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-sm font-medium text-primary">
                  {plan.commitment}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  {plan.billingText}
                  {plan.hasTrial && ' after 7-day free trial'}
                </p>
                
                <ul className="space-y-2 pt-2">
                  {features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? '' : 'mt-2'}`}
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(plan);
                  }}
                  disabled={isLoading || userLoading}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {checkoutMutation.isPending ? "Redirecting..." : 
                    plan.hasTrial ? "Start 7-Day Free Trial" : `Get Started - $${plan.price}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg text-center">Everything Included in All Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-md bg-background"
                >
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Cancel anytime from your account settings. No questions asked.
          </p>
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            Back to Calendar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
