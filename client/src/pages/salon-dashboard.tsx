import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Flame, Mail, Plus, Loader2, Copy, Check, Trash2, Clock, Building2, Trophy, Gift, Target, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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

interface SalonChallenge {
  id: number;
  salonId: number;
  title: string;
  description?: string;
  durationDays: number;
  rewardText: string;
  status: string;
  createdAt: string;
}

interface StylistProgress {
  id: number;
  salonChallengeId: number;
  stylistUserId: string;
  targetDays: number;
  completedDays: number;
  currentStreak: number;
  status: string;
  completedAt?: string;
  stylistName: string;
  email: string;
}

export default function SalonDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("team");
  
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    durationDays: "7",
    rewardText: ""
  });
  const [selectedChallenge, setSelectedChallenge] = useState<SalonChallenge | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: salon, isLoading } = useQuery<Salon>({
    queryKey: ["/api/salons/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: challenges = [] } = useQuery<SalonChallenge[]>({
    queryKey: ["/api/salon/challenges"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!salon,
  });

  const { data: challengeProgress = [] } = useQuery<StylistProgress[]>({
    queryKey: ["/api/salon/challenges", selectedChallenge?.id, "progress"],
    queryFn: () => fetch(`/api/salon/challenges/${selectedChallenge?.id}/progress`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedChallenge,
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

  const createChallengeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/salon/challenges", {
        title: newChallenge.title,
        description: newChallenge.description || null,
        durationDays: parseInt(newChallenge.durationDays),
        rewardText: newChallenge.rewardText
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/salon/challenges"] });
      toast({ title: "Challenge created!", description: "Your team has been assigned this challenge." });
      setShowCreateChallenge(false);
      setNewChallenge({ title: "", description: "", durationDays: "7", rewardText: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create challenge",
        description: error?.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/salon/challenges/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/salon/challenges"] });
      toast({ title: "Challenge deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete challenge", variant: "destructive" });
    }
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team" data-testid="tab-team">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="challenges" data-testid="tab-challenges">
              <Trophy className="w-4 h-4 mr-2" />
              Challenges
              {challenges.filter(c => c.status === "active").length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {challenges.filter(c => c.status === "active").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="animate-fade-in-up">
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
              <Card className="animate-fade-in-up">
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
              <Card className="animate-fade-in-up">
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
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading font-medium">Posting Challenges</h3>
              <Button size="sm" onClick={() => setShowCreateChallenge(true)} data-testid="button-create-challenge">
                <Plus className="w-4 h-4 mr-1" />
                New Challenge
              </Button>
            </div>

            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-heading text-base font-medium text-foreground mb-1">
                  No Challenges Yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create posting challenges with rewards to motivate your team.
                </p>
                <Button onClick={() => setShowCreateChallenge(true)} data-testid="button-create-first-challenge">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Challenge
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map((challenge) => (
                  <Card 
                    key={challenge.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setShowProgressDialog(true);
                    }}
                    data-testid={`challenge-card-${challenge.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                              {challenge.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {challenge.durationDays} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              {challenge.rewardText}
                            </span>
                          </div>
                          {challenge.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {challenge.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this challenge?")) {
                                deleteChallengeMutation.mutate(challenge.id);
                              }
                            }}
                            data-testid={`button-delete-challenge-${challenge.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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

      <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Create Challenge
            </DialogTitle>
            <DialogDescription>
              Set up a posting challenge with a reward for your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Challenge Title</label>
              <Input
                placeholder="7-Day Posting Streak"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-challenge-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (optional)</label>
              <Textarea
                placeholder="Post every day for 7 days straight..."
                value={newChallenge.description}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
                data-testid="input-challenge-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <Select
                value={newChallenge.durationDays}
                onValueChange={(value) => setNewChallenge(prev => ({ ...prev, durationDays: value }))}
              >
                <SelectTrigger data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Reward</label>
              <Input
                placeholder="Free lunch, $50 bonus, extra PTO..."
                value={newChallenge.rewardText}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, rewardText: e.target.value }))}
                data-testid="input-challenge-reward"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => createChallengeMutation.mutate()}
              disabled={!newChallenge.title || !newChallenge.rewardText || createChallengeMutation.isPending}
              data-testid="button-submit-challenge"
            >
              {createChallengeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Challenge"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {selectedChallenge?.title}
            </DialogTitle>
            <DialogDescription>
              Track your team's progress on this challenge.
            </DialogDescription>
          </DialogHeader>
          {selectedChallenge && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 flex-wrap">
                <div className="flex items-center gap-1 text-sm">
                  <Target className="w-4 h-4" />
                  {selectedChallenge.durationDays} days
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Gift className="w-4 h-4" />
                  {selectedChallenge.rewardText}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Team Progress</h4>
                {challengeProgress.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No stylists assigned to this challenge yet.
                  </p>
                ) : (
                  challengeProgress.map((progress) => (
                    <div
                      key={progress.id}
                      className="p-3 rounded-md border bg-background"
                      data-testid={`progress-${progress.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{progress.stylistName}</p>
                          <p className="text-xs text-muted-foreground truncate">{progress.email}</p>
                        </div>
                        <Badge variant={progress.status === "completed" ? "default" : "secondary"}>
                          {progress.status === "completed" ? "Completed" : `${progress.completedDays}/${progress.targetDays}`}
                        </Badge>
                      </div>
                      <Progress 
                        value={(progress.completedDays / progress.targetDays) * 100} 
                        className="h-2"
                      />
                      {progress.status === "completed" && progress.completedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed on {new Date(progress.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
