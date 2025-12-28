import { Camera, Video, Film, Images, Clock, Radio, Hash, Copy, Check, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { type Post, type ContentType, type Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contentTypeIcons: Record<ContentType, typeof Camera> = {
  Photo: Camera,
  Video: Video,
  Reel: Film,
  Carousel: Images,
  Story: Clock,
  Live: Radio,
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

  // Reset caption when post changes
  useEffect(() => {
    setGeneratedCaption("");
    setCaptionCopied(false);
  }, [post?.id]);

  if (!post) return null;

  const handleGenerateCaption = async () => {
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

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ContentIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {months[post.month - 1]} {post.day}
                </div>
                <DialogTitle className="font-heading text-lg font-semibold text-foreground text-left">
                  {post.title}
                </DialogTitle>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`${categoryColors[post.category]} border-0`}
            >
              {post.category}
            </Badge>
            <Badge variant="outline">
              {post.contentType}
            </Badge>
          </div>

          <Separator />

          <div>
            <h4 className="font-heading font-medium text-foreground mb-2">
              Post Description
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-heading font-medium text-foreground mb-2">
              Content Format
            </h4>
            <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-md">
              <ContentIcon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">
                  {post.contentType}
                </div>
                <p className="text-sm text-muted-foreground">
                  {contentTypeDescriptions[post.contentType]}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-heading font-medium text-foreground">
                Suggested Hashtags
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyHashtags}
                data-testid="button-copy-hashtags"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? "Copied" : "Copy All"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="secondary"
                  className="text-sm"
                >
                  <Hash className="w-3 h-3 mr-0.5" />
                  {hashtag.replace("#", "")}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Write My Caption Section */}
          <div>
            <h4 className="font-heading font-medium text-foreground mb-2">
              AI Caption Generator
            </h4>
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
                    Writing your caption...
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
                  className="min-h-[120px] text-sm"
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
                    {captionCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Caption
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateCaption}
                    disabled={isGenerating}
                    className="gap-1"
                    data-testid="button-regenerate-caption"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>

          {post.instagramExampleUrl && (
            <>
              <Separator />
              <div>
                <h4 className="font-heading font-medium text-foreground mb-2">
                  Example Post
                </h4>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(post.instagramExampleUrl!, "_blank")}
                  data-testid="button-see-example"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  See Post Example on Instagram
                </Button>
              </div>
            </>
          )}
        </div>
        <DialogDescription className="sr-only">
          View post details, generate captions, and copy hashtags for your social media content.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
