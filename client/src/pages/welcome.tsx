import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Sparkles, 
  LogIn,
  Gift,
  ArrowRight,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { LandingAnimation } from "@/components/LandingAnimation";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-amber-50/30 dark:from-rose-950/20 dark:via-background dark:to-amber-950/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="font-heading font-bold text-2xl">Content Calendar</h1>
          <p className="text-muted-foreground text-sm">For Hair Extension Professionals</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex items-center justify-center py-4"
        >
          <LandingAnimation />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="w-3 h-3 mr-1" />
              365 Days of Content Ideas
            </Badge>
            <h2 className="text-xl font-semibold mb-2">Never run out of Instagram content again</h2>
            <p className="text-muted-foreground text-sm">
              Pre-planned posts, AI captions, personalized hashtags
            </p>
          </div>

          <a href="/api/login" className="block">
            <Button size="lg" className="w-full text-base py-6" data-testid="button-start-trial">
              <Gift className="w-5 h-5 mr-2" />
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
          
          <a href="/api/login" className="block">
            <Button variant="outline" size="lg" className="w-full text-base py-6" data-testid="button-sign-in">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </a>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Cancel anytime
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-6 text-xs text-muted-foreground pt-6"
        >
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </motion.div>
      </div>
    </div>
  );
}
