import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List, LogIn, LogOut, Settings, User } from "lucide-react";
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
import { useSwipe } from "@/hooks/useSwipe";

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = "/api/auth/logout"}
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
                    onClick={() => window.location.href = "/api/auth/login"}
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
          <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Today's Post</span>
            </div>
            <button
              onClick={() => setSelectedPost(todayPost)}
              className="text-left w-full"
              data-testid="button-today-post"
            >
              <h3 className="font-medium text-foreground">{todayPost.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{todayPost.description}</p>
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

                return (
                  <button
                    key={day}
                    onClick={() => dayPosts.length > 0 && setSelectedPost(dayPosts[0])}
                    className={`min-h-16 sm:min-h-24 bg-card border border-card-border rounded-md p-1 sm:p-2 hover-elevate transition-all text-left ${
                      isToday ? "ring-2 ring-primary" : ""
                    }`}
                    data-testid={`calendar-day-${day}`}
                    disabled={dayPosts.length === 0}
                  >
                    <div className={`text-xs sm:text-sm font-medium mb-1 ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {day}
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
      </main>

      <MobileNav
        isAdmin={profile?.isAdmin}
        isLoggedIn={!!user}
        onFilterClick={() => setFilterSheetOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <InstallPrompt />

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
