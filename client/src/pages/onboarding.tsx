import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, MapPin, ChevronRight, ChevronLeft, Check, Users, Diamond, Calendar, Star, GraduationCap, Heart, Scissors, Award, Palette, Mail } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import ashleyDianaImg from "@assets/IMG_8599_3_1766974570149.JPG";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TrialOfferModal } from "@/components/trial-offer-modal";
import { experienceLevelDescriptions, contentGoalOptions } from "@shared/schema";

interface User {
  id: string;
  email: string;
}

const SERVICE_CATEGORIES = [
  { 
    id: "extensions", 
    label: "Hair Extensions", 
    description: "Tape-ins, sew-ins, fusion, etc.",
    icon: Sparkles,
  },
  { 
    id: "toppers", 
    label: "Hair Toppers", 
    description: "Coverage for thinning hair",
    icon: Award,
  },
  { 
    id: "wigs", 
    label: "Wigs & Units", 
    description: "Full coverage solutions",
    icon: Heart,
  },
  { 
    id: "coloring", 
    label: "Color Services", 
    description: "Balayage, highlights, color",
    icon: Palette,
  },
  { 
    id: "cutting", 
    label: "Cut & Style", 
    description: "Haircuts and styling",
    icon: Scissors,
  },
];

const EXPERIENCE_LEVELS = Object.entries(experienceLevelDescriptions).map(([id, data]) => ({
  id,
  label: data.label,
  description: data.description,
}));

