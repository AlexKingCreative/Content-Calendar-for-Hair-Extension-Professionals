import { useState } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  Sparkles, 
  Bell, 
  Filter, 
  Hash, 
  Instagram,
  ChevronRight,
  ChevronLeft,
  Star,
  Check,
  X,
  Smartphone,
  ArrowDown,
  Quote,
  Play,
  Zap,
  Clock,
  TrendingUp,
  LogIn,
  UserPlus,
  Download,
  Users,
  Flame,
  AlertCircle,
  Crown
} from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { navigateToLogin } from "@/lib/auth-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { LandingAnimation } from "@/components/LandingAnimation";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Extension Specialist",
    location: "Los Angeles, CA",
    avatar: "SM",
    rating: 5,
    quote: "This app completely transformed how I plan my Instagram content. I went from posting randomly to having a strategic 12-month plan. My engagement has doubled!",
  },
  {
    name: "Jessica Turner",
    role: "Salon Owner",
    location: "Miami, FL",
    avatar: "JT",
    rating: 5,
    quote: "The personalized hashtags based on my city and certified brands are a game-changer. I'm reaching so many more local clients now.",
  },
  {
    name: "Amanda Rodriguez",
    role: "Hair Artist",
    location: "New York, NY",
    avatar: "AR",
    rating: 5,
    quote: "Daily push notifications remind me to post even on my busiest days. My consistency has never been better, and my followers love it!",
  },
  {
    name: "Brittany Chen",
    role: "Extension Educator",
    location: "Houston, TX",
    avatar: "BC",
    rating: 5,
    quote: "The trend alerts are amazing! I caught a viral audio early and got 50k views on my reel. This app pays for itself!",
  },
];

const features = [
  {
    icon: Calendar,
    title: "365 Days of Content",
    description: "Pre-planned post ideas for every single day of the year. Never wonder what to post again.",
    color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  },
  {
    icon: Flame,
    title: "Trend Alerts",
    description: "Get notified when trending sounds and topics are perfect for hair stylists. Never miss a chance to go viral.",
    color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  },
  {
    icon: Hash,
    title: "Personalized Hashtags",
    description: "Custom hashtag sets based on your city, certified brands, and extension methods.",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Filter,
    title: "Smart Filtering",
    description: "Filter by category, content type, or month to find exactly what you need.",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Bell,
    title: "Daily Reminders",
    description: "Push notifications remind you to post at the perfect time every day.",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    icon: Instagram,
    title: "Instagram Examples",
    description: "Real Instagram post examples for inspiration on every content idea.",
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description: "Generate fresh content ideas with our AI assistant when you need something unique.",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download your monthly calendar as a beautifully formatted PDF for offline planning.",
    color: "bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400",
  },
];

const stats = [
  { value: "2,000+", label: "Hair Pros Using It" },
  { value: "365", label: "Daily Post Ideas" },
  { value: "10+", label: "Content Categories" },
  { value: "6", label: "Content Types" },
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up Free",
    description: "Create your account in seconds. No credit card required to start.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Personalize Your Feed",
    description: "Tell us your city, certified brands, and specialties for custom hashtags.",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "Post & Grow",
    description: "Follow daily prompts, stay consistent, and watch your following grow.",
    icon: TrendingUp,
  },
];

const comparisonData = [
  { feature: "365 days of hair-specific content", us: true, others: false },
  { feature: "Personalized hashtags for your city", us: true, others: false },
  { feature: "Trend alerts for viral opportunities", us: true, others: false },
  { feature: "AI caption generation", us: true, others: false },
  { feature: "Hair extension focused content", us: true, others: false },
  { feature: "Daily push notification reminders", us: true, others: false },
  { feature: "Streak tracking & badges", us: true, others: false },
];

