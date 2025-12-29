import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles, Hash, Flame, Gift, Check, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface TrialOfferModalProps {
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export function TrialOfferModal({ open, onClose, onSkip }: TrialOfferModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/billing/checkout", { withTrial: true });
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
        title: "Something went wrong",
        description: error.message || "Please try again or skip for now.",
        variant: "destructive",
      });
    },
  });

  const features = [
    { icon: Calendar, text: "Full 365-day content calendar", color: "text-rose-500" },
    { icon: Sparkles, text: "AI-powered captions", color: "text-violet-500" },
    { icon: Hash, text: "Personalized hashtags", color: "text-blue-500" },
    { icon: Flame, text: "Streak tracking with rewards", color: "text-amber-500" },
  ];

  const handleStartTrial = () => {
    checkoutMutation.mutate();
  };

  const handleSkip = () => {
    onSkip();
    onClose();
    setLocation("/calendar");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-rose-400/20 flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <DialogTitle className="text-2xl font-heading">You're All Set!</DialogTitle>
          <DialogDescription className="text-base">
            Start your 7-day free trial to unlock everything
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-sm">Bonus: 50% Off Reward</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete a 7-day posting streak during your trial to unlock 50% off your first paid month!
            </p>
          </motion.div>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            size="lg"
            onClick={handleStartTrial}
            disabled={checkoutMutation.isPending}
            data-testid="button-start-trial-modal"
          >
            {checkoutMutation.isPending ? "Redirecting..." : (
              <>
                Start 7-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleSkip}
            disabled={checkoutMutation.isPending}
            data-testid="button-skip-trial"
          >
            Explore free calendar first
          </Button>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Cancel anytime
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
