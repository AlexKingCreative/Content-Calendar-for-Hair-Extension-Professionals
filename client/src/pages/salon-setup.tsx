import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, Loader2, LogIn } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
}

export default function SalonSetupPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tier = params.get("tier") || "5-seats";
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [salonName, setSalonName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");

  const createSalonMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/salons", {
        name: salonName,
        instagramHandle: instagramHandle.replace("@", ""),
        seatTier: tier,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Salon created!",
        description: "You can now invite your team members.",
      });
      setLocation("/salon-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create salon",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const tierInfo = tier === "10-plus-seats" 
    ? { seats: 10, price: 50, perSeat: 5 }
    : { seats: 5, price: 40, perSeat: 8 };

  if (!userLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/salon-pricing")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Set Up Your Salon</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
          <Building2 className="w-16 h-16 mx-auto text-primary" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Create an Account First
            </h2>
            <p className="text-muted-foreground">
              Sign up or log in to set up your salon and start managing your team.
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setLocation(`/onboarding?returnTo=/salon-setup?tier=${tier}`)}
              data-testid="button-signup-for-salon"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Create Account
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation(`/login?returnTo=/salon-setup?tier=${tier}`)}
              data-testid="button-login-for-salon"
            >
              Already have an account? Log in
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/salon-pricing")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Set Up Your Salon</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-page-enter">
        <div className="text-center animate-fade-in-up stagger-1">
          <Building2 className="w-12 h-12 mx-auto text-primary mb-3" />
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Welcome, Salon Owner!
          </h2>
          <p className="text-muted-foreground text-sm">
            Tell us about your salon to get started.
          </p>
        </div>

        <Card className="animate-fade-in-up stagger-2">
          <CardHeader>
            <CardTitle className="font-heading">Salon Details</CardTitle>
            <CardDescription>
              This information will be shown to your team members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salon-name">Salon Name</Label>
              <Input
                id="salon-name"
                placeholder="e.g., Luxe Hair Studio"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                data-testid="input-salon-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <SiInstagram className="w-4 h-4" />
                Salon Instagram Handle (optional)
              </Label>
              <Input
                id="instagram"
                placeholder="@yoursalon"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                data-testid="input-instagram-handle"
              />
              <p className="text-xs text-muted-foreground">
                Your stylists will be encouraged to tag your salon in their posts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base">Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {tier === "10-plus-seats" ? "Growing Salon" : "Small Team"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Up to {tierInfo.seats} stylists at ${tierInfo.perSeat}/seat
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">${tierInfo.price}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={() => createSalonMutation.mutate()}
          disabled={!salonName.trim() || createSalonMutation.isPending}
          data-testid="button-create-salon"
        >
          {createSalonMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Salon & Continue to Payment"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You'll be redirected to complete payment after setup.
        </p>
      </main>
    </div>
  );
}
