import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, User, ChevronRight, 
  Bell, HelpCircle, Info, Shield, LogOut, Flame, Check, Instagram, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";
import { APP_VERSION } from "@/lib/version";

interface UserProfile {
  id: number;
  userId: string;
  showStreaks: boolean | null;
  pushNotificationsEnabled: boolean | null;
  emailReminders: boolean | null;
}

interface User {
  id: string;
  email?: string;
  username?: string;
}

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

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [showStreaks, setShowStreaks] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);

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
            onClick={() => setLocation("/account")}
          />
          <Separator className="my-1" />
          <SettingsRow 
            icon={Crown} 
            label="Upgrade Plan" 
            onClick={() => setLocation("/subscribe")}
          />
          <Separator className="my-1" />
          <SettingsRow 
            icon={Instagram} 
            label="Instagram Analytics" 
            onClick={() => setLocation("/instagram")}
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
            onClick={() => setLocation("/help")}
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
            Version {APP_VERSION}
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
            <DialogDescription>Resources to help you get started</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Need help with Hair Calendar? Here are some resources:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Browse monthly pre-planned content ideas
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
            <DialogDescription>Version and build information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Hair Calendar is the ultimate content planning tool for hair pros. 
              Get monthly social media post ideas tailored specifically for the hair industry.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{APP_VERSION}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2025.2</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Privacy Choices</DialogTitle>
            <DialogDescription>How we handle your data</DialogDescription>
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
