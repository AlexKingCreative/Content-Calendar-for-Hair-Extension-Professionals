import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, Flame, Star, Trophy, Crown, Gem, Medal, Rocket, Sparkles, Check, Calendar, Target, TrendingUp, Award, Play, X, Heart, Loader2, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MobileNav } from "@/components/MobileNav";
import { navigateToLogin } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { streakMilestones, postingGoalDescriptions, type PostingGoal, type Challenge, type UserChallenge } from "@shared/schema";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: PostingGoal;
  hasPostedToday: boolean;
  hasManualPostToday?: boolean;
  hasInstagramPostToday?: boolean;
  instagramConnected?: boolean;
  recentLogs: string[];
}

interface User {
  id: string;
}

interface UserChallengeWithDetails extends UserChallenge {
  challenge: Challenge | null;
}

const iconMap: Record<string, typeof Flame> = {
  flame: Flame,
  star: Star,
  trophy: Trophy,
  crown: Crown,
  gem: Gem,
  medal: Medal,
  rocket: Rocket,
  sparkles: Sparkles,
  target: Target,
  heart: Heart,
};

function ChallengeIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = iconMap[icon] || Target;
  return <IconComponent className={className} />;
}

function getEarnedBadges(currentStreak: number) {
  return streakMilestones.filter(m => currentStreak >= m.days);
}

function getNextMilestone(currentStreak: number) {
  return streakMilestones.find(m => m.days > currentStreak);
}

