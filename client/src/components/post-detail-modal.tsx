import { Camera, Video, Film, Images, Clock, Radio, Hash, Copy, Check, ExternalLink, Sparkles, Loader2, GraduationCap, ArrowLeftRight, Clapperboard, Star, ShoppingBag, Megaphone, MessageCircle, Lightbulb, TrendingUp, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { type Post, type ContentType, type Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AccessStatus {
  hasAccess: boolean;
  subscriptionStatus?: string;
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

const contentTypeDescriptions: Record<ContentType, string> = {
  Photo: "A single high-quality image post",
  Video: "A video post (60 seconds or longer)",
  Reel: "A short-form vertical video (15-90 seconds)",
  Carousel: "Multiple images in a swipeable gallery",
  Story: "A 24-hour ephemeral story post",
  Live: "A live streaming session with your audience",
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

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: accessStatus } = useQuery<AccessStatus>({
    queryKey: ["/api/billing/access-status"],
  });

  const isPremium = accessStatus?.subscriptionStatus === "active" || accessStatus?.subscriptionStatus === "trialing";

  // Reset caption when post changes
  useEffect(() => {
    setGeneratedCaption("");
    setCaptionCopied(false);
  }, [post?.id]);

  if (!post) return null;

  const handleGenerateCaption = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI captions are available for subscribers. Start your free trial!",
      });
      setLocation("/subscribe");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", `/api/posts/${post.id}/generate-caption`);
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

  const ContentIcon = contentTypeIcons[post.contentType];
  const CategoryIcon = categoryIcons[post.category];

  const handleCopyHashtags = async () => {
    const hashtagsText = post.hashtags.join(" ");
    await navigator.clipboard.writeText(hashtagsText);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Hashtags have been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const displayHashtags = post.hashtags.slice(0, 5);

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ContentIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {months[post.month - 1]} {post.day} · {post.contentType}
              </div>
              <DialogTitle className="font-heading text-base font-semibold text-foreground text-left truncate">
                {post.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`${categoryColors[post.category]} border-0 gap-1 text-xs`}
            >
              <CategoryIcon className="w-3 h-3" />
              {post.category}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {displayHashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="secondary"
                  className="text-xs py-0.5 px-1.5"
                >
                  <Hash className="w-2.5 h-2.5 mr-0.5" />
                  {hashtag.replace("#", "")}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyHashtags}
              className="ml-2 flex-shrink-0"
              data-testid="button-copy-hashtags"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {!generatedCaption ? (
            <Button
              onClick={handleGenerateCaption}
              disabled={isGenerating}
              variant={isPremium ? "default" : "outline"}
              className="w-full gap-2"
              size="sm"
              data-testid="button-write-caption"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Writing...
                </>
              ) : isPremium ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Write My Caption
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Write My Caption
                  <Badge variant="secondary" className="text-xs ml-1">Pro</Badge>
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={generatedCaption}
                onChange={(e) => setGeneratedCaption(e.target.value)}
                className="min-h-[80px] text-sm"
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

          {post.instagramExampleUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => window.open(post.instagramExampleUrl!, "_blank")}
              data-testid="button-see-example"
            >
              <ExternalLink className="w-4 h-4" />
              See Example
            </Button>
          )}
        </div>
        <DialogDescription className="sr-only">
          View post details, generate captions, and copy hashtags for your social media content.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