const CONTENT_GOALS = contentGoalOptions.map(goal => ({
  id: goal.id,
  label: goal.label,
  icon: goal.id === 'clients' ? Users : 
        goal.id === 'premium' ? Diamond : 
        goal.id === 'consistent' ? Calendar : 
        goal.id === 'brand' ? Star : 
        goal.id === 'education' ? GraduationCap : Heart,
}));

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [instagram, setInstagram] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const isLoggedIn = !!user;
  const totalSteps = isLoggedIn ? 4 : 5;

  useEffect(() => {
    if (user) {
      setStep(1);
    }
  }, [user]);

  useEffect(() => {
    const pending = localStorage.getItem("pendingOnboarding");
    if (pending) {
      try {
        const data = JSON.parse(pending);
        if (data.services?.length) setServices(data.services);
        if (data.city) setCity(data.city);
        if (data.instagram) setInstagram(data.instagram);
        if (data.experience) setExperience(data.experience);
        if (data.goals?.length) setGoals(data.goals);
        localStorage.removeItem("pendingOnboarding");
      } catch (e) {
        console.error("Failed to parse pending onboarding data");
      }
    }
  }, []);

  const progress = (step / totalSteps) * 100;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const postingServices = services.map(s => {
        const serviceMap: Record<string, string> = {
          'extensions': 'Extension Services',
          'toppers': 'Topper Services',
          'wigs': 'Wig Services',
          'coloring': 'Coloring Services',
          'cutting': 'Cutting Services',
        };
        return serviceMap[s] || s;
      });
      
      return apiRequest("PUT", "/api/profile", {
        city: city || null,
        instagram: instagram || null,
        experience: experience || null,
        contentGoals: goals,
        offeredServices: postingServices,
        postingServices: postingServices,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setShowTrialModal(true);
    },
  });

  const onboardMutation = useMutation({
    mutationFn: async () => {
      const postingServices = services.map(s => {
        const serviceMap: Record<string, string> = {
          'extensions': 'Extension Services',
          'toppers': 'Topper Services',
          'wigs': 'Wig Services',
          'coloring': 'Coloring Services',
          'cutting': 'Cutting Services',
        };
        return serviceMap[s] || s;
      });
      
      return apiRequest("POST", "/api/auth/onboard", {
        email,
        city: city || null,
        instagram: instagram || null,
        experience: experience || null,
        contentGoals: goals,
        offeredServices: postingServices,
        postingServices: postingServices,
      });
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      
      toast({
        title: "Welcome!",
        description: data.isNewUser 
          ? "Your account is ready! Check your email for your login credentials." 
          : "Welcome back! You're now signed in.",
      });
      setShowTrialModal(true);
    },
    onError: (error: any) => {
      if (error?.existingUser) {
        toast({
          title: "Account already exists",
          description: "Please sign in with your existing account.",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Something went wrong",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const toggleService = (id: string) => {
    setServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const canContinue = () => {
    if (!isLoggedIn && step === 1) {
      return email.includes('@');
    }
    const adjustedStep = isLoggedIn ? step : step - 1;
    switch (adjustedStep) {
      case 1:
        return services.length > 0;
      case 2:
        return city.trim().length > 0;
      case 3:
        return experience !== '';
      case 4:
        return goals.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (isLoggedIn) {
        saveMutation.mutate();
      } else {
        onboardMutation.mutate();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getStepTitle = () => {
    if (!isLoggedIn && step === 1) return "Get Started";
    const adjustedStep = isLoggedIn ? step : step - 1;
    switch (adjustedStep) {
      case 1: return "What services do you offer?";
      case 2: return "Where are you located?";
      case 3: return "How long have you been styling?";
      case 4: return "What are your content goals?";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    if (!isLoggedIn && step === 1) return "Enter your email to personalize your content calendar";
    const adjustedStep = isLoggedIn ? step : step - 1;
    switch (adjustedStep) {
      case 1: return "Select all that apply - we'll personalize your content";
      case 2: return "We'll include location-based hashtags for you";
      case 3: return "This helps us tailor content to your experience level";
      case 4: return "Choose what you want to achieve with your posts";
      default: return "";
    }
  };

  const renderStep = () => {
    if (!isLoggedIn && step === 1) {
      return (
        <div className="space-y-4" data-testid="step-email">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-lg">Your Email</h3>
          </div>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-email"
            className="text-base"
          />
          <p className="text-xs text-muted-foreground text-center">
            Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a>
          </p>
        </div>
      );
    }

    const adjustedStep = isLoggedIn ? step : step - 1;

    switch (adjustedStep) {
      case 1:
        return (
          <div className="space-y-4" data-testid="step-services">
            <div className="grid gap-3">
              {SERVICE_CATEGORIES.map((service) => {
                const Icon = service.icon;
                const isSelected = services.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`relative flex items-center gap-4 p-4 rounded-md border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover-elevate'
                    }`}
                    data-testid={`button-service-${service.id}`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                        {service.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6" data-testid="step-location">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <label className="text-sm font-medium">City, State</label>
              </div>
              <Input
                placeholder="e.g., Miami, FL"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="input-city"
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SiInstagram className="w-5 h-5 text-primary" />
                <label className="text-sm font-medium">Instagram Handle (optional)</label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  placeholder="yourusername"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                  data-testid="input-instagram"
                  className="pl-8 text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Connect later to track your posts and growth
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4" data-testid="step-experience">
            <div className="grid gap-3">
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = experience === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={`flex items-center justify-between p-4 rounded-md border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover-elevate'
                    }`}
                    data-testid={`button-experience-${level.id}`}
                  >
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                        {level.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4" data-testid="step-goals">
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 text-center transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover-elevate'
                    }`}
                    data-testid={`button-goal-${goal.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {goal.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-md border border-border/50">
              <div className="flex items-center gap-3 justify-center">
                <img 
                  src={ashleyDianaImg} 
                  alt="Ashley Diana" 
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-muted-foreground italic">
                    "What you post about, you will bring about!"
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    — Ashley Diana, Hair Extension Business Coach
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-heading text-2xl">{getStepTitle()}</CardTitle>
          <CardDescription>
            {getStepSubtitle()}
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of {totalSteps}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-4">
            <div>
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack} data-testid="button-back">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <Button 
              onClick={handleNext} 
              disabled={!canContinue() || saveMutation.isPending || onboardMutation.isPending} 
              data-testid="button-next"
            >
              {(saveMutation.isPending || onboardMutation.isPending) ? (
                "Saving..."
              ) : step === totalSteps ? (
                <>
                  Get Started
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <TrialOfferModal
        open={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onSkip={() => setShowTrialModal(false)}
      />
    </div>
  );
}
