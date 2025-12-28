import { Camera, Video, Film, Images, Clock, Radio, GraduationCap, ArrowLeftRight, Clapperboard, Star, ShoppingBag, Megaphone, MessageCircle, Sparkles, Lightbulb, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { type Post, type ContentType, type Category } from "@shared/schema";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

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

interface PostCardProps {
  post: Post;
  compact?: boolean;
  onClick?: () => void;
}

export default function PostCard({ post, compact = false, onClick }: PostCardProps) {
  const ContentIcon = contentTypeIcons[post.contentType as ContentType];
  const CategoryIcon = categoryIcons[post.category as Category];
  const categoryColor = categoryColors[post.category as Category];
  const dateStr = `${months[post.month - 1]} ${post.day}`;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-1.5 rounded bg-accent/50 hover-elevate active-elevate-2 transition-all"
        data-testid={`post-card-compact-${post.id}`}
      >
        <div className="flex items-center gap-1.5">
          <ContentIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-medium text-foreground truncate">
            {post.title}
          </span>
        </div>
      </button>
    );
  }

  return (
    <Card
      className="p-4 cursor-pointer hover-elevate active-elevate-2 transition-all touch-target"
      onClick={onClick}
      data-testid={`post-card-${post.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <ContentIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="sm:hidden">
            <div className="text-sm font-medium text-muted-foreground">
              {dateStr}
            </div>
            <Badge
              variant="secondary"
              className={`text-xs ${categoryColor} border-0 gap-1`}
            >
              <CategoryIcon className="w-3 h-3" />
              {post.category}
            </Badge>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading font-semibold text-foreground line-clamp-2">
              {post.title}
            </h3>
            <div className="hidden sm:block text-sm font-medium text-muted-foreground flex-shrink-0">
              {dateStr}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`text-xs ${categoryColor} border-0 hidden sm:inline-flex gap-1`}
            >
              <CategoryIcon className="w-3 h-3" />
              {post.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {post.contentType}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
