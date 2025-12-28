import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar, 
  Sparkles, 
  LogIn,
  Gift,
  ArrowRight,
  Check,
  MapPin,
  Award,
  Scissors,
  ChevronRight,
  X,
  PartyPopper,
  Heart,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingAnimation } from "@/components/LandingAnimation";
import { certifiedBrands, extensionMethods } from "@shared/schema";
import { navigateToLogin } from "@/lib/auth-utils";

type Step = "welcome" | "city" | "city-success" | "brands" | "brands-success" | "methods" | "methods-success" | "signup";

const confettiColors = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#f59e0b", "#10b981"];

function SuccessAnimation({ message, icon: Icon }: { message: string; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 text-white" />
        </div>
        {confettiColors.map((color, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              x: Math.cos((i / confettiColors.length) * Math.PI * 2) * 60,
              y: Math.sin((i / confettiColors.length) * Math.PI * 2) * 60,
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: color, marginLeft: -6, marginTop: -6 }}
          />
        ))}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-heading font-semibold mb-2"
      >
        {message}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-1 text-muted-foreground"
      >
        <Star className="w-4 h-4 text-amber-500" />
        <span className="text-sm">You're doing great!</span>
        <Star className="w-4 h-4 text-amber-500" />
      </motion.div>
    </motion.div>
  );
}

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("welcome");
  const [city, setCity] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);

  const steps: Step[] = ["welcome", "city", "city-success", "brands", "brands-success", "methods", "methods-success", "signup"];
  const currentIndex = steps.indexOf(step);
  const progressSteps = ["city", "brands", "methods", "signup"];
  const progressIndex = progressSteps.indexOf(step.replace("-success", "") as any);
  const progress = step === "welcome" ? 0 : step === "signup" ? 100 : ((progressIndex + 1) / 4) * 100;

  const filteredBrands = certifiedBrands.filter(
    (brand) =>
      brand.toLowerCase().includes(brandSearch.toLowerCase()) &&
      !selectedBrands.includes(brand)
  );

  const addBrand = (brand: string) => {
    if (brand && !selectedBrands.includes(brand)) {
      setSelectedBrands((prev) => [...prev, brand]);
    }
    setBrandSearch("");
    setBrandPopoverOpen(false);
  };

  const removeBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== brand));
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
      
      if (steps[nextIndex].endsWith("-success")) {
        setTimeout(() => {
          setStep(steps[nextIndex + 1]);
        }, 1500);
      }
    }
  };

  const savePreferences = () => {
    localStorage.setItem("pendingOnboarding", JSON.stringify({
      city,
      certifiedBrands: selectedBrands,
      extensionMethods: selectedMethods,
    }));
  };

  const handleSignup = () => {
    savePreferences();
    navigateToLogin();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-amber-50/30 dark:from-rose-950/20 dark:via-background dark:to-amber-950/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {step !== "welcome" && (
        <header className="relative sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-sm">Content Calendar</span>
            </div>
            <Button variant="ghost" size="sm" onClick={navigateToLogin} data-testid="button-signin-header">
              <LogIn className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          </div>
        </header>
      )}

      <div className="relative flex-1 flex flex-col px-6 py-6 max-w-md mx-auto w-full">
        {step !== "welcome" && !step.endsWith("-success") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {step === "signup" ? "Almost there!" : `Step ${progressIndex + 1} of 4`}
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h1 className="font-heading font-bold text-2xl">Content Calendar</h1>
                <p className="text-muted-foreground text-sm">For Hair Extension Professionals</p>
              </div>

              <div className="flex-1 flex items-center justify-center py-2">
                <LandingAnimation />
              </div>

              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="mb-3">
                    <Sparkles className="w-3 h-3 mr-1" />
                    365 Days of Content Ideas
                  </Badge>
                  <h2 className="text-lg font-semibold mb-1">Never run out of Instagram content</h2>
                  <p className="text-muted-foreground text-sm">
                    Pre-planned posts, AI captions, personalized hashtags
                  </p>
                </div>

                <Button size="lg" className="w-full text-base py-6" onClick={() => setStep("city")} data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button variant="outline" size="lg" className="w-full text-base py-6" onClick={navigateToLogin} data-testid="button-sign-in">
                  <LogIn className="w-5 h-5 mr-2" />
                  I Already Have an Account
                </Button>

                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    7-day free trial
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-4">
                <Link href="/terms" className="hover:text-foreground">Terms</Link>
                <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                <Link href="/contact" className="hover:text-foreground">Contact</Link>
              </div>
              
              <div className="text-center pt-2">
                <span className="text-[10px] text-muted-foreground/60">v1.0.4</span>
              </div>
            </motion.div>
          )}

          {step === "city" && (
            <motion.div
              key="city"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-heading font-semibold mb-2">Where are you located?</h2>
                <p className="text-muted-foreground text-sm">
                  We'll create hashtags like #YourCityExtensions
                </p>
              </div>

              <div className="flex-1">
                <Input
                  placeholder="e.g., Los Angeles, Miami, New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-center text-lg py-6"
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-3 pt-6">
                <Button 
                  size="lg" 
                  className="w-full py-6" 
                  onClick={handleNext}
                  data-testid="button-next-city"
                >
                  {city ? "Continue" : "Skip for now"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "city-success" && (
            <SuccessAnimation message={city ? `${city} - Great choice!` : "No problem!"} icon={MapPin} />
          )}

          {step === "brands" && (
            <motion.div
              key="brands"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-heading font-semibold mb-2">Any brand certifications?</h2>
                <p className="text-muted-foreground text-sm">
                  Select brands you're certified with (optional)
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-add-brand">
                      <Award className="w-4 h-4 mr-2" />
                      Search brands...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search brands..." 
                        value={brandSearch}
                        onValueChange={setBrandSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No brands found</CommandEmpty>
                        <CommandGroup>
                          {filteredBrands.map((brand) => (
                            <CommandItem key={brand} onSelect={() => addBrand(brand)}>
                              {brand}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedBrands.map((brand) => (
                      <Badge key={brand} variant="secondary" className="gap-1 pr-1">
                        {brand}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => removeBrand(brand)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6">
                <Button 
                  size="lg" 
                  className="w-full py-6" 
                  onClick={handleNext}
                  data-testid="button-next-brands"
                >
                  {selectedBrands.length > 0 ? "Continue" : "Skip for now"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "brands-success" && (
            <SuccessAnimation 
              message={selectedBrands.length > 0 ? `${selectedBrands.length} certification${selectedBrands.length > 1 ? 's' : ''} added!` : "Moving on!"} 
              icon={Award} 
            />
          )}

          {step === "methods" && (
            <motion.div
              key="methods"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Scissors className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-heading font-semibold mb-2">What methods do you use?</h2>
                <p className="text-muted-foreground text-sm">
                  Select all extension methods you offer
                </p>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-2 gap-2">
                  {extensionMethods.map((method) => (
                    <Button
                      key={method}
                      variant={selectedMethods.includes(method) ? "default" : "outline"}
                      className="justify-start h-auto py-3 px-3"
                      onClick={() => toggleMethod(method)}
                      data-testid={`button-method-${method.toLowerCase().replace(/[^a-z]/g, '-')}`}
                    >
                      {selectedMethods.includes(method) && (
                        <Check className="w-4 h-4 mr-2 shrink-0" />
                      )}
                      <span className="text-sm">{method}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <Button 
                  size="lg" 
                  className="w-full py-6" 
                  onClick={handleNext}
                  data-testid="button-next-methods"
                >
                  {selectedMethods.length > 0 ? "Continue" : "Skip for now"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "methods-success" && (
            <SuccessAnimation 
              message={selectedMethods.length > 0 ? `${selectedMethods.length} method${selectedMethods.length > 1 ? 's' : ''} selected!` : "All set!"} 
              icon={Scissors} 
            />
          )}

          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center mx-auto mb-4"
                >
                  <PartyPopper className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-xl font-heading font-semibold mb-2">You're all set!</h2>
                <p className="text-muted-foreground text-sm">
                  Create your account to unlock 365 days of personalized content
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="bg-card border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-sm">Your personalized profile:</h3>
                  <div className="space-y-2 text-sm">
                    {city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{city}</span>
                      </div>
                    )}
                    {selectedBrands.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{selectedBrands.join(", ")}</span>
                      </div>
                    )}
                    {selectedMethods.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Scissors className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{selectedMethods.join(", ")}</span>
                      </div>
                    )}
                    {!city && selectedBrands.length === 0 && selectedMethods.length === 0 && (
                      <p className="text-muted-foreground">You can customize these later in settings</p>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="font-medium">7-Day Free Trial</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full access to all features. No credit card required.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <Button 
                  size="lg" 
                  className="w-full py-6" 
                  onClick={handleSignup}
                  data-testid="button-create-account"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Create My Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    Cancel anytime
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    $10/month after trial
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
