import { Link, useLocation } from "wouter";
import { Calendar, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isLoggedIn?: boolean;
  onTodayClick?: () => void;
  hasTodayPost?: boolean;
}

export function MobileNav({ isLoggedIn, onTodayClick, hasTodayPost }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom sm:hidden">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={onTodayClick}
          disabled={!hasTodayPost}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full px-2",
            "transition-colors",
            hasTodayPost ? "text-primary" : "text-muted-foreground/50"
          )}
          data-testid="nav-today"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium">Today</span>
        </button>

        <Link href="/calendar">
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full px-6",
              "transition-colors cursor-pointer",
              location === "/calendar" ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="nav-calendar"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Calendar</span>
          </div>
        </Link>

        <Link href={isLoggedIn ? "/settings" : "/api/login"}>
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1 h-full px-6",
              "transition-colors cursor-pointer",
              location === "/settings" ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Settings</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
