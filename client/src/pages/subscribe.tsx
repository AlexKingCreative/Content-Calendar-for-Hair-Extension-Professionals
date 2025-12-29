import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/users/me/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const { data: allPrices } = useQuery<Array<{
    price_id: string;
    unit_amount: number;
    currency: string;
    interval: string;
  }>>({
    queryKey: ["/api/billing/subscription-prices"],
  });

  const { data: priceInfo, isLoading: priceLoading } = useQuery<{
    unit_amount?: number;
    price_id?: string;
  } | null>({
    queryKey: ["/api/billing/subscription-price"],
  });

  const monthlyPrice = allPrices?.find(p => p.interval === 'month');
  const yearlyPrice = allPrices?.find(p => p.interval === 'year');
  const hasYearlyOption = !!yearlyPrice;

  const { data: accessStatus } = useQuery<{
    hasAccess?: boolean;
    accessibleMonths?: number[];
    freeAccessEndsAt?: string;
    subscriptionStatus?: string;
  } | null>({
    queryKey: ["/api/billing/access-status"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ trial, interval }: { trial: boolean; interval: 'month' | 'year' }) => {
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

  const checkoutWithRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/billing/checkout-with-reward");
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

  const handleSubscribe = (trial: boolean) => {
    if (!user?.id) {
      toast({
        title: "Please log in first",
        description: "You need to be logged in to subscribe.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    checkoutMutation.mutate({ trial, interval: billingInterval });
  };

  const price = priceInfo?.unit_amount ? (priceInfo.unit_amount / 100).toFixed(0) : "10";
  const monthlyPriceDisplay = monthlyPrice ? (monthlyPrice.unit_amount / 100).toFixed(0) : "10";
  const yearlyPriceDisplay = yearlyPrice ? (yearlyPrice.unit_amount / 100).toFixed(0) : "60";
  const yearlySavings = monthlyPrice && yearlyPrice 
    ? Math.round((1 - yearlyPrice.unit_amount / (monthlyPrice.unit_amount * 12)) * 100) 
    : 50;
  
  const daysRemaining = accessStatus?.freeAccessEndsAt 
    ? Math.max(0, Math.ceil((new Date(accessStatus.freeAccessEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const bestStreak = Math.max(currentStreak, longestStreak);
  const streakProgress = Math.min(bestStreak / 7 * 100, 100);
  const hasEarnedReward = bestStreak >= 7;
  const hasClaimedReward = profile?.firstStreakRewardClaimed ?? false;
  const hasCoupon = !!profile?.firstStreakRewardCoupon;

  const isLoading = checkoutMutation.isPending || claimRewardMutation.isPending || checkoutWithRewardMutation.isPending;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-primary border-primary">
            <Clock className="w-3 h-3 mr-1" />
            {daysRemaining > 0 
              ? `${daysRemaining} days left in free trial`
              : "Free trial ended"
            }
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            Try Free for 7 Days
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get full access to monthly content ideas, AI-powered captions,
            and streak tracking to keep you consistent.
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


        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl font-heading">Pro Access</span>
                <Badge className="bg-primary/10 text-primary">
                  7 Days Free
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                {hasCoupon ? (
                  <>
                    <span className="text-3xl line-through text-muted-foreground">${monthlyPriceDisplay}</span>
                    <span className="text-5xl font-bold text-green-600">${(parseInt(monthlyPriceDisplay) / 2).toFixed(0)}</span>
                    <span className="text-muted-foreground">/first month</span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl font-bold">${monthlyPriceDisplay}</span>
                    <span className="text-muted-foreground">/month after trial</span>
                  </>
                )}
              </div>

              {hasCoupon && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Percent className="w-3 h-3 mr-1" />
                  Streak reward applied
                </Badge>
              )}

              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-3">
                {hasCoupon ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => checkoutWithRewardMutation.mutate()}
                    disabled={isLoading || priceLoading || userLoading}
                    data-testid="button-subscribe-with-reward"
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    {checkoutWithRewardMutation.isPending ? "Redirecting..." : `Start Trial - $${(parseInt(monthlyPriceDisplay) / 2).toFixed(0)} First Month After`}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleSubscribe(true)}
                    disabled={isLoading || priceLoading || userLoading}
                    data-testid="button-start-trial"
                  >
                    {checkoutMutation.isPending ? "Redirecting..." : userLoading ? "Loading..." : "Start 7-Day Free Trial"}
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  7 days free, then ${monthlyPriceDisplay}/month. Cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">What You Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-md bg-background"
                >
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

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
