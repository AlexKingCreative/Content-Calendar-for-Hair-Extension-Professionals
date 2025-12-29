import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Instagram, RefreshCw, Heart, MessageCircle, Eye, Users, Image, TrendingUp, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";

interface InstagramAnalytics {
  account: {
    username: string;
    followersCount: number;
    followingCount: number;
    mediaCount: number;
    profilePictureUrl?: string;
    lastSyncAt?: string;
  };
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalReach: number;
    totalImpressions: number;
    avgEngagement: number;
  };
  dailyStats: Array<{
    date: string;
    posts: number;
    likes: number;
    comments: number;
  }>;
  recentMedia: Array<{
    id: number;
    instagramMediaId: string;
    mediaType: string;
    caption?: string;
    thumbnailUrl?: string;
    permalink?: string;
    likeCount?: number;
    commentsCount?: number;
    reach?: number;
    impressions?: number;
    postDate: string;
  }>;
}

interface InstagramStatus {
  connected: boolean;
  username?: string;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: typeof Heart; 
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MediaCard({ media }: { media: InstagramAnalytics['recentMedia'][0] }) {
  return (
    <a 
      href={media.permalink || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block rounded-lg overflow-hidden hover-elevate"
      data-testid={`media-card-${media.id}`}
    >
      <div className="aspect-square bg-muted relative">
        {media.thumbnailUrl ? (
          <img 
            src={media.thumbnailUrl} 
            alt="Post" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center gap-3 text-white text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {media.likeCount?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {media.commentsCount?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        {media.mediaType !== 'IMAGE' && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 text-xs"
          >
            {media.mediaType === 'VIDEO' ? 'Video' : media.mediaType === 'CAROUSEL_ALBUM' ? 'Carousel' : media.mediaType}
          </Badge>
        )}
      </div>
    </a>
  );
}

export default function InstagramPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: status, isLoading: statusLoading } = useQuery<InstagramStatus>({
    queryKey: ["/api/instagram/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<InstagramAnalytics>({
    queryKey: ["/api/instagram/analytics"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!status?.connected,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/instagram/sync", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/status"] });
      toast({
        title: "Synced",
        description: "Instagram data has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not sync Instagram data.",
        variant: "destructive",
      });
    },
  });

  if (statusLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-50 glass-morphism border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setLocation("/settings")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Instagram Analytics</h1>
          </div>
        </header>
        
        <main className="max-w-lg mx-auto px-4 py-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Instagram className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Connect Your Instagram</h2>
            <p className="text-muted-foreground">
              Link your Instagram Business or Creator account to see your post analytics and track your growth.
            </p>
          </div>
          <Button onClick={() => setLocation("/account")} data-testid="button-go-to-account">
            Go to Account Settings
          </Button>
        </main>
        
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 glass-morphism border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setLocation("/settings")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Instagram Analytics</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            data-testid="button-sync"
          >
            {syncMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {analyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : analytics ? (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {analytics.account.profilePictureUrl ? (
                    <img 
                      src={analytics.account.profilePictureUrl} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-semibold">@{analytics.account.username}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                      <span>{analytics.account.followersCount.toLocaleString()} followers</span>
                      <span>{analytics.account.followingCount.toLocaleString()} following</span>
                    </div>
                    {analytics.account.lastSyncAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last synced: {new Date(analytics.account.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                title="Total Posts" 
                value={analytics.stats.totalPosts}
                icon={Image}
                subtitle="Last 30 days"
              />
              <StatCard 
                title="Total Likes" 
                value={analytics.stats.totalLikes}
                icon={Heart}
              />
              <StatCard 
                title="Comments" 
                value={analytics.stats.totalComments}
                icon={MessageCircle}
              />
              <StatCard 
                title="Avg Engagement" 
                value={analytics.stats.avgEngagement}
                icon={TrendingUp}
                subtitle="per post"
              />
            </div>

            {analytics.stats.totalReach > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reach & Impressions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Reach</span>
                      <span>{analytics.stats.totalReach.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min((analytics.stats.totalReach / analytics.account.followersCount) * 100, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Impressions</span>
                      <span>{analytics.stats.totalImpressions.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min((analytics.stats.totalImpressions / (analytics.account.followersCount * 2)) * 100, 100)} />
                  </div>
                </CardContent>
              </Card>
            )}

            {analytics.recentMedia && analytics.recentMedia.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Posts</h3>
                <div className="grid grid-cols-3 gap-2">
                  {analytics.recentMedia.map((media) => (
                    <MediaCard key={media.id} media={media} />
                  ))}
                </div>
              </div>
            )}

            {analytics.dailyStats && analytics.dailyStats.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Daily Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.dailyStats.slice(0, 7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Image className="w-3 h-3 text-muted-foreground" />
                            {day.posts}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-muted-foreground" />
                            {day.likes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available yet.</p>
            <Button 
              className="mt-4"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              Sync Instagram Data
            </Button>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