export default function LandingPage() {
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall, platform } = useInstallPrompt();

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (isInstallable) {
      await promptInstall();
    } else {
      window.location.href = "/calendar";
    }
  };

  const showInstallButton = !isInstalled && (isIOS || isInstallable || platform === "android");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
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
            <Button variant="ghost" onClick={navigateToLogin} data-testid="button-sign-in">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Link href="/signup">
              <Button data-testid="button-sign-up">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-amber-50/30 dark:from-rose-950/20 dark:via-background dark:to-amber-950/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Info */}
            <div className="text-center lg:text-left">
              {/* Social Proof Badge */}
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Join 2,000+ Hair Pros Already Using This
              </Badge>
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="block">Never Run Out of</span>
                <span className="block bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Instagram Content Again
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl lg:max-w-none mb-8">
                365 days of professionally crafted social media post ideas for hair pros. Covering cutting, coloring, extensions, toppers, and wigs. Plus trend alerts so you never miss a viral opportunity.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6">
                {isInstalled ? (
                  <Link href="/calendar">
                    <Button size="lg" className="text-lg px-8 py-6 gap-2" data-testid="button-open-app">
                      <Play className="w-5 h-5" />
                      Open App
                    </Button>
                  </Link>
                ) : (
                  <Link href="/onboarding">
                    <Button size="lg" className="text-lg px-8 py-6 gap-2" data-testid="button-get-started">
                      <Play className="w-5 h-5" />
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </div>

              {/* App Store Buttons */}
              {!isInstalled && (
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground mb-3 text-center lg:text-left">Download the app:</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    {(isIOS || (!isIOS && !isAndroid)) && (
                      <a 
                        href="https://apps.apple.com/app/content-calendar-hair-pro/id6757116246" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid="button-app-store"
                      >
                        <Button variant="outline" size="lg" className="gap-2 min-w-[180px]">
                          <SiApple className="w-5 h-5" />
                          <div className="text-left">
                            <div className="text-[10px] leading-tight opacity-70">Download on the</div>
                            <div className="text-sm font-semibold leading-tight">App Store</div>
                          </div>
                        </Button>
                      </a>
                    )}
                    {(isAndroid || (!isIOS && !isAndroid)) && (
                      <a 
                        href="https://play.google.com/store/apps/details?id=com.hairpro360.contentcalendar" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-testid="button-play-store"
                      >
                        <Button variant="outline" size="lg" className="gap-2 min-w-[180px]">
                          <SiGoogleplay className="w-5 h-5" />
                          <div className="text-left">
                            <div className="text-[10px] leading-tight opacity-70">Get it on</div>
                            <div className="text-sm font-semibold leading-tight">Google Play</div>
                          </div>
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Install on any device
                </span>
              </div>
            </div>
            
            {/* Right Column - App Demo Animation */}
            <div className="hidden lg:block" data-testid="landing-animation">
              <LandingAnimation />
            </div>
          </div>
          
          {/* Mobile Animation - shown below on smaller screens */}
          <div className="lg:hidden mt-12 mb-8" data-testid="landing-animation-mobile">
            <LandingAnimation />
          </div>
          
          {/* Scroll Indicator */}
          <div className="flex justify-center mt-8">
            <ArrowDown className="w-6 h-6 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1" data-testid={`stat-value-${index}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Growing Your Following in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get set up in under 2 minutes and start posting like a pro today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center" data-testid={`how-it-works-${index}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">The Problem</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Struggling to Stay Consistent on Social Media?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Spending hours trying to figure out what to post
                </p>
                <p className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Inconsistent posting hurting your growth
                </p>
                <p className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Using the same hashtags that don't reach new clients
                </p>
                <p className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Missing trending sounds and topics that could go viral
                </p>
              </div>
            </div>
            <div>
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-3 h-3 mr-1" />
                The Solution
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Your Complete Content Strategy in One App
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Open the app, see today's post idea, and create in minutes
                </p>
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Daily push notifications keep you on track
                </p>
                <p className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Personalized hashtags based on YOUR location and expertise
                </p>
                <p className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  Trend alerts notify you of viral opportunities for hair stylists
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Dominate Instagram
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed by hair pros, for hair pros.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover-elevate transition-all" data-testid={`feature-card-${index}`}>
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built Specifically for Hair Professionals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generic content planners don't understand the hair industry. We do.
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-sm">
              <div>Feature</div>
              <div className="text-center">
                <span className="inline-flex items-center gap-1">
                  <Crown className="w-4 h-4 text-primary" />
                  Content Calendar
                </span>
              </div>
              <div className="text-center text-muted-foreground">Generic Planners</div>
            </div>
            {comparisonData.map((row, index) => (
              <div key={index} className={`grid grid-cols-3 p-4 text-sm ${index % 2 === 0 ? "" : "bg-muted/20"}`} data-testid={`comparison-row-${index}`}>
                <div className="text-muted-foreground">{row.feature}</div>
                <div className="text-center">
                  {row.us ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  )}
                </div>
                <div className="text-center">
                  {row.others ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Simple Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Free, Upgrade When You're Ready
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try it free for 3 days. Then just $10/month for unlimited access.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Free Trial</h3>
                <div className="text-4xl font-bold mb-1">$0</div>
                <p className="text-sm text-muted-foreground">3-day full access</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Current + next month's content
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Personalized hashtags
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Daily reminders
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4" />
                  Full 12-month calendar
                </li>
              </ul>
              <Link href="/onboarding">
                <Button variant="outline" className="w-full" data-testid="button-pricing-free">
                  Start Free Trial
                </Button>
              </Link>
            </Card>
            
            {/* Pro Tier */}
            <Card className="p-6 border-primary relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-1">$10<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <p className="text-sm text-muted-foreground">Full access to everything</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  All 12 months of content
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Trend alerts for viral content
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  AI caption generation
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  PDF export & offline access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Priority support
                </li>
              </ul>
              <Link href="/pricing">
                <Button className="w-full" data-testid="button-pricing-pro">
                  Get Pro Access
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Install CTA Strip */}
      <section className="py-12 bg-gradient-to-r from-primary to-rose-600 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Transform Your Content Game?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Install the app on your phone and start posting like a pro today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showInstallButton && (
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 gap-2"
                onClick={handleInstallClick}
                data-testid="button-install-cta"
              >
                <Smartphone className="w-5 h-5" />
                {isIOS ? "Add to Home Screen" : "Install Free App"}
              </Button>
            )}
            <Link href="/calendar">
              <Button variant="outline" size="lg" className="text-lg px-8 gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-start-using">
                Start Using Now
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Hair Professionals Everywhere
            </h2>
            <p className="text-lg text-muted-foreground">
              See what stylists are saying about their content transformation.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6" data-testid={`testimonial-card-${index}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 relative">
                      <Quote className="w-4 h-4 absolute -left-2 -top-2 text-primary/20" />
                      {testimonial.quote}
                    </p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} - {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "What exactly does this app do?",
                a: "This app gives you 365 days of ready-to-use social media post ideas specifically for hair pros - cutting, coloring, extensions, toppers, and wigs. Each day includes a post title, description, content type suggestion, category, and personalized hashtags based on your location and expertise. Premium members also get AI-powered caption generation."
              },
              {
                q: "How does the free trial work?",
                a: "You get a full 7-day free trial with access to all premium features. During your trial, if you post for 7 days straight and build a streak, you'll earn 50% off your first month as a reward for staying consistent!"
              },
              {
                q: "What are trend alerts?",
                a: "We monitor trending sounds, topics, and hashtags that are perfect for hair stylists. When we spot a viral opportunity, you'll get notified so you can jump on the trend early and maximize your reach. Many of our users have gotten their first viral video this way!"
              },
              {
                q: "Why do I need this app?",
                a: "Coming up with fresh content ideas every day is exhausting. This app eliminates that stress by telling you exactly what to post, when to post it, and how to write it. It keeps you consistent, saves you hours of planning, and helps you show up professionally on social media every single day."
              },
              {
                q: "Will this get me more followers?",
                a: "Consistent, quality content is the number one way to grow your following. This app helps you post regularly with strategic content that showcases your expertise, engages your audience, and attracts new clients. Many stylists see significant growth within the first few months of staying consistent."
              },
              {
                q: "How much does it cost after the trial?",
                a: "After your 7-day free trial, the app is just $9.99/month. That's less than the cost of one coffee a week to never worry about content ideas again. Plus, earn 50% off your first month by maintaining a 7-day posting streak during your trial!"
              },
              {
                q: "What devices does this work on?",
                a: "We have native apps for both iPhone (App Store) and Android (Google Play), plus a full web version you can access from any browser. Your account syncs across all devices."
              },
              {
                q: "Will I get push notifications?",
                a: "Yes! Our mobile apps send daily reminders to help you stay consistent with your posting. You'll also get notified about trend alerts so you never miss a viral opportunity."
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6" data-testid={`faq-card-${index}`}>
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Start Your Content Transformation Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 2,000+ hair pros who have revolutionized their social media presence. It takes just 2 minutes to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showInstallButton && (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 gap-2"
                onClick={handleInstallClick}
                data-testid="button-final-install"
              >
                <Smartphone className="w-5 h-5" />
                {isIOS ? "Add to Home Screen" : "Install Free App"}
              </Button>
            )}
            <Link href="/onboarding">
              <Button variant={showInstallButton ? "outline" : "default"} size="lg" className="text-lg px-8 py-6 gap-2" data-testid="button-final-get-started">
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="font-semibold">Content Calendar</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your daily companion for social media success in the hair industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/calendar" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-calendar">
                  Calendar
                </Link>
                <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-pricing">
                  Pricing
                </Link>
                <Link href="/onboarding" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-personalize">
                  Personalize
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              2025 Content Calendar for Hair Pros. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* iOS Install Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install on iPhone</DialogTitle>
            <DialogDescription>
              Follow these steps to add the app to your home screen:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Tap the Share button</p>
                <p className="text-sm text-muted-foreground">It's the square with an arrow pointing up at the bottom of Safari</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                <p className="text-sm text-muted-foreground">You may need to scroll down in the share sheet</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Tap "Add" in the top right</p>
                <p className="text-sm text-muted-foreground">The app will appear on your home screen!</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowIOSModal(false)} className="w-full" data-testid="button-ios-modal-close">
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
