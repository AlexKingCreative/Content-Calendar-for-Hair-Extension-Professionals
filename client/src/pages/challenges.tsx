import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, Flame, Target, Sparkles, Gem, Trophy, Heart, Star, Check, Play, X, Clock, Award, ChevronRight, Loader2 } from "lucide-react";
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
import type { Challenge, UserChallenge } from "@shared/schema";

interface User {
  id: string;
}

interface UserChallengeWithDetails extends UserChallenge {
  challenge: Challenge | null;
}

const iconMap: Record<string, typeof Flame> = {
  flame: Flame,
  target: Target,
  sparkles: Sparkles,
  gem: Gem,
  trophy: Trophy,
  heart: Heart,
  star: Star,
};

function ChallengeIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = iconMap[icon] || Target;
  return <IconComponent className={className} />;
}

function ChallengeCard({ 
  challenge, 
  userChallenge,
  onStart,
  onView,
  isStarting 
}: { 
  challenge: Challenge; 
  userChallenge?: UserChallengeWithDetails;
  onStart: () => void;
  onView: () => void;
  isStarting: boolean;
}) {
  const isActive = userChallenge?.status === "active";
  const isCompleted = userChallenge?.status === "completed";

  return (
    <Card 
      className={`hover-elevate cursor-pointer transition-all ${isActive ? "border-primary" : ""} ${isCompleted ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20" : ""}`}
      onClick={onView}
      data-testid={`card-challenge-${challenge.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? "bg-emerald-100 dark:bg-emerald-900" : "bg-primary/10"}`}>
              <ChallengeIcon icon={challenge.icon} className={`w-5 h-5 ${isCompleted ? "text-emerald-600" : "text-primary"}`} />
            </div>
            <div>
              <CardTitle className="text-base font-heading">{challenge.name}</CardTitle>
              <CardDescription className="text-sm">
                {challenge.durationDays} days · {challenge.postsRequired || challenge.durationDays} posts
              </CardDescription>
            </div>
          </div>
          {isActive && (
            <Badge variant="default" className="shrink-0">
              <Play className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {challenge.description}
        </p>
        
        {isActive && userChallenge && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {userChallenge.postsCompleted}/{challenge.postsRequired || challenge.durationDays}
              </span>
            </div>
            <Progress 
              value={((userChallenge.postsCompleted || 0) / (challenge.postsRequired || challenge.durationDays)) * 100} 
              className="h-2"
            />
          </div>
        )}
        
        {!isActive && !isCompleted && (
          <Button 
            className="w-full mt-2" 
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            disabled={isStarting}
            data-testid={`button-start-challenge-${challenge.id}`}
          >
            {isStarting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Start Challenge
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ActiveChallengeDetail({ 
  userChallenge, 
  onLogProgress,
  onAbandon,
  isLogging,
  isAbandoning
}: { 
  userChallenge: UserChallengeWithDetails;
  onLogProgress: () => void;
  onAbandon: () => void;
  isLogging: boolean;
  isAbandoning: boolean;
}) {
  const challenge = userChallenge.challenge;
  if (!challenge) return null;

  const startDate = new Date(userChallenge.startedAt);
  const daysElapsed = differenceInDays(new Date(), startDate) + 1;
  const progress = ((userChallenge.postsCompleted || 0) / (challenge.postsRequired || challenge.durationDays)) * 100;
  const today = new Date().toISOString().split('T')[0];
  const hasLoggedToday = userChallenge.lastPostDate === today;

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChallengeIcon icon={challenge.icon} className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-heading">{challenge.name}</CardTitle>
            <CardDescription>Started {format(startDate, "MMM d, yyyy")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">{userChallenge.postsCompleted || 0}</div>
            <div className="text-xs text-muted-foreground">Posts Made</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{daysElapsed}</div>
            <div className="text-xs text-muted-foreground">Days In</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-emerald-600">{userChallenge.currentStreak || 0}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            size="lg"
            onClick={onLogProgress}
            disabled={hasLoggedToday || isLogging}
            data-testid="button-log-challenge-progress"
          >
            {isLogging ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : hasLoggedToday ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Posted Today
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Log Today's Post
              </>
            )}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-abandon-challenge">
                <X className="w-4 h-4 mr-2" />
                Abandon Challenge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abandon this challenge?</DialogTitle>
                <DialogDescription>
                  Your progress will be saved but the challenge will be marked as abandoned. You can always start it again later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={(e) => e.stopPropagation()}>Cancel</Button>
                <Button variant="destructive" onClick={onAbandon} disabled={isAbandoning}>
                  {isAbandoning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Abandon
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {(challenge.rules?.length || 0) > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Challenge Rules</h4>
            <ul className="space-y-1">
              {challenge.rules?.map((rule, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(challenge.tips?.length || 0) > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Tips for Success</h4>
            <ul className="space-y-1">
              {challenge.tips?.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChallengesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [startingChallengeId, setStartingChallengeId] = useState<number | null>(null);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: userChallenges, isLoading: userChallengesLoading } = useQuery<UserChallengeWithDetails[]>({
    queryKey: ["/api/user/challenges"],
    enabled: !!user,
  });

  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      setStartingChallengeId(challengeId);
      return apiRequest("POST", `/api/challenges/${challengeId}/start`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({ 
        title: "Challenge started!", 
        description: "Good luck! You've got this." 
      });
      setStartingChallengeId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Couldn't start challenge", 
        description: error?.message || "Please try again.",
        variant: "destructive" 
      });
      setStartingChallengeId(null);
    },
  });

  const logProgressMutation = useMutation({
    mutationFn: async (userChallengeId: number) => {
      return apiRequest("POST", `/api/user/challenges/${userChallengeId}/progress`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({ 
        title: "Progress logged!", 
        description: "Keep up the great work!" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Couldn't log progress", 
        description: error?.message || "Please try again.",
        variant: "destructive" 
      });
    },
  });

  const abandonMutation = useMutation({
    mutationFn: async (userChallengeId: number) => {
      return apiRequest("POST", `/api/user/challenges/${userChallengeId}/abandon`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({ 
        title: "Challenge abandoned", 
        description: "You can start again anytime." 
      });
    },
    onError: () => {
      toast({ 
        title: "Couldn't abandon challenge", 
        description: "Please try again.",
        variant: "destructive" 
      });
    },
  });

  const activeChallenges = userChallenges?.filter(uc => uc.status === "active") || [];
  const completedChallenges = userChallenges?.filter(uc => uc.status === "completed") || [];

  const getUserChallengeForChallenge = (challengeId: number) => {
    return userChallenges?.find(uc => uc.challengeId === challengeId && uc.status === "active");
  };

  const getCompletedChallengeForChallenge = (challengeId: number) => {
    return userChallenges?.find(uc => uc.challengeId === challengeId && uc.status === "completed");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Challenges</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium text-foreground mb-2">
              Sign in to start challenges
            </h3>
            <p className="text-muted-foreground mb-6">
              Push yourself with fun posting challenges and earn badges!
            </p>
            <Button onClick={navigateToLogin} data-testid="button-signin">
              Sign In
            </Button>
          </div>
        </main>
        <MobileNav isLoggedIn={false} />
      </div>
    );
  }

  const isLoading = challengesLoading || userChallengesLoading;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Challenges</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-page-enter">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {activeChallenges.length > 0 && (
              <section className="space-y-4 animate-fade-in-up stagger-1">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-semibold text-lg">Active Challenges</h2>
                </div>
                {activeChallenges.map((uc) => (
                  <ActiveChallengeDetail
                    key={uc.id}
                    userChallenge={uc}
                    onLogProgress={() => logProgressMutation.mutate(uc.id)}
                    onAbandon={() => abandonMutation.mutate(uc.id)}
                    isLogging={logProgressMutation.isPending}
                    isAbandoning={abandonMutation.isPending}
                  />
                ))}
              </section>
            )}

            <section className="space-y-4 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-heading font-semibold text-lg">Available Challenges</h2>
              </div>
              
              {challenges?.map((challenge) => {
                const activeUC = getUserChallengeForChallenge(challenge.id);
                const completedUC = getCompletedChallengeForChallenge(challenge.id);
                
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={activeUC || completedUC}
                    onStart={() => startChallengeMutation.mutate(challenge.id)}
                    onView={() => setSelectedChallenge(challenge)}
                    isStarting={startingChallengeId === challenge.id}
                  />
                );
              })}

              {(!challenges || challenges.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No challenges available yet.</p>
                </div>
              )}
            </section>

            {completedChallenges.length > 0 && (
              <section className="space-y-4 animate-fade-in-up stagger-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-heading font-semibold text-lg">Completed</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {completedChallenges.length}
                  </Badge>
                </div>
                
                {completedChallenges.map((uc) => (
                  <Card key={uc.id} className="bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                          {uc.challenge && <ChallengeIcon icon={uc.challenge.badgeIcon || uc.challenge.icon} className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{uc.challenge?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Completed {uc.completedAt ? format(new Date(uc.completedAt), "MMM d, yyyy") : ""} · {uc.postsCompleted} posts
                          </p>
                        </div>
                        {uc.challenge?.badgeName && (
                          <Badge className="bg-emerald-600">
                            <Trophy className="w-3 h-3 mr-1" />
                            {uc.challenge.badgeName}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      <Dialog open={!!selectedChallenge} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        <DialogContent className="max-w-md">
          {selectedChallenge && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ChallengeIcon icon={selectedChallenge.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="font-heading">{selectedChallenge.name}</DialogTitle>
                    <DialogDescription>
                      {selectedChallenge.durationDays} days · {selectedChallenge.postsRequired || selectedChallenge.durationDays} posts required
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedChallenge.description}</p>
                
                {(selectedChallenge.rules?.length || 0) > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Rules</h4>
                    <ul className="space-y-1">
                      {selectedChallenge.rules?.map((rule, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedChallenge.tips?.length || 0) > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tips</h4>
                    <ul className="space-y-1">
                      {selectedChallenge.tips?.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedChallenge.badgeName && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Complete to earn:</p>
                      <p className="text-sm text-muted-foreground">{selectedChallenge.badgeName} badge</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {getUserChallengeForChallenge(selectedChallenge.id) ? (
                  <Button disabled className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Already Active
                  </Button>
                ) : getCompletedChallengeForChallenge(selectedChallenge.id) ? (
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      startChallengeMutation.mutate(selectedChallenge.id);
                      setSelectedChallenge(null);
                    }}
                    disabled={startChallengeMutation.isPending}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Again
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      startChallengeMutation.mutate(selectedChallenge.id);
                      setSelectedChallenge(null);
                    }}
                    disabled={startChallengeMutation.isPending}
                  >
                    {startChallengeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Start Challenge
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <MobileNav isLoggedIn={true} />
    </div>
  );
}
