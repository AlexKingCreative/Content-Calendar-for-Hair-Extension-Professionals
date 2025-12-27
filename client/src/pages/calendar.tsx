import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { type Post, type Category, type ContentType, categories, contentTypes } from "@shared/schema";
import PostCard from "@/components/post-card";
import PostDetailModal from "@/components/post-detail-modal";
import FilterControls from "@/components/filter-controls";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
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

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedContentTypes([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedContentTypes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-xl sm:text-2xl font-semibold text-foreground" data-testid="text-app-title">
                  Hair Extension Calendar
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  365 days of content ideas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-36" data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()}>
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
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-1 ml-2 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                  className="h-8 w-8"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                  className="h-8 w-8"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <FilterControls
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedContentTypes={selectedContentTypes}
          setSelectedContentTypes={setSelectedContentTypes}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          postCount={filteredPosts.length}
        />

        {isLoading ? (
          <div className="grid grid-cols-7 gap-2 mt-6">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="mt-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="min-h-24" />;
                }

                const dayPosts = getPostsForDay(day);

                return (
                  <div
                    key={day}
                    className="min-h-24 sm:min-h-32 bg-card border border-card-border rounded-md p-1 sm:p-2 hover-elevate transition-all"
                    data-testid={`calendar-day-${day}`}
                  >
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 2).map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          compact
                          onClick={() => setSelectedPost(post)}
                        />
                      ))}
                      {dayPosts.length > 2 && (
                        <button
                          className="text-xs text-primary font-medium hover:underline w-full text-left"
                          onClick={() => setSelectedPost(dayPosts[0])}
                          data-testid={`button-more-posts-${day}`}
                        >
                          +{dayPosts.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
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

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} for {months[selectedMonth - 1]}
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>
      </main>

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
