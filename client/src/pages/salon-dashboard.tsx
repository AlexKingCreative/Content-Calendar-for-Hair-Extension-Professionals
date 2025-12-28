import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Flame, Mail, Plus, Loader2, Copy, Check, Trash2, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
}

interface SalonMember {
  id: number;
  email: string;
  invitationStatus: string;
  invitationToken: string;
  stylistUserId?: string;
  currentStreak?: number;
  totalPosts?: number;
  createdAt: string;
}

interface Salon {
  id: number;
  name: string;
  instagramHandle?: string;
  seatTier: string;
  seatLimit: number;
  seatCount: number;
  members: SalonMember[];
  membersWithStreaks: SalonMember[];
}

export default function SalonDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: salon, isLoading } = useQuery<Salon>({
    queryKey: ["/api/salons/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", `/api/salons/${salon?.id}/invitations`, { email });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/salons/me"] });
      toast({ title: "Invitation sent!", description: "Your stylist will receive access once they sign up." });
      setShowInviteDialog(false);
      setInviteEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to invite",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiRequest("DELETE", `/api/salons/${salon?.id}/members/${memberId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/salons/me"] });
      toast({ title: "Access revoked" });
    },
    onError: () => {
      toast({ title: "Failed to revoke access", variant: "destructive" });
    },
  });

  const handleCopyInviteLink = async (token: string) => {
    const url = `${window.location.origin}/join-salon/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast({ title: "Link copied!", description: "Share this with your stylist." });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="font-heading font-semibold text-lg">Salon Dashboard</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">Please sign in to access your salon.</p>
        </main>
        <MobileNav isLoggedIn={false} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/account")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Salon Dashboard</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <MobileNav isLoggedIn={!!user} />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/account")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Salon Dashboard</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 text-center">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-heading text-lg font-medium text-foreground mb-2">
            No Salon Found
          </h3>
          <p className="text-muted-foreground mb-6">
            Start a salon plan to manage your team.
          </p>
          <Button onClick={() => setLocation("/salon-pricing")} data-testid="button-start-salon">
            Start Salon Plan
          </Button>
        </main>
        <MobileNav isLoggedIn={!!user} />
      </div>
    );
  }

  const pendingMembers = salon.members.filter(m => m.invitationStatus === "pending");
  const activeMembers = salon.membersWithStreaks || [];
  const seatsRemaining = (salon.seatLimit || 5) - salon.seatCount;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/account")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-heading font-semibold text-lg">{salon.name}</h1>
            <p className="text-xs text-muted-foreground">Salon Dashboard</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-page-enter">
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-heading flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Seats
              </CardTitle>
              <Badge variant="secondary">
                {salon.seatCount}/{salon.seatLimit} used
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {seatsRemaining > 0 
                  ? `${seatsRemaining} seat${seatsRemaining !== 1 ? "s" : ""} available`
                  : "All seats filled"}
              </p>
              <Button
                size="sm"
                onClick={() => setShowInviteDialog(true)}
                disabled={seatsRemaining === 0}
                data-testid="button-invite-stylist"
              >
                <Plus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeMembers.length > 0 && (
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Active Stylists
              </CardTitle>
              <CardDescription>
                Track your team's posting streaks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border bg-background"
                  data-testid={`member-active-${member.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.totalPosts || 0} posts total
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-primary">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold">{member.currentStreak || 0}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeMutation.mutate(member.id)}
                      data-testid={`button-revoke-${member.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pendingMembers.length > 0 && (
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                Stylists who haven't accepted yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border bg-background"
                  data-testid={`member-pending-${member.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyInviteLink(member.invitationToken)}
                      data-testid={`button-copy-link-${member.id}`}
                    >
                      {copiedToken === member.invitationToken ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeMutation.mutate(member.id)}
                      data-testid={`button-revoke-pending-${member.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {salon.members.length === 0 && (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-heading text-base font-medium text-foreground mb-1">
              No Team Members Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invite your stylists to start tracking their posts.
            </p>
            <Button onClick={() => setShowInviteDialog(true)} data-testid="button-invite-first">
              <Plus className="w-4 h-4 mr-2" />
              Invite Your First Stylist
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite Stylist
            </DialogTitle>
            <DialogDescription>
              Enter your stylist's email. They'll get access once they sign up and accept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="stylist@email.com"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              data-testid="input-invite-email"
            />
            <Button
              className="w-full"
              onClick={() => inviteMutation.mutate(inviteEmail)}
              disabled={!inviteEmail.includes("@") || inviteMutation.isPending}
              data-testid="button-send-invite"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send Invitation"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
