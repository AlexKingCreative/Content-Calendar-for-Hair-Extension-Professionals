import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Sparkles, 
  Check, 
  Heart, 
  Gift, 
  Star, 
  Crown,
  Clock,
  CalendarDays
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

const specialDays = [
  { name: "National Hairstylist Appreciation Day", date: "April 30" },
  { name: "Hair Loss Awareness Month", date: "August" },
  { name: "Extensions Week", date: "February" },
  { name: "Beauty Professional Day", date: "June 26" },
  { name: "World Hair Day", date: "October 1" },
  { name: "National Hair Day", date: "October 1" },
];

const features = [
  { icon: Calendar, text: "365 days of pre-planned content ideas" },
  { icon: Sparkles, text: "AI-powered caption generation" },
  { icon: Heart, text: "Personalized to your voice and brand" },
  { icon: Gift, text: "Never miss special industry days" },
  { icon: Star, text: "Custom hashtags (max 5)" },
  { icon: Crown, text: "Posting streaks with badges" },
];

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const [withTrial, setWithTrial] = useState(false);

  const { data: priceInfo, isLoading: priceLoading } = useQuery<{
    unit_amount?: number;
    price_id?: string;
  } | null>({
    queryKey: ["/api/billing/subscription-price"],
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
    mutationFn: async (trial: boolean) => {
      const res = await apiRequest("POST", "/api/billing/checkout", { withTrial: trial });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const price = priceInfo?.unit_amount ? (priceInfo.unit_amount / 100).toFixed(0) : "10";
  
  const daysRemaining = accessStatus?.freeAccessEndsAt 
    ? Math.max(0, Math.ceil((new Date(accessStatus.freeAccessEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

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
            Never Miss a Special Day Again
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hair pros trust our calendar to stay ahead with daily content ideas,
            industry holidays, and AI-powered captions.
          </p>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                <CalendarDays className="w-3 h-3 mr-1" />
                Special Days Include
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {specialDays.map((day) => (
                <Badge 
                  key={day.name} 
                  variant="outline" 
                  className="text-xs whitespace-nowrap"
                >
                  {day.name}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl font-heading">Pro Monthly</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">${price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

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
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => checkoutMutation.mutate(false)}
                  disabled={checkoutMutation.isPending || priceLoading}
                  data-testid="button-subscribe-now"
                >
                  {checkoutMutation.isPending ? "Loading..." : "Subscribe Now"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => checkoutMutation.mutate(true)}
                  disabled={checkoutMutation.isPending || priceLoading}
                  data-testid="button-start-trial"
                >
                  Start 7-Day Free Trial
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Try free for 7 days, then ${price}/month. Cancel anytime.
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
