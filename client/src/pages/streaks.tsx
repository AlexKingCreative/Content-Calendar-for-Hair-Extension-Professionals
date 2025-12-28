import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Flame, Star, Trophy, Crown, Gem, Medal, Rocket, Sparkles, Check, Calendar, Target, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { streakMilestones, postingGoalDescriptions, type PostingGoal } from "@shared/schema";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: PostingGoal;
  hasPostedToday: boolean;
  recentLogs: string[];
}

interface User {
  id: string;
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
};

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

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: streak, isLoading } = useQuery<StreakData>({
    queryKey: ["/api/streak"],
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
            <Button onClick={() => window.location.href = "/api/login"}>
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

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="glass-card rounded-2xl p-5">
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
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium">You've posted today!</span>
            </div>
          ) : (
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
          )}
        </div>

        <div className="glass-card rounded-2xl p-4">
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
          <div className="glass-card rounded-2xl p-4">
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

        <div className="glass-card rounded-2xl p-4">
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
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