export default function StreaksPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [startingChallengeId, setStartingChallengeId] = useState<number | null>(null);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: streak, isLoading } = useQuery<StreakData>({
    queryKey: ["/api/streak"],
    enabled: !!user,
  });

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: userChallenges } = useQuery<UserChallengeWithDetails[]>({
    queryKey: ["/api/user/challenges"],
    enabled: !!user,
  });

  const logPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/streak/log", {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/streak"] });
      toast({ 
        title: "Posted today!", 
        description: streak?.currentStreak 
          ? `You're on a ${(streak.currentStreak || 0) + 1} day streak!` 
          : "You've started a new streak!" 
      });
    },
    onError: () => {
      toast({ 
        title: "Already logged", 
        description: "You've already marked a post for today.",
        variant: "destructive" 
      });
    },
  });

  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      setStartingChallengeId(challengeId);
      return apiRequest("POST", `/api/challenges/${challengeId}/start`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({ title: "Challenge started!", description: "Good luck! You've got this." });
      setStartingChallengeId(null);
    },
    onError: (error: any) => {
      toast({ title: "Couldn't start challenge", description: error?.message || "Please try again.", variant: "destructive" });
      setStartingChallengeId(null);
    },
  });

  const logProgressMutation = useMutation({
    mutationFn: async (userChallengeId: number) => {
      return apiRequest("POST", `/api/user/challenges/${userChallengeId}/progress`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({ title: "Progress logged!", description: "Keep up the great work!" });
    },
    onError: (error: any) => {
      toast({ title: "Couldn't log progress", description: error?.message || "Please try again.", variant: "destructive" });
    },
  });

  const abandonMutation = useMutation({
    mutationFn: async (userChallengeId: number) => {
      return apiRequest("POST", `/api/user/challenges/${userChallengeId}/abandon`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({ title: "Challenge abandoned", description: "You can start again anytime." });
    },
    onError: () => {
      toast({ title: "Couldn't abandon challenge", description: "Please try again.", variant: "destructive" });
    },
  });

  const activeChallenges = userChallenges?.filter(uc => uc.status === "active") || [];
  const completedChallenges = userChallenges?.filter(uc => uc.status === "completed") || [];
  const getUserChallengeForChallenge = (challengeId: number) => userChallenges?.find(uc => uc.challengeId === challengeId && uc.status === "active");
  const getCompletedChallengeForChallenge = (challengeId: number) => userChallenges?.find(uc => uc.challengeId === challengeId && uc.status === "completed");

  const earnedBadges = streak ? getEarnedBadges(streak.currentStreak) : [];
  const nextMilestone = streak ? getNextMilestone(streak.currentStreak) : null;
  const goalInfo = streak ? (postingGoalDescriptions[streak.postingGoal as PostingGoal] || postingGoalDescriptions.casual) : postingGoalDescriptions.casual;

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Streaks</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Flame className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium text-foreground mb-2">
              Sign in to track your streaks
            </h3>
            <p className="text-muted-foreground mb-6">
              Keep track of your posting consistency and earn badges!
            </p>
            <Button onClick={navigateToLogin}>
              Sign In
            </Button>
          </div>
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
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Streaks</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </main>
        <MobileNav isLoggedIn={!!user} />
      </div>
    );
  }

  const progressToNext = nextMilestone 
    ? ((streak?.currentStreak || 0) / nextMilestone.days) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Streaks</h1>
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <Target className="w-3 h-3" />
            {goalInfo.label}
          </Badge>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 animate-page-enter">
        <Tabs defaultValue="streaks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="streaks" data-testid="tab-streaks">
              <Flame className="w-4 h-4 mr-2" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="challenges" data-testid="tab-challenges">
              <Target className="w-4 h-4 mr-2" />
              Challenges
              {activeChallenges.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{activeChallenges.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streaks" className="space-y-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Flame className="w-12 h-12 text-white" />
              </div>
              {streak?.hasPostedToday && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-background">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-foreground" data-testid="text-current-streak">
              {streak?.currentStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>

          {streak?.hasPostedToday ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">You've posted today!</span>
              </div>
              {streak?.hasInstagramPostToday && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Instagram className="w-4 h-4" />
                  <span>Detected from your Instagram</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => logPostMutation.mutate()}
                disabled={logPostMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-log-post"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {logPostMutation.isPending ? "Logging..." : "I Posted Today!"}
              </Button>
              {streak?.instagramConnected && (
                <p className="text-xs text-center text-muted-foreground">
                  Your Instagram posts are tracked automatically
                </p>
              )}
              {!streak?.instagramConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation("/account")}
                  data-testid="button-connect-instagram-cta"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Connect Instagram for auto-tracking
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-2">
          <h3 className="font-heading font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Stats
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground" data-testid="text-current-stat">
                {streak?.currentStreak || 0}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground" data-testid="text-longest-streak">
                {streak?.longestStreak || 0}
              </div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground" data-testid="text-total-posts">
                {streak?.totalPosts || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>

        {nextMilestone && (
          <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-3">
            <h3 className="font-heading font-medium text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Next Milestone
            </h3>
            <div className="flex items-center gap-3 mb-3">
              {(() => {
                const Icon = iconMap[nextMilestone.icon] || Flame;
                return <Icon className="w-8 h-8 text-muted-foreground" />;
              })()}
              <div className="flex-1">
                <div className="font-medium text-foreground">{nextMilestone.badge}</div>
                <div className="text-sm text-muted-foreground">
                  {nextMilestone.days - (streak?.currentStreak || 0)} days to go
                </div>
              </div>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2 text-right">
              {streak?.currentStreak || 0} / {nextMilestone.days} days
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-4">
          <h3 className="font-heading font-medium text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </h3>
          <div className="space-y-3">
            {streakMilestones.map((milestone) => {
              const Icon = iconMap[milestone.icon] || Flame;
              const isEarned = (streak?.currentStreak || 0) >= milestone.days;
              return (
                <div 
                  key={milestone.days}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isEarned ? 'bg-primary/10' : 'bg-muted/30 opacity-50'
                  }`}
                  data-testid={`achievement-${milestone.days}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isEarned 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/40' 
                      : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {milestone.badge}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.days} day streak
                    </div>
                  </div>
                  {isEarned && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {streak?.recentLogs && streak.recentLogs.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            <h3 className="font-heading font-medium text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {streak.recentLogs.slice(0, 7).map((dateStr, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    {format(new Date(dateStr), "EEEE, MMMM d")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            {activeChallenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-medium text-foreground flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Active Challenges
                </h3>
                {activeChallenges.map((uc) => {
                  const challenge = uc.challenge;
                  if (!challenge) return null;
                  const startDate = new Date(uc.startedAt);
                  const daysElapsed = differenceInDays(new Date(), startDate) + 1;
                  const progress = ((uc.postsCompleted || 0) / (challenge.postsRequired || challenge.durationDays)) * 100;
                  const today = new Date().toISOString().split('T')[0];
                  const hasLoggedToday = uc.lastPostDate === today;
                  
                  return (
                    <Card key={uc.id} className="border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ChallengeIcon icon={challenge.icon} className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-heading">{challenge.name}</CardTitle>
                            <CardDescription>Started {format(startDate, "MMM d")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-primary">{uc.postsCompleted || 0}</div>
                            <div className="text-xs text-muted-foreground">Posts</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{daysElapsed}</div>
                            <div className="text-xs text-muted-foreground">Days</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-emerald-600">{uc.currentStreak || 0}</div>
                            <div className="text-xs text-muted-foreground">Streak</div>
                          </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => logProgressMutation.mutate(uc.id)}
                            disabled={hasLoggedToday || logProgressMutation.isPending}
                            data-testid={`button-log-challenge-${uc.id}`}
                          >
                            {logProgressMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : hasLoggedToday ? (
                              <><Check className="w-4 h-4 mr-2" />Done Today</>
                            ) : (
                              <><Check className="w-4 h-4 mr-2" />Log Post</>
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <X className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Abandon challenge?</DialogTitle>
                                <DialogDescription>Your progress will be saved but the challenge will be marked as abandoned.</DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="destructive" onClick={() => abandonMutation.mutate(uc.id)} disabled={abandonMutation.isPending}>
                                  {abandonMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                  Abandon
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-heading font-medium text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                Available Challenges
              </h3>
              {challenges?.map((challenge) => {
                const activeUC = getUserChallengeForChallenge(challenge.id);
                const completedUC = getCompletedChallengeForChallenge(challenge.id);
                const isActive = !!activeUC;
                const isCompleted = !!completedUC;
                
                return (
                  <Card 
                    key={challenge.id} 
                    className={`hover-elevate ${isActive ? "border-primary" : ""} ${isCompleted ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20" : ""}`}
                    data-testid={`card-challenge-${challenge.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? "bg-emerald-100 dark:bg-emerald-900" : "bg-primary/10"}`}>
                            <ChallengeIcon icon={challenge.icon} className={`w-5 h-5 ${isCompleted ? "text-emerald-600" : "text-primary"}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base font-heading">{challenge.name}</CardTitle>
                            <CardDescription>{challenge.durationDays} days</CardDescription>
                          </div>
                        </div>
                        {isActive && <Badge><Play className="w-3 h-3 mr-1" />Active</Badge>}
                        {isCompleted && <Badge className="bg-emerald-600"><Check className="w-3 h-3 mr-1" />Done</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{challenge.description}</p>
                      {!isActive && (
                        <Button 
                          className="w-full" 
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => startChallengeMutation.mutate(challenge.id)}
                          disabled={startingChallengeId === challenge.id}
                          data-testid={`button-start-challenge-${challenge.id}`}
                        >
                          {startingChallengeId === challenge.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {isCompleted ? "Start Again" : "Start Challenge"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {completedChallenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-medium text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Completed
                  <Badge variant="secondary" className="ml-auto">{completedChallenges.length}</Badge>
                </h3>
                {completedChallenges.map((uc) => (
                  <Card key={uc.id} className="bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                          {uc.challenge && <ChallengeIcon icon={uc.challenge.badgeIcon || uc.challenge.icon} className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{uc.challenge?.name}</div>
                          <div className="text-xs text-muted-foreground">{uc.postsCompleted} posts</div>
                        </div>
                        {uc.challenge?.badgeName && (
                          <Badge className="bg-emerald-600 text-xs">
                            <Trophy className="w-3 h-3 mr-1" />
                            {uc.challenge.badgeName}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
