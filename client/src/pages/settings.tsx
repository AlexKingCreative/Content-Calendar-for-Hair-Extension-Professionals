import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, MapPin, Award, Scissors, User, ChevronRight, 
  Bell, HelpCircle, Info, Shield, LogOut, Flame, Check, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";
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
  showStreaks: boolean | null;
  pushNotificationsEnabled: boolean | null;
  emailReminders: boolean | null;
}

interface User {
  id: string;
  email?: string;
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

function SettingsRow({ 
  icon: Icon, 
  label, 
  onClick,
  rightElement,
  showChevron = true 
}: { 
  icon: typeof Bell;
  label: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 py-3 px-1 hover-elevate active-elevate-2 fluid-transition rounded-lg"
      data-testid={`settings-row-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {rightElement || (showChevron && <ChevronRight className="w-4 h-4 text-muted-foreground" />)}
    </button>
  );
}

function SettingsToggle({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Bell;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-1">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground truncate">{description}</div>
          )}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />
    </div>
  );
}

function SettingsSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-1">
      {title && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [city, setCity] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [voice, setVoice] = useState<VoiceOption>("solo_stylist");
  const [tone, setTone] = useState<ToneOption>("neutral");
  const [postingGoal, setPostingGoal] = useState<PostingGoal>("casual");
  const [showStreaks, setShowStreaks] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);
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

  useEffect(() => {
    if (profile) {
      setCity(profile.city || "");
      setSelectedBrands(profile.certifiedBrands || []);
      setSelectedMethods(profile.extensionMethods || []);
      setVoice((profile.voice as VoiceOption) || "solo_stylist");
      setTone((profile.tone as ToneOption) || "neutral");
      setPostingGoal((profile.postingGoal as PostingGoal) || "casual");
      setShowStreaks(profile.showStreaks ?? true);
      setPushNotifications(profile.pushNotificationsEnabled ?? false);
      setEmailReminders(profile.emailReminders ?? false);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleChange = (key: string, value: boolean) => {
    saveMutation.mutate({ [key]: value });
    if (key === "showStreaks") setShowStreaks(value);
    if (key === "pushNotificationsEnabled") setPushNotifications(value);
    if (key === "emailReminders") setEmailReminders(value);
  };

  const saveAccountSettings = () => {
    saveMutation.mutate({
      city: city || null,
      certifiedBrands: selectedBrands,
      extensionMethods: selectedMethods,
      voice,
      tone,
      postingGoal,
    });
    setShowAccountModal(false);
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

  const handleLogout = () => {
    window.location.href = "/api/logout";
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
    <div className="min-h-screen bg-background pb-24 sm:pb-8">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
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
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <SettingsSection title="Account">
          <SettingsRow 
            icon={User} 
            label="Manage Account" 
            onClick={() => setShowAccountModal(true)}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsToggle
            icon={Flame}
            label="Show Streaks"
            description="Display your posting streak on calendar"
            checked={showStreaks}
            onCheckedChange={(v) => handleToggleChange("showStreaks", v)}
          />
          <Separator className="my-1" />
          <SettingsToggle
            icon={Bell}
            label="Push Notifications"
            description="Get reminders to post"
            checked={pushNotifications}
            onCheckedChange={(v) => handleToggleChange("pushNotificationsEnabled", v)}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow 
            icon={Bell} 
            label="Notifications" 
            onClick={() => setShowNotificationsModal(true)}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow 
            icon={HelpCircle} 
            label="Help & Support" 
            onClick={() => setShowHelpModal(true)}
          />
          <Separator className="my-1" />
          <SettingsRow 
            icon={Info} 
            label="About" 
            onClick={() => setShowAboutModal(true)}
          />
          <Separator className="my-1" />
          <SettingsRow 
            icon={Shield} 
            label="Your Privacy Choices" 
            onClick={() => setShowPrivacyModal(true)}
          />
        </SettingsSection>

        <SettingsSection>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-3 px-1 text-red-500 hover-elevate active-elevate-2 fluid-transition rounded-lg"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </SettingsSection>

        <div className="text-center pt-4 pb-8 space-y-1">
          <p className="text-xs text-muted-foreground">
            Version 1.0.0
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground">
              Logged in as {user.email}
            </p>
          )}
          {user?.username && !user?.email && (
            <p className="text-xs text-muted-foreground">
              Logged in as @{user.username}
            </p>
          )}
        </div>
      </main>

      <MobileNav isLoggedIn={!!user} />

      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Account</DialogTitle>
            <DialogDescription>
              Update your profile and preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
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

            <div className="space-y-3">
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

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certified Brands
              </Label>
              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
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
                  <Button variant="outline" className="w-full justify-start">
                    Add certified brand...
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

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Extension Methods
              </Label>
              <div className="flex flex-wrap gap-2">
                {extensionMethods.map((method) => {
                  const isSelected = selectedMethods.includes(method);
                  return (
                    <Badge
                      key={method}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleMethod(method)}
                      className="cursor-pointer"
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {method}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAccountModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveAccountSettings} disabled={saveMutation.isPending} className="flex-1">
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotificationsModal} onOpenChange={setShowNotificationsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Manage how you receive reminders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <SettingsToggle
              icon={Bell}
              label="Push Notifications"
              description="Receive browser notifications"
              checked={pushNotifications}
              onCheckedChange={(v) => handleToggleChange("pushNotificationsEnabled", v)}
            />
            <Separator />
            <SettingsToggle
              icon={Bell}
              label="Email Reminders"
              description="Get weekly posting summaries"
              checked={emailReminders}
              onCheckedChange={(v) => handleToggleChange("emailReminders", v)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Need help with Hair Calendar? Here are some resources:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Browse 365 days of pre-planned content ideas
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Generate AI-powered captions personalized to your style
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Track your posting streaks and earn badges
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              For additional support, contact us at support@haircalendar.app
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Hair Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Hair Calendar is the ultimate content planning tool for hair extension professionals. 
              Get 365 days of social media post ideas tailored specifically for the hair industry.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2025.1</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Privacy Choices</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              We respect your privacy. Here's how we handle your data:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5" />
                <span>Your profile data is only used to personalize your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5" />
                <span>We never share your information with third parties</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5" />
                <span>You can delete your account and data at any time</span>
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
