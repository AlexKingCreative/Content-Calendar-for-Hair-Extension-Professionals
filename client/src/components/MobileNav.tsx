import { Link, useLocation } from "wouter";
import { Calendar, Settings, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isLoggedIn?: boolean;
  onTodayClick?: () => void;
  onStreakClick?: () => void;
  hasTodayPost?: boolean;
}

export function MobileNav({ isLoggedIn, onTodayClick, onStreakClick, hasTodayPost }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
      <div className="glass-pill rounded-3xl mx-auto max-w-sm">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={onTodayClick}
            disabled={!hasTodayPost}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full px-2 rounded-2xl fluid-transition",
              hasTodayPost 
                ? "text-primary active:scale-95" 
                : "text-muted-foreground/40"
            )}
            data-testid="nav-today"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-medium">Today</span>
          </button>

          <Link href="/calendar">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full px-3 rounded-2xl fluid-transition active:scale-95",
                location === "/calendar" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              data-testid="nav-calendar"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Calendar</span>
            </div>
          </Link>

          <button
            onClick={onStreakClick}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full px-2 rounded-2xl fluid-transition text-orange-500 active:scale-95"
            data-testid="nav-streak"
          >
            <Flame className="w-5 h-5" />
            <span className="text-xs font-medium">Streak</span>
          </button>

          <Link href={isLoggedIn ? "/settings" : "/api/login"}>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full px-3 rounded-2xl fluid-transition active:scale-95",
                location === "/settings" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              data-testid="nav-settings"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
