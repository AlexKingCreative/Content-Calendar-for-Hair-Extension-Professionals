import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, MapPin, Award, Scissors, Check, X, Crown, CreditCard, ExternalLink, Briefcase, Megaphone, Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { postingGoals, postingGoalDescriptions, serviceCategories, type VoiceOption, type ToneOption, type PostingGoal, type ServiceCategory } from "@shared/schema";

interface OptionsData {
  certifiedBrands: string[];
  extensionMethods: string[];
}

interface AccessStatus {
  hasAccess: boolean;
  accessibleMonths: number[];
  subscriptionStatus?: string;
  freeAccessEndsAt?: string;
}

interface UserProfile {
  id: number;
  userId: string;
  city: string | null;
  certifiedBrands: string[];
  extensionMethods: string[];
  offeredServices: string[];
  postingServices: string[];
  voice: VoiceOption | null;
  tone: ToneOption | null;
  postingGoal: PostingGoal | null;
  salonId?: number;
  salonRole?: string;
}

interface User {
  id: string;
  email?: string;
}

const toneLabels: Record<ToneOption, string> = {
  professional: "Professional",
  neutral: "Neutral",
  informal: "Informal",
};

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [city, setCity] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [offeredServices, setOfferedServices] = useState<string[]>([]);
  const [postingServices, setPostingServices] = useState<string[]>([]);
  const [voice, setVoice] = useState<VoiceOption>("solo_stylist");
  const [tone, setTone] = useState<ToneOption>("neutral");
  const [postingGoal, setPostingGoal] = useState<PostingGoal>("casual");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: accessStatus } = useQuery<AccessStatus | null>({
    queryKey: ["/api/billing/access-status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: options, isLoading: optionsLoading } = useQuery<OptionsData>({
    queryKey: ["/api/options"],
  });

  const certifiedBrands = options?.certifiedBrands ?? [];
  const extensionMethods = options?.extensionMethods ?? [];

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/billing/portal", {});
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not open billing portal.",
        variant: "destructive",
      });
    },
  });

  const searchParams = new URLSearchParams(window.location.search);
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Subscription activated!",
        description: "You now have full access to all content.",
      });
      window.history.replaceState({}, "", "/account");
    }
  }, [isSuccess, toast]);

  useEffect(() => {
    if (profile) {
      setCity(profile.city || "");
      setSelectedBrands(profile.certifiedBrands || []);
      setSelectedMethods(profile.extensionMethods || []);
      setOfferedServices(profile.offeredServices || []);
      setPostingServices(profile.postingServices || []);
      setVoice((profile.voice as VoiceOption) || "solo_stylist");
      setTone((profile.tone as ToneOption) || "neutral");
      setPostingGoal((profile.postingGoal as PostingGoal) || "casual");
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Account updated",
        description: "Your preferences have been saved.",
      });
      setLocation("/settings");
    },
    onError: () => {
      toast({
        title: "Error saving",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      city: city || null,
      certifiedBrands: selectedBrands,
      extensionMethods: selectedMethods,
      offeredServices,
      postingServices,
      voice,
      tone,
      postingGoal,
    });
  };

  const toggleOfferedService = (service: string) => {
    setOfferedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
    if (postingServices.includes(service) && offeredServices.includes(service)) {
      setPostingServices((prev) => prev.filter((s) => s !== service));
    }
  };

  const togglePostingService = (service: string) => {
    if (!offeredServices.includes(service)) return;
    setPostingServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
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

  const getToneSliderValue = (): number[] => {
    switch (tone) {
      case "professional": return [0];
      case "neutral": return [50];
      case "informal": return [100];
      default: return [50];
    }
  };

  const handleToneSliderChange = (value: number[]) => {
    const val = value[0];
    if (val <= 33) {
      setTone("professional");
    } else if (val <= 66) {
      setTone("neutral");
    } else {
      setTone("informal");
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Account</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            size="sm"
            data-testid="button-save-account"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Business Type</Label>
            <RadioGroup
              value={voice}
              onValueChange={(value) => setVoice(value as VoiceOption)}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="solo_stylist"
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer fluid-transition ${
                  voice === "solo_stylist"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
              >
                <RadioGroupItem value="solo_stylist" id="solo_stylist" />
                <div>
                  <div className="font-medium text-sm">Solo Stylist</div>
                  <div className="text-xs text-muted-foreground">Uses "I"</div>
                </div>
              </Label>
              <Label
                htmlFor="salon"
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer fluid-transition ${
                  voice === "salon"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
              >
                <RadioGroupItem value="salon" id="salon" />
                <div>
                  <div className="font-medium text-sm">Salon</div>
                  <div className="text-xs text-muted-foreground">Uses "We"</div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tone</Label>
              <Badge variant="secondary" className="text-xs">
                {toneLabels[tone]}
              </Badge>
            </div>
            <Slider
              value={getToneSliderValue()}
              onValueChange={handleToneSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Professional</span>
              <span>Neutral</span>
              <span>Informal</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <Label className="text-sm font-medium">Posting Goal</Label>
          <RadioGroup
            value={postingGoal}
            onValueChange={(value) => setPostingGoal(value as PostingGoal)}
            className="space-y-2"
          >
            {postingGoals.map((goal) => {
              const info = postingGoalDescriptions[goal];
              return (
                <Label
                  key={goal}
                  htmlFor={`goal-${goal}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer fluid-transition ${
                    postingGoal === goal
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
                  }`}
                >
                  <RadioGroupItem value={goal} id={`goal-${goal}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{info.label}</div>
                    <div className="text-xs text-muted-foreground">{info.description}</div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Services You Offer
          </Label>
          <p className="text-xs text-muted-foreground">
            Select all the hair services you provide to clients.
          </p>
          <div className="flex flex-wrap gap-2">
            {serviceCategories.map((service) => {
              const isSelected = offeredServices.includes(service);
              return (
                <Badge
                  key={service}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggleOfferedService(service)}
                  className="cursor-pointer"
                  data-testid={`badge-offered-${service.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {isSelected && <Check className="w-3 h-3 mr-1" />}
                  {service}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Services to Post About
          </Label>
          <p className="text-xs text-muted-foreground">
            What you post about, you will bring about! Select services you want to attract more clients for.
          </p>
          <div className="flex flex-wrap gap-2">
            {serviceCategories.map((service) => {
              const isOffered = offeredServices.includes(service);
              const isPosting = postingServices.includes(service);
              return (
                <Badge
                  key={service}
                  variant={isPosting ? "default" : "outline"}
                  onClick={() => togglePostingService(service)}
                  className={`cursor-pointer ${!isOffered ? "opacity-40 cursor-not-allowed" : ""}`}
                  data-testid={`badge-posting-${service.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {isPosting && <Check className="w-3 h-3 mr-1" />}
                  {service}
                </Badge>
              );
            })}
          </div>
          {offeredServices.length > 0 && postingServices.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Select at least one service to see relevant content.
            </p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              placeholder="Enter your city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-testid="input-city"
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certified Brands
          </Label>
          {selectedBrands.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="gap-1 pr-1">
                  {brand}
                  <button onClick={() => removeBrand(brand)} className="ml-1 p-0.5 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start" disabled={optionsLoading}>
                {optionsLoading ? "Loading brands..." : "Add certified brand..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[280px]" align="start">
              <Command>
                <CommandInput
                  placeholder="Search or add custom..."
                  value={brandSearch}
                  onValueChange={setBrandSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {brandSearch ? (
                      <button
                        onClick={() => addBrand(brandSearch)}
                        className="w-full p-2 text-left text-sm hover-elevate"
                      >
                        Add "{brandSearch}"
                      </button>
                    ) : (
                      "No brands found"
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredBrands.map((brand) => (
                      <CommandItem key={brand} value={brand} onSelect={() => addBrand(brand)}>
                        <Check className={`mr-2 h-4 w-4 ${selectedBrands.includes(brand) ? "opacity-100" : "opacity-0"}`} />
                        {brand}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            Extension Methods
          </Label>
          <div className="flex flex-wrap gap-2">
            {optionsLoading ? (
              <p className="text-muted-foreground text-sm">Loading methods...</p>
            ) : extensionMethods.length === 0 ? (
              <p className="text-muted-foreground text-sm">No methods available</p>
            ) : (
              extensionMethods.map((method) => {
                const isSelected = selectedMethods.includes(method);
                return (
                  <Badge
                    key={method}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleMethod(method)}
                    className="cursor-pointer"
                    data-testid={`badge-method-${method.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                    {method}
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription
          </Label>
          
          {accessStatus?.subscriptionStatus === "active" || accessStatus?.subscriptionStatus === "trialing" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">
                  <Crown className="w-3 h-3 mr-1" />
                  {accessStatus.subscriptionStatus === "trialing" ? "Trial Active" : "Pro Member"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You have full access to all 12 months of content.
              </p>
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                data-testid="button-manage-billing"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {portalMutation.isPending ? "Loading..." : "Manage Billing"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {accessStatus?.subscriptionStatus === "free" ? "Free Trial" : "No Subscription"}
                </Badge>
              </div>
              {accessStatus?.freeAccessEndsAt && (
                <p className="text-sm text-muted-foreground">
                  Free access ends {new Date(accessStatus.freeAccessEndsAt).toLocaleDateString()}
                </p>
              )}
              <Button
                onClick={() => setLocation("/subscribe")}
                data-testid="button-upgrade"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Salon Owner?
          </Label>
          <p className="text-sm text-muted-foreground mt-2 mb-3">
            Get your entire team posting consistently with our salon plan.
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation(profile?.salonRole === "owner" ? "/salon-dashboard" : "/salon-pricing")}
            data-testid="button-salon-plan"
          >
            {profile?.salonRole === "owner" ? "Manage Your Salon" : "Learn About Salon Plans"}
          </Button>
        </div>
      </main>
    </div>
  );
}
