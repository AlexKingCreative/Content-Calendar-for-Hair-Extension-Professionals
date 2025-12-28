import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Check, Users } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
}

interface InvitationInfo {
  salonName: string;
  salonInstagram?: string;
  email: string;
}

export default function JoinSalonPage() {
  const [, setLocation] = useLocation();
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: invitation, isLoading: invitationLoading, error: invitationError } = useQuery<InvitationInfo>({
    queryKey: ["/api/salon-invitations", token],
    queryFn: async () => {
      const res = await fetch(`/api/salon-invitations/${token}`);
      if (!res.ok) throw new Error("Invalid or expired invitation");
      return res.json();
    },
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/salon-invitations/${token}`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Welcome to the team!",
        description: "You now have full access to the content calendar.",
      });
      setLocation("/today");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join",
        description: error?.message || "Please try again or contact your salon owner.",
        variant: "destructive",
      });
    },
  });

  if (invitationLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <main className="max-w-lg mx-auto px-4 py-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Invalid Invitation
          </h2>
          <p className="text-muted-foreground mb-6">
            This invitation link is invalid or has expired. Please contact your salon owner for a new invitation.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            Go to Home
          </Button>
        </main>
        <MobileNav isLoggedIn={!!user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-lg mx-auto px-4 py-12 space-y-6 animate-page-enter">
        <div className="text-center animate-fade-in-up stagger-1">
          <Building2 className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            You're Invited!
          </h2>
          <p className="text-muted-foreground">
            Join your salon team to access the content calendar.
          </p>
        </div>

        <Card className="animate-fade-in-up stagger-2">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Users className="w-5 h-5" />
              {invitation.salonName}
            </CardTitle>
            {invitation.salonInstagram && (
              <CardDescription className="flex items-center gap-1">
                <SiInstagram className="w-4 h-4" />
                @{invitation.salonInstagram}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your salon owner has invited you to join the team. You'll get:
            </p>
            <ul className="space-y-2">
              {[
                "365 days of post ideas",
                "AI-powered caption generator",
                "Daily posting reminders",
                "Streak tracking with your team",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {!user ? (
          <div className="space-y-3 animate-fade-in-up stagger-3">
            <p className="text-sm text-muted-foreground text-center">
              Sign in to accept your invitation
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={() => setLocation(`/login?redirect=/join-salon/${token}`)}
              data-testid="button-sign-in"
            >
              Sign In to Join
            </Button>
          </div>
        ) : (
          <Button
            className="w-full animate-fade-in-up stagger-3"
            size="lg"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
            data-testid="button-accept-invitation"
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Accept & Join Team
              </>
            )}
          </Button>
        )}
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
