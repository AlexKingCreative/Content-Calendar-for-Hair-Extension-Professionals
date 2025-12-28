import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Star, Trophy, Crown, Gem, Medal, Rocket, Sparkles, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { streakMilestones, postingGoalDescriptions, type PostingGoal } from "@shared/schema";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: PostingGoal;
  hasPostedToday: boolean;
  recentLogs: string[];
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

export function StreakWidget() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: streak, isLoading } = useQuery<StreakData>({
    queryKey: ["/api/streak"],
  });

  const logPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/streak/log", {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/streak"] });
      qc.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ 
        title: "Posted today!", 
        description: streak?.currentStreak 
          ? `You're on a ${(streak.currentStreak || 0) + 1} day streak!` 
          : "You've started a new streak!" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Could not log post", 
        description: error?.message || "You may have already logged a post today.",
        variant: "destructive" 
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="glass-card rounded-2xl border-0">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!streak) return null;

  const earnedBadges = getEarnedBadges(streak.currentStreak);
  const nextMilestone = getNextMilestone(streak.currentStreak);
  const goalInfo = postingGoalDescriptions[streak.postingGoal as PostingGoal] || postingGoalDescriptions.casual;

  return (
    <Card data-testid="card-streak-widget" className="glass-card rounded-2xl border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Posting Streak
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {goalInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-foreground" data-testid="text-current-streak">
              {streak.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center flex-1 border-l border-r px-4">
            <div className="text-xl font-semibold text-foreground" data-testid="text-longest-streak">
              {streak.longestStreak}
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xl font-semibold text-foreground" data-testid="text-total-posts">
              {streak.totalPosts}
            </div>
            <div className="text-xs text-muted-foreground">Total Posts</div>
          </div>
        </div>

        {streak.hasPostedToday ? (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Posted today</span>
          </div>
        ) : (
          <Button
            onClick={() => logPostMutation.mutate()}
            disabled={logPostMutation.isPending}
            className="w-full"
            data-testid="button-log-post"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {logPostMutation.isPending ? "Logging..." : "I Posted Today!"}
          </Button>
        )}

        {earnedBadges.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Earned Badges</div>
            <div className="flex flex-wrap gap-1">
              {earnedBadges.map((milestone) => {
                const Icon = iconMap[milestone.icon] || Flame;
                return (
                  <Badge 
                    key={milestone.days} 
                    variant="secondary" 
                    className="text-xs gap-1"
                    data-testid={`badge-milestone-${milestone.days}`}
                  >
                    <Icon className="w-3 h-3" />
                    {milestone.badge}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {nextMilestone && (
          <div className="text-xs text-muted-foreground text-center">
            {nextMilestone.days - streak.currentStreak} days until "{nextMilestone.badge}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}
