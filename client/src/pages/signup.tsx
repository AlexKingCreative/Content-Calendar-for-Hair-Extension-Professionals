import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Sparkles, 
  Check, 
  Star,
  Crown,
  Smartphone,
  ArrowRight,
  LogIn
} from "lucide-react";
import { motion } from "framer-motion";
import { navigateToLogin } from "@/lib/auth-utils";

const freeFeatures = [
  "Current month + next month access",
  "Browse all daily post ideas",
  "Category filtering",
  "Content type filtering",
];

const proFeatures = [
  "Full 12-month calendar access",
  "365 days of pre-planned content",
  "AI-powered caption generation",
  "Personalized to your voice and brand",
  "Custom hashtags (max 5)",
  "Posting streaks with badges",
  "Push notification reminders",
  "Never miss important dates in your industry",
  "PDF export for planning",
];

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg hidden sm:block">Content Calendar</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={navigateToLogin} data-testid="button-signin-header">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Join thousands of hair pros
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
              Start Your Content Journey
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sign up free and explore the calendar. Start a 7-day free trial when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Free Trial
                    </CardTitle>
                    <Badge variant="secondary">Free to Try</Badge>
                  </div>
                  <CardDescription>
                    Get started with limited access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <Separator />
                  
                  <ul className="space-y-3">
                    {freeFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="outline" className="w-full" size="lg" onClick={navigateToLogin} data-testid="button-signup-free">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      Pro Plan
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Full access to everything
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-4">
                    <span className="text-4xl font-bold">$10</span>
                    <span className="text-muted-foreground">/month</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional 7-day free trial available
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <ul className="space-y-3">
                    {proFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full" size="lg" onClick={navigateToLogin} data-testid="button-signup-pro">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <button onClick={navigateToLogin} className="text-primary font-medium hover:underline">
                Sign in here
              </button>
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Works on all devices
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                No commitment
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-foreground">Contact Us</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
