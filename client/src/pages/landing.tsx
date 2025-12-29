import { useState } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  Sparkles, 
  Bell, 
  Hash, 
  Instagram,
  ChevronRight,
  Star,
  Check,
  X,
  Smartphone,
  ArrowDown,
  Quote,
  Play,
  Flame,
  Clock,
  TrendingUp,
  LogIn,
  UserPlus,
  Download,
  Users,
  AlertCircle,
  Target,
  Heart,
  Gift
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
    problem: "I was posting randomly and attracting budget clients.",
    transformation: "Now I'm booked 6 weeks out with premium clients who pay my full price. My engagement doubled and I'm finally known as THE extension specialist in LA!",
  },
  {
    name: "Jessica Turner",
    role: "Salon Owner",
    location: "Miami, FL",
    avatar: "JT",
    rating: 5,
    problem: "Nobody outside my neighborhood knew who I was.",
    transformation: "The personalized hashtags helped me get discovered. I've been featured in a local magazine and my following grew by 3,000 in two months!",
  },
  {
    name: "Amanda Rodriguez",
    role: "Hair Artist",
    location: "New York, NY",
    avatar: "AR",
    rating: 5,
    problem: "I kept attracting clients who didn't value my work.",
    transformation: "Consistent posting positioned me as an expert. Now I get DMs from people saying 'I've been following you for months - I NEED to book with you!'",
  },
  {
    name: "Brittany Chen",
    role: "Extension Educator",
    location: "Houston, TX",
    avatar: "BC",
    rating: 5,
    problem: "I felt invisible while other stylists were blowing up.",
    transformation: "I caught a trend early and got 50k views! Now brands reach out to me for collaborations. I'm finally getting recognized!",
  },
];

const thePlan = [
  {
    step: 1,
    title: "Sign Up in 60 Seconds",
    description: "Tell us your city and specialties. No credit card needed.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Open the App Each Day",
    description: "See exactly what to post. No more staring at a blank screen.",
    icon: Calendar,
  },
  {
    step: 3,
    title: "Become the Go-To Stylist",
    description: "Grow your following, attract premium clients, and get recognized.",
    icon: TrendingUp,
  },
];

