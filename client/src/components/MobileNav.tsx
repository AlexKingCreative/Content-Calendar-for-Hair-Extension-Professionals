import { Link, useLocation } from "wouter";
import { Calendar, Settings, Sparkles, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigateToLogin } from "@/lib/auth-utils";

interface MobileNavProps {
  isLoggedIn?: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [location, setLocation] = useLocation();

  const handleSettingsClick = () => {
    if (isLoggedIn) {
      setLocation("/settings");
    } else {
      navigateToLogin();
    }
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 sm:hidden safe-area-bottom">
      <div className="glass-pill rounded-3xl mx-auto max-w-sm">
        <div className="flex items-center h-14 px-2">
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

          <Link href="/calendar" className="flex-1">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full rounded-2xl fluid-transition active:scale-95",
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

          <Link href="/trends" className="flex-1">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full rounded-2xl fluid-transition active:scale-95",
                location === "/trends" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              data-testid="nav-trends"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-medium">Trends</span>
            </div>
          </Link>

          <Link href="/streaks" className="flex-1">
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full rounded-2xl fluid-transition active:scale-95",
                location === "/streaks" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
              data-testid="nav-streaks"
            >
              <Flame className="w-5 h-5" />
              <span className="text-[10px] font-medium">Streaks</span>
            </div>
          </Link>

          <button
            onClick={handleSettingsClick}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-2xl fluid-transition active:scale-95",
              location === "/settings" || location === "/account"
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
