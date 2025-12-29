import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, Clock, Video, ExternalLink } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/MobileNav";
import { getQueryFn } from "@/lib/queryClient";
import { type TrendAlert } from "@shared/schema";

interface TrendWithStatus extends TrendAlert {
  expiresAt: string;
  isExpired: boolean;
  daysRemaining: number;
  daysSinceExpired: number;
}

interface User {
  id: string;
}

export default function TrendsPage() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: trends = [], isLoading } = useQuery<TrendWithStatus[]>({
    queryKey: ["/api/trends", { includeExpired: true }],
    queryFn: async () => {
      const res = await fetch("/api/trends?includeExpired=true");
      if (!res.ok) throw new Error("Failed to fetch trends");
      return res.json();
    },
  });

  const activeTrends = trends.filter(t => !t.isExpired);
  const expiredTrends = trends.filter(t => t.isExpired);

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    return null;
  };

  const TrendCard = ({ trend, isExpired }: { trend: TrendWithStatus; isExpired: boolean }) => {
    const embedUrl = getVideoEmbedUrl(trend.videoUrl || "");
    
    return (
      <Card 
        className={`overflow-hidden ${isExpired ? "opacity-70" : ""}`} 
        data-testid={`card-trend-${trend.id}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 flex-shrink-0 ${isExpired ? "text-muted-foreground" : "text-primary"}`} />
              {trend.title}
            </CardTitle>
            {isExpired ? (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Expired {trend.daysSinceExpired}d ago
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs flex-shrink-0">
                <Clock className="w-3 h-3 mr-1" />
                {trend.daysRemaining}d left
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {trend.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {trend.videoUrl && (
              <a href={trend.videoUrl} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Video className="w-3 h-3" />
                  Watch Video
                  <ExternalLink className="w-3 h-3" />
                </Badge>
              </a>
            )}
            {trend.instagramUrl && (
              <a href={trend.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 text-xs">
                  <SiInstagram className="w-3 h-3" />
                  See Example
                  <ExternalLink className="w-3 h-3" />
                </Badge>
              </a>
            )}
          </div>
          
          {embedUrl && !isExpired && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={embedUrl}
                title={trend.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/today")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trend Alerts
            </h1>
            <p className="text-xs text-muted-foreground">Hot trends for your content</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-page-enter">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium text-foreground mb-2">
              No Trends Yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon for trending content ideas!
            </p>
          </div>
        ) : (
          <>
            {activeTrends.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="font-heading font-medium text-foreground text-sm">Happening Now</h2>
                  <Badge variant="default" className="text-xs">{activeTrends.length}</Badge>
                </div>
                {activeTrends.map(trend => (
                  <TrendCard key={trend.id} trend={trend} isExpired={false} />
                ))}
              </section>
            )}

            {expiredTrends.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-heading font-medium text-muted-foreground text-sm">Past Trends</h2>
                  <Badge variant="secondary" className="text-xs">{expiredTrends.length}</Badge>
                </div>
                {expiredTrends.map(trend => (
                  <TrendCard key={trend.id} trend={trend} isExpired={true} />
                ))}
              </section>
            )}
          </>
        )}
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
