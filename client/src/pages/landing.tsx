import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
  Gift,
  Award,
  Zap
} from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { navigateToLogin } from "@/lib/auth-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { LandingAnimation } from "@/components/LandingAnimation";
import { CalendarDemo, AICaptionDemo, StreakDemo, InstagramDemo, HashtagDemo } from "@/components/LandingDemos";
import denaePhoto from "@assets/Denae_Tafoya_1767024771840.jpg";
import danniPhoto from "@assets/Dannielle_Vizzini_1767024800600.jpg";
import maryPhoto from "@assets/mary_james_square_1767024880276.png";

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const fadeInUp = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const testimonials = [
  {
    name: "Denae Tafoya",
    role: "Hair Extensionist",
    location: "Denver, CO",
    avatar: "DT",
    photo: denaePhoto,
    rating: 5,
    problem: "I struggled to come up with fresh content ideas every day.",
    transformation: "Now I have a whole year of content planned out! The daily prompts keep me inspired and my clients love seeing consistent, professional posts.",
  },
  {
    name: "Danni V",
    role: "Salon Owner",
    location: "Florida",
    avatar: "DV",
    photo: danniPhoto,
    rating: 5,
    problem: "Getting my team to post consistently was like pulling teeth.",
    transformation: "Now we use the app to inspire and reward our team members. The streak challenges turned social media into a fun competition and everyone's engaged!",
  },
  {
    name: "Mary James",
    role: "Hair Extensionist",
    location: "Ohio",
    avatar: "MJ",
    photo: maryPhoto,
    rating: 5,
    problem: "I didn't have time to plan content while running my business.",
    transformation: "Now I give my virtual assistant access to the app and they know exactly what to post for my business. It's like having a content manager on autopilot!",
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
    description: "Tell us your city and specialties. Takes just 60 seconds.",
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
    title: "Monthly Post Ideas",
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
              <span className="font-heading font-bold text-lg hidden sm:block">Content Calendar for Hair Pros</span>
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
      <section className="relative overflow-x-clip">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-amber-50/30 dark:from-rose-950/20 dark:via-background dark:to-amber-950/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-rose-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* The One-Liner: What it is + the result */}
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Daily Content Ideas for Hair Pros
                </Badge>
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 overflow-visible"
                variants={fadeInUp}
              >
                <span className="block">Know What to Post.</span>
                <span className="block bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent leading-tight py-1">
                  Every Single Day.
                </span>
              </motion.h1>
              
              {/* Clear value prop */}
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl lg:max-w-none mb-8"
                variants={fadeInUp}
              >
                Monthly done-for-you social media post ideas for cutting, coloring, extensions, toppers, and wigs. Stop guessing. Start posting. Attract premium clients and get recognized.
              </motion.p>
              
              {/* Direct CTA */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6"
                variants={fadeInUp}
              >
                <Link href="/onboarding">
                  <Button size="lg" className="text-lg px-8 py-6 gap-2 shadow-lg shadow-primary/25" data-testid="button-get-started">
                    Start Your Free 7-Day Trial
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

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
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
                variants={fadeInUp}
              >
                <span className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border">
                  <Check className="w-4 h-4 text-emerald-500" />
                  7-day free trial
                </span>
              </motion.div>
            </motion.div>
            
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

      {/* Interactive Demos Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,165,116,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.05),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              See It In Action
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features, Simple to Use
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how the app helps you create and post content effortlessly.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="flex flex-col"
            >
              <CalendarDemo />
              <div className="text-center mt-4">
                <h3 className="font-semibold mb-1">Monthly Content Ideas</h3>
                <p className="text-sm text-muted-foreground">Browse by month, filter by category</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <AICaptionDemo />
              <div className="text-center mt-4">
                <h3 className="font-semibold mb-1">AI Caption Generator</h3>
                <p className="text-sm text-muted-foreground">One-tap captions for any post type</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col"
            >
              <HashtagDemo />
              <div className="text-center mt-4">
                <h3 className="font-semibold mb-1">Smart Hashtags</h3>
                <p className="text-sm text-muted-foreground">Personalized based on your location and specialty</p>
              </div>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col"
            >
              <StreakDemo />
              <div className="text-center mt-4">
                <h3 className="font-semibold mb-1">Streak Rewards</h3>
                <p className="text-sm text-muted-foreground">Stay consistent and build your brand</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col"
            >
              <InstagramDemo />
              <div className="text-center mt-4">
                <h3 className="font-semibold mb-1">Instagram Integration</h3>
                <p className="text-sm text-muted-foreground">Track your posts and measure your growth</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem Section - External, Internal, Philosophical */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive">
              <AlertCircle className="w-3 h-3 mr-1.5" />
              The Struggle Is Real
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sound Familiar?
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* External Problem */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 text-center h-full border-destructive/10 hover-elevate">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">No Time to Plan</h3>
                <p className="text-muted-foreground text-sm">
                  You're busy doing hair all day. The last thing you want to do is spend your evenings figuring out what to post.
                </p>
              </Card>
            </motion.div>
            
            {/* Internal Problem */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 text-center h-full border-destructive/10 hover-elevate">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Overwhelmed & Frustrated</h3>
                <p className="text-muted-foreground text-sm">
                  You know you should be posting, but staring at a blank screen feels paralyzing. Other stylists make it look so easy.
                </p>
              </Card>
            </motion.div>
            
            {/* Philosophical Problem */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 text-center h-full border-destructive/10 hover-elevate">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Missing Opportunities</h3>
                <p className="text-muted-foreground text-sm">
                  Your talent deserves to be seen. But inconsistent posting means potential clients scroll right past you.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Guide Section - Empathy + Authority */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="max-w-5xl mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Heart className="w-3 h-3 mr-1" />
                Meet the Creator
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Built by a Stylist, for Stylists
              </h2>
              <p className="text-muted-foreground mb-4">
                Hi, I'm Ashley Diana! I'm the founder of Rich Stylist Academy and I've spent years helping hairstylists grow on social media to attract premium clients and create their dream business.
              </p>
              <p className="text-muted-foreground mb-6">
                I saw the same problem over and over: incredibly talented stylists who couldn't stay consistent on social media because they didn't know what to post.
              </p>
              <p className="font-medium text-lg">
                So I built this app for you. Fresh content ideas every month, made specifically for hair professionals like us.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <a href="https://instagram.com/missashleyhair" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-follow-ashley">
                    <Instagram className="w-4 h-4" />
                    @missashleyhair
                  </Button>
                </a>
              </div>
            </motion.div>
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-3xl blur-2xl scale-95" />
                <img 
                  src="/attached_assets/IMG_5580_1767050115161.JPG" 
                  alt="Ashley Diana - Founder of Rich Stylist Academy" 
                  className="relative w-80 h-96 object-cover object-top rounded-3xl border-4 border-background shadow-2xl"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-2 shadow-lg bg-background text-foreground border">
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-400 text-amber-400" />
                    Rich Stylist Academy
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Plan - 3 Simple Steps */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-background via-muted/30 to-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,165,116,0.08),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              The Plan
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Here's How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started takes less than 2 minutes.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {thePlan.map((item, index) => (
              <motion.div key={index} className="text-center relative" data-testid={`plan-step-${index}`} variants={fadeInUp}>
                {index < thePlan.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-rose-500 text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-primary/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="text-center mt-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/onboarding">
              <Button size="lg" className="text-lg px-8 py-6 gap-2 shadow-lg shadow-primary/25" data-testid="button-get-started-plan">
                Start Your Free Trial
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              What You Get
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Post Consistently
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {whatYouGet.map((feature, index) => (
              <motion.div 
                key={index} 
                className="flex items-start gap-4 p-5 rounded-xl border bg-card/50 hover-elevate" 
                data-testid={`feature-${index}`}
                variants={fadeInUp}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Failure Section - What's at Stake */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,165,116,0.05),transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 h-full border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
                <Badge variant="outline" className="mb-4 border-destructive/50 text-destructive">
                  <X className="w-3 h-3 mr-1" />
                  Without a Plan
                </Badge>
                <h3 className="text-2xl font-bold mb-6">What Happens If You Do Nothing</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    Keep attracting budget clients who don't value your work
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    Stay invisible while other stylists get all the recognition
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    Watch your following stay flat month after month
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    Wonder why you're not getting the clients you deserve
                  </li>
                </ul>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 h-full border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <Badge variant="secondary" className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                  <Check className="w-3 h-3 mr-1" />
                  With Content Calendar
                </Badge>
                <h3 className="text-2xl font-bold mb-6">What Your Life Looks Like</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    Attract premium clients who happily pay your prices
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    Grow a following that sees you as THE expert
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    Get recognized as the go-to stylist in your area
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    Have brands and clients reaching out to YOU
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success - Testimonials with Transformation */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-400 text-amber-400" />
              Real Results
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stylists Who Transformed Their Content
            </h2>
            <p className="text-lg text-muted-foreground">
              Here's what happened when they started using the app.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 h-full hover-elevate" data-testid={`testimonial-card-${index}`}>
                  <div className="flex items-start gap-4">
                    {testimonial.photo ? (
                      <img 
                        src={testimonial.photo} 
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                        data-testid={`img-testimonial-${index}`}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold flex-shrink-0 text-lg">
                        {testimonial.avatar}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium text-destructive">Before:</span> {testimonial.problem}
                      </p>
                      <p className="text-sm mb-4">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">After:</span> {testimonial.transformation}
                      </p>
                      <div className="pt-3 border-t">
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.role} - {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing - Simple and Clear */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/50 via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,165,116,0.1),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Less Than a Coffee a Week
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try free for 7 days. Then just $10/month for unlimited access.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-10 max-w-xl mx-auto border-primary/50 relative bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1.5 shadow-lg">
                  <Flame className="w-3.5 h-3.5 mr-1.5" />
                  7-Day Free Trial
                </Badge>
              </div>
              <div className="text-center mb-8 pt-4">
                <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                  $10<span className="text-2xl font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-muted-foreground">After your free trial</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  Fresh post ideas every month
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  Personalized hashtags for your city
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  Trend alerts for viral opportunities
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  AI caption generation
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  Daily reminders to keep you consistent
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <Gift className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-primary font-medium">Streak milestones unlock special rewards!</span>
                </li>
              </ul>
              <Link href="/onboarding">
                <Button size="lg" className="w-full text-lg py-6 shadow-lg shadow-primary/25" data-testid="button-pricing-start">
                  Start Your Free 7-Day Trial
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Cancel anytime. 7-day free trial.
              </p>
            </Card>
          </motion.div>
          
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/salon-pricing">
              <Button variant="ghost" size="lg" className="gap-2">
                <Users className="w-4 h-4" />
                Salon owner? Get team pricing
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/4 translate-x-1/4" />
        <div className="max-w-3xl mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">Questions?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              We've Got Answers
            </h2>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                q: "What if I'm not good at social media?",
                a: "That's exactly why we built this. You don't need to be good at social media - you just need to show up. We tell you what to post every day. You just create it and hit publish."
              },
              {
                q: "How is this different from other content planners?",
                a: "Generic planners give you blank calendars. We give you monthly done-for-you ideas specifically for hair professionals - cutting, coloring, extensions, toppers, and wigs. Plus trend alerts, personalized hashtags, and AI captions."
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
                a: "You get full access to everything for 7 days with our free trial. If you love it, you'll be billed after the trial ends. If not, cancel before the trial ends and you won't be charged."
              },
              {
                q: "What's the streak reward?",
                a: "Posting consistently unlocks milestone rewards and keeps you motivated. Building a daily posting habit is the secret to growing your audience!"
              },
              {
                q: "I'm a salon owner. Can my whole team use this?",
                a: "Yes! We have salon plans starting at $49/month for up to 5 stylists. Each stylist gets their own account with personalized hashtags, and you get a dashboard to track everyone's posting activity and streaks.",
                link: "/salon-pricing",
                linkText: "View salon plans"
              },
              {
                q: "How do I get my stylists to actually post?",
                a: "Our salon plans include streak tracking and incentive rewards. You can see who's posting consistently and reward your top performers. Many owners offer bonuses or prizes for maintaining posting streaks - it gamifies the whole process.",
                link: "/salon-pricing",
                linkText: "See how it works"
              },
              {
                q: "Can I manage my team's content from one place?",
                a: "Yes! The salon owner dashboard shows you each stylist's activity, their current streak, and their posting history. You can invite new team members with a simple link and remove access anytime."
              },
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 hover-elevate" data-testid={`faq-card-${index}`}>
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">
                    {faq.a}
                    {faq.link && (
                      <>
                        {" "}
                        <Link href={faq.link} className="text-primary hover:underline font-medium">
                          {faq.linkText}
                        </Link>
                      </>
                    )}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA - Direct Call to Action */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-primary via-rose-500 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Attract Premium Clients?
            </h2>
            <p className="text-lg sm:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Grow your following. Get recognized in your industry. Become the stylist everyone wants to book. It starts with showing up consistently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button variant="secondary" size="lg" className="text-lg px-10 py-7 gap-2 shadow-xl" data-testid="button-final-cta">
                  Start Your Free Trial
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-70 mt-6">
              7-day free trial. Cancel anytime.
            </p>
          </motion.div>
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
                Monthly content ideas for hair professionals. Built by stylists, for stylists.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/pricing">
                  <span className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-pricing">
                    Pricing
                  </span>
                </Link>
                <Link href="/salon-pricing">
                  <span className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-salon">
                    Salon Plans
                  </span>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/terms">
                  <span className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-terms">
                    Terms & Conditions
                  </span>
                </Link>
                <Link href="/privacy">
                  <span className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-privacy">
                    Privacy Policy
                  </span>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about">
                  <span className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-about">
                    About
                  </span>
                </Link>
                <Link href="/contact">
                  <span className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-contact">
                    Contact Us
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              2025 Content Calendar for Hair Pros. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/terms"><span className="hover:text-foreground transition-colors cursor-pointer">Terms</span></Link>
              <Link href="/privacy"><span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span></Link>
              <Link href="/contact"><span className="hover:text-foreground transition-colors cursor-pointer">Contact</span></Link>
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
