import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, MapPin, Award, Scissors, ChevronRight, ChevronLeft, Check, X, Briefcase, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OptionsData {
  certifiedBrands: string[];
  extensionMethods: string[];
  serviceCategories: string[];
}

interface User {
  id: string;
  email: string;
}

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [offeredServices, setOfferedServices] = useState<string[]>([]);
  const [postingServices, setPostingServices] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (user) {
      setStep(2);
    }
  }, [user]);

  const { data: options, isLoading: optionsLoading } = useQuery<OptionsData>({
    queryKey: ["/api/options"],
  });

  const serviceCategories = options?.serviceCategories ?? [];
  const certifiedBrands = options?.certifiedBrands ?? [];
  const extensionMethods = options?.extensionMethods ?? [];
  const optionsReady = !optionsLoading && options;

  const showExtensionSteps = offeredServices.includes("Extension Services") || 
                             offeredServices.includes("Topper Services") || 
                             offeredServices.includes("Wig Services");

  const isLoggedIn = !!user;
  const baseSteps = showExtensionSteps ? 5 : 3;
  const totalSteps = isLoggedIn ? baseSteps : baseSteps + 1;

  useEffect(() => {
    const pending = localStorage.getItem("pendingOnboarding");
    if (pending) {
      try {
        const data = JSON.parse(pending);
        if (data.city) setCity(data.city);
        if (data.offeredServices?.length) setOfferedServices(data.offeredServices);
        if (data.postingServices?.length) setPostingServices(data.postingServices);
        if (data.certifiedBrands?.length) setSelectedBrands(data.certifiedBrands);
        if (data.extensionMethods?.length) setSelectedMethods(data.extensionMethods);
        localStorage.removeItem("pendingOnboarding");
      } catch (e) {
        console.error("Failed to parse pending onboarding data");
      }
    }
  }, []);

  const progress = (step / totalSteps) * 100;

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/profile", {
        city: city || null,
        offeredServices,
        postingServices,
        certifiedBrands: selectedBrands,
        extensionMethods: selectedMethods,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/");
    },
  });

  const leadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/leads", {
        email,
        city: city || null,
        offeredServices,
        postingServices,
        certifiedBrands: selectedBrands,
        extensionMethods: selectedMethods,
      });
    },
    onSuccess: () => {
      toast({
        title: "You're all set!",
        description: "Check your email for next steps to start your free trial.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Something went wrong",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleService = (service: string, list: string[], setList: (val: string[]) => void) => {
    setList(list.includes(service) ? list.filter((s) => s !== service) : [...list, service]);
  };

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

  const filteredBrands = certifiedBrands.filter(
    (brand) =>
      brand.toLowerCase().includes(brandSearch.toLowerCase()) &&
      !selectedBrands.includes(brand)
  );

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      const servicesStep = isLoggedIn ? 2 : 3;
      if (step === servicesStep) {
        const validPostingServices = postingServices.filter(s => offeredServices.includes(s));
        setPostingServices(validPostingServices);
      }
      setStep(step + 1);
    } else {
      if (isLoggedIn) {
        saveMutation.mutate();
      } else {
        leadMutation.mutate();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    if (isLoggedIn) {
      saveMutation.mutate();
    } else if (email) {
      leadMutation.mutate();
    } else {
      setLocation("/");
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "Cutting Services":
        return <Scissors className="w-4 h-4" />;
      case "Coloring Services":
        return <Sparkles className="w-4 h-4" />;
      case "Extension Services":
        return <Award className="w-4 h-4" />;
      case "Topper Services":
        return <Award className="w-4 h-4" />;
      case "Wig Services":
        return <Award className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-heading text-2xl">Personalize Your Experience</CardTitle>
          <CardDescription>
            Help us customize your content and hashtag recommendations
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of {totalSteps}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && !isLoggedIn && (
            <div className="space-y-4" data-testid="step-email">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Get Started</h3>
              </div>
              <p className="text-muted-foreground">
                Enter your email to personalize your content calendar experience.
              </p>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground text-center">
                Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a>
              </p>
            </div>
          )}

          {((step === 1 && isLoggedIn) || step === 2) && (
            <div className="space-y-4" data-testid="step-location">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Your Location</h3>
              </div>
              <p className="text-muted-foreground">
                Enter your city to get location-based hashtags like #YourCityHairPro
              </p>
              <Input
                placeholder="e.g., Los Angeles, New York, Miami"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="input-city"
              />
            </div>
          )}

          {((step === 2 && isLoggedIn) || step === 3) && (
            <div className="space-y-4" data-testid="step-services-offered">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Services You Offer</h3>
              </div>
              <p className="text-muted-foreground">
                Select all the services you offer at your salon
              </p>
              <div className="flex flex-wrap gap-2">
                {optionsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading services...</p>
                ) : serviceCategories.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No services available</p>
                ) : (
                  serviceCategories.map((service) => (
                    <Badge
                      key={service}
                      variant={offeredServices.includes(service) ? "default" : "outline"}
                      className="cursor-pointer py-2 px-3 gap-1"
                      onClick={() => toggleService(service, offeredServices, setOfferedServices)}
                      data-testid={`badge-service-${service.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {offeredServices.includes(service) && <Check className="w-3 h-3" />}
                      {getServiceIcon(service)}
                      {service}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}

          {((step === 3 && isLoggedIn) || step === 4) && (
            <div className="space-y-4" data-testid="step-services-posting">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Services to Post About</h3>
              </div>
              <p className="text-muted-foreground">
                Choose which services you want to attract clients for through your content
              </p>
              
              <div className="flex flex-wrap gap-2">
                {offeredServices.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Please select services you offer first</p>
                ) : (
                  offeredServices.map((service) => (
                    <Badge
                      key={service}
                      variant={postingServices.includes(service) ? "default" : "outline"}
                      className="cursor-pointer py-2 px-3 gap-1"
                      onClick={() => toggleService(service, postingServices, setPostingServices)}
                      data-testid={`badge-posting-${service.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {postingServices.includes(service) && <Check className="w-3 h-3" />}
                      {getServiceIcon(service)}
                      {service}
                    </Badge>
                  ))
                )}
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-md border border-border/50">
                <p className="text-sm text-muted-foreground italic text-center">
                  "What you post about, you will bring about!"
                </p>
                <p className="text-xs text-muted-foreground/70 text-center mt-1">
                  — Ashley Diana, Hair Extension Business Coach
                </p>
              </div>
            </div>
          )}

          {((step === 4 && isLoggedIn) || step === 5) && showExtensionSteps && (
            <div className="space-y-4" data-testid="step-brands">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Certified Brands</h3>
              </div>
              <p className="text-muted-foreground">
                Search and select the hair extension brands you're certified in
              </p>
              
              <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={brandPopoverOpen}
                    className="w-full justify-start text-muted-foreground"
                    disabled={optionsLoading}
                    data-testid="button-add-brand"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {optionsLoading ? "Loading brands..." : "Search brands to add..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Type to search brands..."
                      value={brandSearch}
                      onValueChange={setBrandSearch}
                      data-testid="input-brand-search"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {brandSearch.length > 0 && (
                          <div
                            className="p-2 cursor-pointer hover:bg-accent rounded-sm"
                            onClick={() => addBrand(brandSearch)}
                            data-testid="button-add-custom-brand"
                          >
                            Add "{brandSearch}" as custom brand
                          </div>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredBrands.map((brand) => (
                          <CommandItem
                            key={brand}
                            value={brand}
                            onSelect={() => addBrand(brand)}
                            data-testid={`option-brand-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {brand}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedBrands.map((brand) => (
                    <Badge
                      key={brand}
                      variant="default"
                      className="py-1.5 px-3 gap-1"
                      data-testid={`badge-selected-brand-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {brand}
                      <button
                        onClick={() => removeBrand(brand)}
                        className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                        data-testid={`button-remove-brand-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {((step === 5 && isLoggedIn) || step === 6) && showExtensionSteps && (
            <div className="space-y-4" data-testid="step-methods">
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Extension Methods</h3>
              </div>
              <p className="text-muted-foreground">
                Select the extension methods you specialize in
              </p>
              <div className="flex flex-wrap gap-2">
                {optionsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading methods...</p>
                ) : extensionMethods.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No methods available</p>
                ) : (
                  extensionMethods.map((method) => (
                    <Badge
                      key={method}
                      variant={selectedMethods.includes(method) ? "default" : "outline"}
                      className="cursor-pointer py-2 px-3"
                      onClick={() => toggleMethod(method)}
                      data-testid={`badge-method-${method.toLowerCase().replace(/[\s\-]+/g, "-")}`}
                    >
                      {selectedMethods.includes(method) && <Check className="w-3 h-3 mr-1" />}
                      {method}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {(isLoggedIn && step > 1) || (!isLoggedIn && step > 1) ? (
                <Button variant="ghost" onClick={handleBack} data-testid="button-back">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip} data-testid="button-skip">
                  Skip for now
                </Button>
              )}
            </div>
            <Button 
              onClick={handleNext} 
              disabled={
                saveMutation.isPending || 
                leadMutation.isPending ||
                (step === 1 && !isLoggedIn && !email) ||
                (((step === 2 && isLoggedIn) || step === 3) && offeredServices.length === 0)
              } 
              data-testid="button-next"
            >
              {(saveMutation.isPending || leadMutation.isPending) ? (
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
    </div>
  );
}
