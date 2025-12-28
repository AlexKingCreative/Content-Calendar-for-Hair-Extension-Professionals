import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Flame, Check, Copy, Hash, Sparkles, Loader2, Camera, Video, Film, Images, Clock, Radio, GraduationCap, ArrowLeftRight, Clapperboard, Star, ShoppingBag, Megaphone, MessageCircle, Lightbulb, TrendingUp } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { type Post, type Category, type ContentType } from "@shared/schema";

interface StreakData {
  currentStreak: number;
  hasPostedToday: boolean;
}

interface User {
  id: string;
}

interface UserProfile {
  onboardingComplete: boolean;
}

const contentTypeIcons: Record<ContentType, typeof Camera> = {
  Photo: Camera,
  Video: Video,
  Reel: Film,
  Carousel: Images,
  Story: Clock,
  Live: Radio,
};

const categoryIcons: Record<Category, typeof Camera> = {
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

const categoryColors: Record<Category, string> = {
  Educational: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Before & After": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Behind the Scenes": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Client Spotlight": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "Product Showcase": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Promotional: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Engagement: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Inspiration: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Tips & Tricks": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Trending: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function TodayPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: streakData } = useQuery<StreakData>({
    queryKey: ["/api/streak"],
    enabled: !!user && !!profile?.onboardingComplete,
  });

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

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const todayPost = posts.find(p => p.month === month && p.day === day);

  const handleGenerateCaption = async () => {
    if (!todayPost) return;
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", `/api/posts/${todayPost.id}/generate-caption`);
      const data = await response.json();
      setGeneratedCaption(data.caption);
      toast({
        title: "Caption generated!",
        description: "Your personalized caption is ready to copy.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate caption",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(generatedCaption);
    setCaptionCopied(true);
    toast({
      title: "Caption copied!",
      description: "Caption has been copied to your clipboard.",
    });
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleCopyHashtags = async () => {
    if (!todayPost) return;
    const displayHashtags = todayPost.hashtags.slice(0, 5);
    const hashtagsText = displayHashtags.join(" ");
    await navigator.clipboard.writeText(hashtagsText);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Hashtags have been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Today's Post</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </main>
      </div>
    );
  }

  if (!todayPost) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg">Today's Post</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium text-foreground mb-2">
              No post for today
            </h3>
            <p className="text-muted-foreground mb-6">
              Check back tomorrow for new content ideas!
            </p>
            <Button onClick={() => setLocation("/calendar")}>
              View Calendar
            </Button>
          </div>
        </main>
        <MobileNav isLoggedIn={!!user} />
      </div>
    );
  }

  const ContentIcon = contentTypeIcons[todayPost.contentType];
  const CategoryIcon = categoryIcons[todayPost.category];
  const displayHashtags = todayPost.hashtags.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/calendar")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading font-semibold text-lg">Today's Post</h1>
              <p className="text-xs text-muted-foreground">{format(now, "EEEE, MMMM d")}</p>
            </div>
          </div>
          {user && profile?.onboardingComplete && (
            <Button
              size="sm"
              variant={streakData?.hasPostedToday ? "secondary" : "default"}
              onClick={() => !streakData?.hasPostedToday && logPostMutation.mutate()}
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
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ContentIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {todayPost.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className={`${categoryColors[todayPost.category]} border-0 gap-1 text-xs`}
                >
                  <CategoryIcon className="w-3 h-3" />
                  {todayPost.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {todayPost.contentType}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {todayPost.description}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-medium text-foreground text-sm">Suggested Hashtags</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyHashtags}
              data-testid="button-copy-hashtags"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displayHashtags.map((hashtag) => (
              <Badge
                key={hashtag}
                variant="secondary"
                className="text-xs"
              >
                <Hash className="w-2.5 h-2.5 mr-0.5" />
                {hashtag.replace("#", "")}
              </Badge>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-heading font-medium text-foreground text-sm mb-3">AI Caption Generator</h3>
          {!generatedCaption ? (
            <Button
              onClick={handleGenerateCaption}
              disabled={isGenerating}
              className="w-full gap-2"
              data-testid="button-write-caption"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Writing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Write My Caption
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={generatedCaption}
                onChange={(e) => setGeneratedCaption(e.target.value)}
                className="min-h-[100px] text-sm"
                data-testid="textarea-generated-caption"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCaption}
                  className="flex-1 gap-1"
                  data-testid="button-copy-caption"
                >
                  {captionCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {captionCopied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  data-testid="button-regenerate-caption"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {todayPost.instagramExampleUrl && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => window.open(todayPost.instagramExampleUrl!, "_blank")}
            data-testid="button-see-example"
          >
            <SiInstagram className="w-4 h-4" />
            See Example on Instagram
          </Button>
        )}
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
