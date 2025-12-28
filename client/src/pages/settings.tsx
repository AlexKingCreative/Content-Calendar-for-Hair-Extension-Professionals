import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Award, Scissors, User, Volume2, Save, Check, X, Flame, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { certifiedBrands, extensionMethods, postingGoals, postingGoalDescriptions, type VoiceOption, type ToneOption, type PostingGoal } from "@shared/schema";

interface UserProfile {
  id: number;
  userId: string;
  city: string | null;
  certifiedBrands: string[];
  extensionMethods: string[];
  voice: VoiceOption | null;
  tone: ToneOption | null;
  postingGoal: PostingGoal | null;
  currentStreak: number | null;
  longestStreak: number | null;
  totalPosts: number | null;
  isAdmin: boolean;
  onboardingComplete: boolean;
}

interface User {
  id: string;
  name?: string;
  username?: string;
}

const toneLabels: Record<ToneOption, string> = {
  professional: "Professional",
  neutral: "Neutral",
  informal: "Informal",
};

const toneDescriptions: Record<ToneOption, string> = {
  professional: "Polished, business-like language",
  neutral: "Balanced, approachable tone",
  informal: "Casual, friendly vibes",
};

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [city, setCity] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [voice, setVoice] = useState<VoiceOption>("solo_stylist");
  const [tone, setTone] = useState<ToneOption>("neutral");
  const [postingGoal, setPostingGoal] = useState<PostingGoal>("casual");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setCity(profile.city || "");
      setSelectedBrands(profile.certifiedBrands || []);
      setSelectedMethods(profile.extensionMethods || []);
      setVoice((profile.voice as VoiceOption) || "solo_stylist");
      setTone((profile.tone as ToneOption) || "neutral");
      setPostingGoal((profile.postingGoal as PostingGoal) || "casual");
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const cityChanged = city !== (profile.city || "");
      const brandsChanged = JSON.stringify(selectedBrands) !== JSON.stringify(profile.certifiedBrands || []);
      const methodsChanged = JSON.stringify(selectedMethods) !== JSON.stringify(profile.extensionMethods || []);
      const voiceChanged = voice !== (profile.voice || "solo_stylist");
      const toneChanged = tone !== (profile.tone || "neutral");
      const goalChanged = postingGoal !== (profile.postingGoal || "casual");
      setHasChanges(cityChanged || brandsChanged || methodsChanged || voiceChanged || toneChanged || goalChanged);
    }
  }, [city, selectedBrands, selectedMethods, voice, tone, postingGoal, profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/profile", {
        city: city || null,
        certifiedBrands: selectedBrands,
        extensionMethods: selectedMethods,
        voice,
        tone,
        postingGoal,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/calendar")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Settings</h1>
          </div>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            data-testid="button-save-settings"
          >
            {saveMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Voice & Tone
            </CardTitle>
            <CardDescription>
              Choose how your AI-generated captions should sound
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Business Type</Label>
              <RadioGroup
                value={voice}
                onValueChange={(value) => setVoice(value as VoiceOption)}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="solo_stylist"
                  className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                    voice === "solo_stylist"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
                  }`}
                >
                  <RadioGroupItem value="solo_stylist" id="solo_stylist" />
                  <div>
                    <div className="font-medium">Solo Stylist</div>
                    <div className="text-sm text-muted-foreground">Individual professional</div>
                    <div className="text-xs text-muted-foreground/70 mt-1 italic">"I love creating seamless blends..."</div>
                  </div>
                </Label>
                <Label
                  htmlFor="salon"
                  className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                    voice === "salon"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
                  }`}
                >
                  <RadioGroupItem value="salon" id="salon" />
                  <div>
                    <div className="font-medium">Salon</div>
                    <div className="text-sm text-muted-foreground">Team or business</div>
                    <div className="text-xs text-muted-foreground/70 mt-1 italic">"We love creating seamless blends..."</div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
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
                data-testid="slider-tone"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Professional</span>
                <span>Neutral</span>
                <span>Informal</span>
              </div>
              <p className="text-sm text-muted-foreground">{toneDescriptions[tone]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Posting Goal
            </CardTitle>
            <CardDescription>
              How often do you want to post on social media?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={postingGoal}
              onValueChange={(value) => setPostingGoal(value as PostingGoal)}
              className="space-y-3"
            >
              {postingGoals.map((goal) => {
                const info = postingGoalDescriptions[goal];
                return (
                  <Label
                    key={goal}
                    htmlFor={`goal-${goal}`}
                    className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                      postingGoal === goal
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                  >
                    <RadioGroupItem value={goal} id={`goal-${goal}`} />
                    <div className="flex-1">
                      <div className="font-medium">{info.label}</div>
                      <div className="text-sm text-muted-foreground">{info.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {info.daysPerWeek}x/week
                    </Badge>
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </CardTitle>
            <CardDescription>
              Your city for local hashtags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter your city (e.g., Los Angeles)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-testid="input-city"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certified Brands
            </CardTitle>
            <CardDescription>
              Hair extension brands you're certified in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedBrands.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedBrands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {brand}
                    <button
                      onClick={() => removeBrand(brand)}
                      className="ml-1 p-0.5 rounded-full hover-elevate"
                      data-testid={`button-remove-brand-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-add-brand"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Add certified brand...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search or type custom brand..."
                    value={brandSearch}
                    onValueChange={setBrandSearch}
                    data-testid="input-brand-search"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {brandSearch ? (
                        <button
                          onClick={() => addBrand(brandSearch)}
                          className="w-full p-2 text-left text-sm hover-elevate"
                          data-testid="button-add-custom-brand"
                        >
                          Add "{brandSearch}" as custom brand
                        </button>
                      ) : (
                        "No brands found"
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
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedBrands.includes(brand) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Extension Methods
            </CardTitle>
            <CardDescription>
              Methods you specialize in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {extensionMethods.map((method) => {
                const isSelected = selectedMethods.includes(method);
                return (
                  <Badge
                    key={method}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleMethod(method)}
                    className="cursor-pointer"
                    data-testid={`badge-method-${method.toLowerCase().replace(/[\s/]+/g, "-")}`}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                    {method}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
