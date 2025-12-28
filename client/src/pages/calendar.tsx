import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List, LogIn, LogOut, Settings, User, GraduationCap, ArrowLeftRight, Clapperboard, Star, ShoppingBag, Megaphone, MessageCircle, Sparkles, Lightbulb, TrendingUp, Check, ChevronDown, Flame, Filter, type LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type Post, type Category, type ContentType } from "@shared/schema";
import PostCard from "@/components/post-card";
import PostDetailModal from "@/components/post-detail-modal";
import FilterControls from "@/components/filter-controls";
import { NotificationBanner } from "@/components/NotificationBanner";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MobileNav } from "@/components/MobileNav";
import { StreakWidget } from "@/components/streak-widget";
import { useSwipe } from "@/hooks/useSwipe";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface StreakData {
  currentStreak: number;
  hasPostedToday: boolean;
}

interface User {
  id: string;
  name?: string;
  username?: string;
}

interface UserProfile {
  id: number;
  userId: string;
  city: string | null;
  certifiedBrands: string[];
  extensionMethods: string[];
  isAdmin: boolean;
  onboardingComplete: boolean;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryIcons: Record<Category, LucideIcon> = {
  Educational: GraduationCap,
  "Before & After": ArrowLeftRight,
  "Behind the Scenes": Clapperboard,
  "Client Spotlight": Star,
  "Product Showcase": ShoppingBag,
  Promotional: Megaphone,
  Engagement: MessageCircle,
  Inspiration: Sparkles,
  "Tips & Tricks": Lightbulb,
  Trending: TrendingUp,
};

const categoryBgColors: Record<Category, string> = {
  Educational: "bg-blue-50 dark:bg-blue-950/30",
  "Before & After": "bg-purple-50 dark:bg-purple-950/30",
  "Behind the Scenes": "bg-amber-50 dark:bg-amber-950/30",
  "Client Spotlight": "bg-pink-50 dark:bg-pink-950/30",
  "Product Showcase": "bg-emerald-50 dark:bg-emerald-950/30",
  Promotional: "bg-red-50 dark:bg-red-950/30",
  Engagement: "bg-cyan-50 dark:bg-cyan-950/30",
  Inspiration: "bg-indigo-50 dark:bg-indigo-950/30",
  "Tips & Tricks": "bg-orange-50 dark:bg-orange-950/30",
  Trending: "bg-rose-50 dark:bg-rose-950/30",
};

const categoryIconColors: Record<Category, string> = {
  Educational: "text-blue-600 dark:text-blue-400",
  "Before & After": "text-purple-600 dark:text-purple-400",
  "Behind the Scenes": "text-amber-600 dark:text-amber-400",
  "Client Spotlight": "text-pink-600 dark:text-pink-400",
  "Product Showcase": "text-emerald-600 dark:text-emerald-400",
  Promotional: "text-red-600 dark:text-red-400",
  Engagement: "text-cyan-600 dark:text-cyan-400",
  Inspiration: "text-indigo-600 dark:text-indigo-400",
  "Tips & Tricks": "text-orange-600 dark:text-orange-400",
  Trending: "text-rose-600 dark:text-rose-400",
};

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(min-width: 640px)");
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setViewMode(e.matches ? "grid" : "list");
      };
      handleChange(mediaQuery);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: streakData } = useQuery<StreakData>({
    queryKey: ["/api/streak"],
    enabled: !!user && !!profile?.onboardingComplete,
  });

  const { toast } = useToast();
  const qc = useQueryClient();

  const logPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/streak/log", {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/streak"] });
      toast({ 
        title: "Posted today!", 
        description: streakData?.currentStreak 
          ? `You're on a ${(streakData.currentStreak || 0) + 1} day streak!` 
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

  const handlePrevMonth = useCallback(() => {
    setSelectedMonth((prev) => (prev === 1 ? 12 : prev - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setSelectedMonth((prev) => (prev === 12 ? 1 : prev + 1));
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNextMonth,
    onSwipeRight: handlePrevMonth,
    threshold: 75,
  });

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesMonth = post.month === selectedMonth;
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category);
      const matchesContentType = selectedContentTypes.length === 0 || selectedContentTypes.includes(post.contentType);
      return matchesMonth && matchesCategory && matchesContentType;
    });
  }, [posts, selectedMonth, selectedCategories, selectedContentTypes]);

  const calendarDays = useMemo(() => {
    const year = 2025;
    const daysInMonth = getDaysInMonth(new Date(year, selectedMonth - 1));
    const firstDayOfMonth = getDay(startOfMonth(new Date(year, selectedMonth - 1)));
    
    const days: (number | null)[] = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [selectedMonth]);

  const getPostsForDay = (day: number) => {
    return filteredPosts.filter((post) => post.day === day);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedContentTypes([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedContentTypes.length > 0;

  const todayPost = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return posts.find(p => p.month === month && p.day === day);
  }, [posts]);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-base sm:text-2xl font-semibold text-foreground truncate" data-testid="text-app-title">
                  Hair Calendar
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  365 days of content ideas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                data-testid="button-prev-month"
                className="touch-target"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-28 sm:w-36 touch-target" data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()} className="touch-target">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                data-testid="button-next-month"
                className="touch-target"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                variant={hasActiveFilters ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setFilterSheetOpen(true)}
                data-testid="button-filter-mobile"
                className="touch-target sm:hidden relative"
              >
                <Filter className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>

              <div className="hidden sm:flex items-center gap-1 ml-2 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 ml-2">
                {user ? (
                  <>
                    {profile?.isAdmin && (
                      <Link href="/admin">
                        <Button variant="outline" size="sm" data-testid="button-admin">
                          <Settings className="w-4 h-4 mr-1" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    {user && !profile?.onboardingComplete && (
                      <Link href="/onboarding">
                        <Button variant="outline" size="sm" data-testid="button-setup">
                          <User className="w-4 h-4 mr-1" />
                          Setup
                        </Button>
                      </Link>
                    )}
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" data-testid="button-settings">
                        <Settings className="w-4 h-4 mr-1" />
                        Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = "/api/logout"}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main 
        className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 mobile-scroll"
        {...swipeHandlers}
      >
        <div className="mb-4">
          <NotificationBanner />
        </div>

        {todayPost && selectedMonth === new Date().getMonth() + 1 && (
          <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20 hidden sm:block">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Today's Post</span>
                <Badge variant="secondary" className="text-xs">
                  {format(new Date(), "MMMM d, yyyy")}
                </Badge>
              </div>
              {user && profile?.onboardingComplete && (
                <Button
                  size="sm"
                  variant={streakData?.hasPostedToday ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!streakData?.hasPostedToday) {
                      logPostMutation.mutate();
                    }
                  }}
                  disabled={streakData?.hasPostedToday || logPostMutation.isPending}
                  data-testid="button-mark-posted"
                >
                  {streakData?.hasPostedToday ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Posted
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 mr-1" />
                      I Posted
                    </>
                  )}
                </Button>
              )}
            </div>
            <button
              onClick={() => setSelectedPost(todayPost)}
              className="text-left w-full group"
              data-testid="button-today-post"
            >
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {todayPost.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{todayPost.description}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                <span>View details</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </button>
          </div>
        )}

        <div className="hidden sm:block">
          <FilterControls
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedContentTypes={selectedContentTypes}
            setSelectedContentTypes={setSelectedContentTypes}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            postCount={filteredPosts.length}
          />
        </div>

        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Filter Posts</SheetTitle>
            </SheetHeader>
            <div className="py-4 overflow-y-auto mobile-scroll">
              <FilterControls
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedContentTypes={selectedContentTypes}
                setSelectedContentTypes={setSelectedContentTypes}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
                postCount={filteredPosts.length}
                onApply={() => setFilterSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {isLoading ? (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="mt-4 sm:mt-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="min-h-16 sm:min-h-24" />;
                }

                const dayPosts = getPostsForDay(day);
                const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth() + 1;

                const firstPost = dayPosts[0];
                const CategoryIcon = firstPost ? categoryIcons[firstPost.category as Category] : null;
                const bgColor = firstPost ? categoryBgColors[firstPost.category as Category] : "";
                const iconColor = firstPost ? categoryIconColors[firstPost.category as Category] : "";

                return (
                  <button
                    key={day}
                    onClick={() => dayPosts.length > 0 && setSelectedPost(dayPosts[0])}
                    className={`min-h-16 sm:min-h-24 border border-card-border rounded-md p-1 sm:p-2 hover-elevate transition-all text-left ${
                      isToday ? "ring-2 ring-primary" : ""
                    } ${firstPost ? bgColor : "bg-card"}`}
                    data-testid={`calendar-day-${day}`}
                    disabled={dayPosts.length === 0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs sm:text-sm font-medium ${
                        isToday ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {day}
                      </span>
                      {CategoryIcon && (
                        <CategoryIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${iconColor}`} />
                      )}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {dayPosts.slice(0, 1).map((post) => (
                        <div
                          key={post.id}
                          className="text-xs line-clamp-2 sm:line-clamp-3 text-foreground"
                        >
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 1 && (
                        <span className="text-xs text-primary font-medium">
                          +{dayPosts.length - 1}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                  No posts found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or selecting a different month.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))
            )}
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center text-sm text-muted-foreground pb-4">
          <p>
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} for {months[selectedMonth - 1]}
            {hasActiveFilters && " (filtered)"}
          </p>
          <p className="text-xs mt-1 sm:hidden text-muted-foreground/70">
            Swipe left or right to change months
          </p>
        </div>

        {user && profile?.onboardingComplete && (
          <div className="mb-20 sm:mb-4">
            <StreakWidget />
          </div>
        )}
      </main>

      <MobileNav
        isLoggedIn={!!user}
        onTodayClick={() => todayPost && setSelectedPost(todayPost)}
        hasTodayPost={!!todayPost && selectedMonth === new Date().getMonth() + 1}
      />

      <InstallPrompt />

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