const whatYouGet = [
  {
    icon: Calendar,
    title: "365 Days of Post Ideas",
    description: "Know exactly what to post every single day.",
  },
  {
    icon: Hash,
    title: "Personalized Hashtags",
    description: "Custom sets based on your city and expertise.",
  },
  {
    icon: Flame,
    title: "Trend Alerts",
    description: "Get notified when a sound is perfect for hair stylists.",
  },
  {
    icon: Bell,
    title: "Daily Reminders",
    description: "Push notifications keep you on track.",
  },
  {
    icon: Sparkles,
    title: "AI Caption Writer",
    description: "Generate fresh captions when you need inspiration.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download your monthly calendar for offline planning.",
  },
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
            <Link href="/onboarding">
              <Button data-testid="button-sign-up">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Clear One-Liner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-amber-50/30 dark:from-rose-950/20 dark:via-background dark:to-amber-950/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* The One-Liner: What it is + the result */}
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
                Daily Content Ideas for Hair Pros
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="block">Know What to Post.</span>
                <span className="block bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Every Single Day.
                </span>
              </h1>
              
              {/* Clear value prop */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl lg:max-w-none mb-8">
                365 days of done-for-you social media post ideas for cutting, coloring, extensions, toppers, and wigs. Stop guessing. Start posting. Attract premium clients and get recognized.
              </p>
              
              {/* Direct CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6">
                <Link href="/onboarding">
                  <Button size="lg" className="text-lg px-8 py-6 gap-2" data-testid="button-get-started">
                    Start Your Free 7-Day Trial
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* App Store Buttons */}
              {!isInstalled && (
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground mb-3 text-center lg:text-left">Also available as an app:</p>
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
                  <Users className="w-3.5 h-3.5" />
                  2,000+ stylists using it
                </span>
              </div>
            </div>
            
            <div className="hidden lg:block" data-testid="landing-animation">
              <LandingAnimation />
            </div>
          </div>
          
          <div className="lg:hidden mt-12 mb-8" data-testid="landing-animation-mobile">
            <LandingAnimation />
          </div>
          
          <div className="flex justify-center mt-8">
            <ArrowDown className="w-6 h-6 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* The Problem Section - External, Internal, Philosophical */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sound Familiar?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* External Problem */}
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">No Time to Plan</h3>
              <p className="text-muted-foreground text-sm">
                You're busy doing hair all day. The last thing you want to do is spend your evenings figuring out what to post.
              </p>
            </Card>
            
            {/* Internal Problem */}
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Overwhelmed & Frustrated</h3>
              <p className="text-muted-foreground text-sm">
                You know you should be posting, but staring at a blank screen feels paralyzing. Other stylists make it look so easy.
              </p>
            </Card>
            
            {/* Philosophical Problem */}
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Missing Opportunities</h3>
              <p className="text-muted-foreground text-sm">
                Your talent deserves to be seen. But inconsistent posting means potential clients scroll right past you.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* The Guide Section - Empathy + Authority */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Heart className="w-3 h-3 mr-1" />
                We Get It
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                We Know How Hard It Is
              </h2>
              <p className="text-muted-foreground mb-4">
                This app was created by Ashley Diana, founder of Rich Stylist Academy and a hair pro who has coached thousands of stylists to grow their businesses.
              </p>
              <p className="text-muted-foreground mb-6">
                She saw the same problem over and over: incredibly talented stylists who couldn't stay consistent on social media because they didn't know what to post.
              </p>
              <p className="font-medium">
                So she built a solution. A full year of content ideas, made specifically for hair professionals.
              </p>
              <div className="mt-6">
                <Link href="/about">
                  <Button variant="outline" className="gap-2" data-testid="button-meet-ashley">
                    <Instagram className="w-4 h-4" />
                    Meet Ashley
                  </Button>
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-block p-8 bg-primary/5 rounded-2xl">
                <div className="text-6xl font-bold text-primary mb-2">2,000+</div>
                <p className="text-muted-foreground">stylists already using this app</p>
                <div className="flex justify-center gap-1 mt-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Plan - 3 Simple Steps */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">The Plan</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Here's How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started takes less than 2 minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {thePlan.map((item, index) => (
              <div key={index} className="text-center" data-testid={`plan-step-${index}`}>
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/onboarding">
              <Button size="lg" className="text-lg px-8 py-6 gap-2" data-testid="button-get-started-plan">
                Start Your Free Trial
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">What You Get</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Post Consistently
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatYouGet.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4" data-testid={`feature-${index}`}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Failure Section - What's at Stake */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Badge variant="outline" className="mb-4 border-destructive/50 text-destructive">
                <X className="w-3 h-3 mr-1" />
                Without a Plan
              </Badge>
              <h3 className="text-2xl font-bold mb-4">What Happens If You Do Nothing</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Keep attracting budget clients who don't value your work
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Stay invisible while other stylists get all the recognition
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Watch your following stay flat month after month
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  Wonder why you're not getting the clients you deserve
                </li>
              </ul>
            </div>
            <div>
              <Badge variant="secondary" className="mb-4">
                <Check className="w-3 h-3 mr-1" />
                With Content Calendar
              </Badge>
              <h3 className="text-2xl font-bold mb-4">What Your Life Looks Like</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Attract premium clients who happily pay your prices
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Grow a following that sees you as THE expert
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Get recognized as the go-to stylist in your area
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Have brands and clients reaching out to YOU
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success - Testimonials with Transformation */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Real Results</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stylists Who Transformed Their Content
            </h2>
            <p className="text-lg text-muted-foreground">
              Here's what happened when they started using the app.
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
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-destructive">Before:</span> {testimonial.problem}
                    </p>
                    <p className="text-sm mb-4">
                      <span className="font-medium text-emerald-600">After:</span> {testimonial.transformation}
                    </p>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
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

      {/* Pricing - Simple and Clear */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Less Than a Coffee a Week
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try free for 7 days. Then just $9.99/month for unlimited access.
            </p>
          </div>
          
          <Card className="p-8 max-w-xl mx-auto border-primary relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">7-Day Free Trial</Badge>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">$9.99<span className="text-xl font-normal text-muted-foreground">/mo</span></div>
              <p className="text-muted-foreground">After your free trial</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                365 days of post ideas for hair pros
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                Personalized hashtags for your city
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                Trend alerts for viral opportunities
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                AI caption generation
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                Daily reminders to keep you consistent
              </li>
              <li className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">Earn 50% off by posting 7 days straight!</span>
              </li>
            </ul>
            <Link href="/onboarding">
              <Button size="lg" className="w-full text-lg py-6" data-testid="button-pricing-start">
                Start Your Free 7-Day Trial
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground mt-4">
              No credit card required. Cancel anytime.
            </p>
          </Card>
          
          <div className="text-center mt-8">
            <Link href="/salon-pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              <Users className="w-4 h-4 inline mr-1" />
              Salon owner? Get team pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Questions?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              We've Got Answers
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "What if I'm not good at social media?",
                a: "That's exactly why we built this. You don't need to be good at social media - you just need to show up. We tell you what to post every day. You just create it and hit publish."
              },
              {
                q: "How is this different from other content planners?",
                a: "Generic planners give you blank calendars. We give you 365 days of done-for-you ideas specifically for hair professionals - cutting, coloring, extensions, toppers, and wigs. Plus trend alerts, personalized hashtags, and AI captions."
              },
              {
                q: "Will this actually help me attract premium clients?",
                a: "When you post consistently, you position yourself as an expert. That attracts clients who value quality and are willing to pay for it. Our users report getting more inquiries from dream clients who say 'I've been following you - I need to book with you!'"
              },
              {
                q: "What if I miss a day?",
                a: "No problem. Just pick up where you left off. The app has daily reminders to keep you on track, and you can always scroll ahead or back to find content that works for you."
              },
              {
                q: "How does the 7-day trial work?",
                a: "You get full access to everything for 7 days, completely free. No credit card needed. If you love it, upgrade to keep using it. If not, no hard feelings."
              },
              {
                q: "What's the streak reward?",
                a: "If you post for 7 days straight during your trial, you earn 50% off your first month. It's our way of rewarding you for being consistent!"
              },
              {
                q: "I'm a salon owner. Can my whole team use this?",
                a: "Yes! We have salon plans starting at $49/month for up to 5 stylists. Each stylist gets their own account with personalized hashtags, and you get a dashboard to track everyone's posting activity and streaks."
              },
              {
                q: "How do I get my stylists to actually post?",
                a: "Our salon plans include streak tracking and incentive rewards. You can see who's posting consistently and reward your top performers. Many owners offer bonuses or prizes for maintaining posting streaks - it gamifies the whole process."
              },
              {
                q: "Can I manage my team's content from one place?",
                a: "Yes! The salon owner dashboard shows you each stylist's activity, their current streak, and their posting history. You can invite new team members with a simple link and remove access anytime."
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

      {/* Final CTA - Direct Call to Action */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary to-rose-600 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Attract Premium Clients?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Grow your following. Get recognized in your industry. Become the stylist everyone wants to book. It starts with showing up consistently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6 gap-2" data-testid="button-final-cta">
                Start Your Free Trial
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm opacity-70 mt-4">
            No credit card required. Takes 60 seconds.
          </p>
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
                365 days of content ideas for hair professionals. Built by stylists, for stylists.
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
                <Link href="/salon-pricing" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-salon">
                  Salon Plans
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
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  About
                </Link>
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
