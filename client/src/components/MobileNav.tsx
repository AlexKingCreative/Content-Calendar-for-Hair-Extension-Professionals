import { Link, useLocation } from "wouter";
import { Calendar, Filter, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
}

export function MobileNav({ isAdmin, isLoggedIn, onFilterClick, hasActiveFilters }: MobileNavProps) {
  const [location] = useLocation();

  const navItems = [
    {
      icon: Calendar,
      label: "Calendar",
      href: "/calendar",
      active: location === "/calendar",
    },
    {
      icon: Filter,
      label: "Filters",
      onClick: onFilterClick,
      active: hasActiveFilters,
    },
    ...(isAdmin
      ? [
          {
            icon: Settings,
            label: "Admin",
            href: "/admin",
            active: location === "/admin",
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom sm:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full px-2",
                  "text-muted-foreground active:text-foreground transition-colors",
                  item.active && "text-primary"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.active && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

          if (item.external) {
            return (
              <a
                key={index}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full px-2",
                  "text-muted-foreground active:text-foreground transition-colors",
                  item.active && "text-primary"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            );
          }

          return (
            <Link key={index} href={item.href!}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full px-2",
                  "text-muted-foreground active:text-foreground transition-colors cursor-pointer",
                  item.active && "text-primary"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
