import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface AccessStatus {
  hasAccess?: boolean;
  accessibleMonths?: number[];
  freeAccessEndsAt?: string;
  subscriptionStatus?: string;
}

export function TrialBanner() {
  const [, setLocation] = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  const { data: accessStatus } = useQuery<AccessStatus | null>({
    queryKey: ["/api/billing/access-status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

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
        title: "Checkout failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const daysRemaining = accessStatus?.freeAccessEndsAt 
    ? Math.max(0, Math.ceil((new Date(accessStatus.freeAccessEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isSubscribed = accessStatus?.subscriptionStatus === "active" || accessStatus?.subscriptionStatus === "trialing";
  const showBanner = !dismissed && !isSubscribed && daysRemaining <= 7;

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-primary/10 via-rose-400/10 to-primary/10 border-b border-primary/20"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm truncate">
              {daysRemaining > 0 ? (
                <span>
                  <span className="font-medium">{daysRemaining} days left</span>
                  <span className="hidden sm:inline"> in your free access. </span>
                  <span className="text-muted-foreground hidden md:inline">Start your trial for full access!</span>
                </span>
              ) : (
                <span>
                  <span className="font-medium">Free access ended.</span>
                  <span className="hidden sm:inline text-muted-foreground"> Start your 7-day trial to continue!</span>
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              data-testid="button-banner-trial"
            >
              {checkoutMutation.isPending ? "..." : (
                <>
                  <span className="hidden sm:inline">Start Free Trial</span>
                  <span className="sm:hidden">Trial</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDismissed(true)}
              data-testid="button-dismiss-banner"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
