import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Settings, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQueryFn } from "@/lib/queryClient";

interface StreakData {
  currentStreak: number;
  hasPostedToday: boolean;
}

interface MobileNavProps {
  isLoggedIn?: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [location, setLocation] = useLocation();

  const { data: streak } = useQuery<StreakData>({
    queryKey: ["/api/streak"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!isLoggedIn,
  });

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
      {isLoggedIn && streak && streak.currentStreak > 0 && (
        <div className="glass-pill rounded-2xl mx-auto max-w-xs mb-2 px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <Flame className={cn(
              "w-4 h-4",
              streak.hasPostedToday ? "text-orange-500" : "text-muted-foreground"
            )} />
            <span className="text-sm font-medium">
              {streak.currentStreak} day streak
            </span>
            {streak.hasPostedToday && (
              <span className="text-xs text-green-600 dark:text-green-400">Posted today</span>
            )}
          </div>
        </div>
      )}
      <div className="glass-pill rounded-3xl mx-auto max-w-xs">
        <div className="flex items-center justify-around h-14 px-4">
          <button
            onClick={() => setLocation("/today")}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-2xl fluid-transition active:scale-95",
              location === "/today" 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            data-testid="nav-today"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-medium">Today</span>
          </button>

          <Link href="/calendar">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full px-6 rounded-2xl fluid-transition active:scale-95",
                location === "/calendar" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              data-testid="nav-calendar"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-medium">Calendar</span>
            </div>
          </Link>

          <Link href={isLoggedIn ? "/settings" : "/api/login"}>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full px-4 rounded-2xl fluid-transition active:scale-95",
                location === "/settings" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              data-testid="nav-settings"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
