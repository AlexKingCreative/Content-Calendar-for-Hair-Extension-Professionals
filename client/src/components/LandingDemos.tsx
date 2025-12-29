import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Calendar, Sparkles, Camera, Heart, Hash, Flame, Check, 
  Instagram, Send, Copy, Award, TrendingUp, Zap, Clock,
  MessageSquare, Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CalendarDemo() {
  const [currentDay, setCurrentDay] = useState(0);
  const days = [
    { day: 15, title: "Before & After Magic", category: "Transformation", hasPost: true },
    { day: 16, title: "Extension Care Tips", category: "Educational", hasPost: true },
    { day: 17, title: "Client Spotlight", category: "Testimonial", hasPost: true },
    { day: 18, title: "Behind the Scenes", category: "Personal", hasPost: false },
    { day: 19, title: "Holiday Glam Ideas", category: "Seasonal", hasPost: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDay((prev) => (prev + 1) % days.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" data-testid="demo-calendar">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-3xl blur-3xl" />
      <Card className="relative p-4 sm:p-6 max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold" data-testid="text-calendar-month">December 2025</div>
            <div className="text-xs text-muted-foreground">Your content calendar</div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4 text-center text-xs text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4" data-testid="calendar-grid">
          {Array.from({ length: 31 }, (_, i) => {
            const dayData = days.find(d => d.day === i + 1);
            const isActive = dayData && days.indexOf(dayData) === currentDay;
            return (
              <motion.div
                key={i}
                data-testid={`calendar-day-${i + 1}`}
                className={`aspect-square rounded-md flex items-center justify-center text-xs relative cursor-pointer
                  ${isActive ? "bg-primary text-primary-foreground" : dayData?.hasPost ? "bg-primary/20" : "hover:bg-muted"}
                `}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {i + 1}
                {dayData?.hasPost && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-muted/50 rounded-lg p-3 border"
            data-testid="calendar-post-preview"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs" data-testid="text-post-category">{days[currentDay].category}</Badge>
              <span className="text-xs text-muted-foreground" data-testid="text-post-date">Dec {days[currentDay].day}</span>
            </div>
            <div className="text-sm font-medium" data-testid="text-post-title">{days[currentDay].title}</div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" data-testid="button-demo-copy">
                <Copy className="w-3 h-3" /> Copy
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" data-testid="button-demo-ai-caption">
                <Sparkles className="w-3 h-3" /> AI Caption
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

export function AICaptionDemo() {
  const [stage, setStage] = useState(0);
  const caption = "Show your clients the magic of volume! These tape-in extensions added fullness without the weight. Perfect for fine hair types looking for that extra oomph.";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(stageInterval);
  }, []);

  useEffect(() => {
    if (stage === 2) {
      setDisplayedText("");
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < caption.length) {
          setDisplayedText(caption.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 20);
      return () => clearInterval(typeInterval);
    }
  }, [stage]);

  return (
    <div className="relative" data-testid="demo-ai-caption">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-primary/20 rounded-3xl blur-3xl" />
      <Card className="relative p-4 sm:p-6 max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI Caption Generator</div>
            <div className="text-xs text-muted-foreground">Powered by AI</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground mb-1">Post Type</div>
            <div className="text-sm font-medium flex items-center gap-2" data-testid="text-post-type">
              <Camera className="w-4 h-4 text-rose-500" />
              Before & After Transformation
            </div>
          </div>

          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <Button size="sm" className="gap-2" data-testid="button-generate-caption">
                  <Zap className="w-4 h-4" />
                  Generate Caption
                </Button>
              </motion.div>
            )}
            {stage === 1 && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
                data-testid="status-generating"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
                />
                <div className="text-sm text-muted-foreground">Creating your caption...</div>
              </motion.div>
            )}
            {(stage === 2 || stage === 3) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-primary/5 rounded-lg p-3 border border-primary/20"
                data-testid="caption-result"
              >
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">AI Generated</span>
                </div>
                <p className="text-sm leading-relaxed" data-testid="text-generated-caption">
                  {stage === 2 ? displayedText : caption}
                  {stage === 2 && <span className="animate-pulse">|</span>}
                </p>
                {stage === 3 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 mt-3"
                  >
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" data-testid="button-copy-caption">
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                    <Button size="sm" className="h-7 text-xs gap-1" data-testid="button-use-caption">
                      <Check className="w-3 h-3" /> Use This
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

export function StreakDemo() {
  const [streak, setStreak] = useState(0);
  const maxStreak = 7;
  const rewards = [
    { day: 3, label: "Bronze Badge", icon: Award },
    { day: 5, label: "Silver Badge", icon: Award },
    { day: 7, label: "50% Off!", icon: Zap },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStreak((prev) => (prev >= maxStreak ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" data-testid="demo-streak">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-3xl" />
      <Card className="relative p-4 sm:p-6 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">Posting Streak</div>
              <div className="text-xs text-muted-foreground">Keep it going!</div>
            </div>
          </div>
          <motion.div
            key={streak}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-orange-500"
            data-testid="text-streak-count"
          >
            {streak}
          </motion.div>
        </div>

        <div className="flex gap-1 mb-4" data-testid="streak-progress-bar">
          {Array.from({ length: maxStreak }, (_, i) => (
            <motion.div
              key={i}
              data-testid={`streak-day-${i + 1}`}
              className={`flex-1 h-2 rounded-full ${
                i < streak ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-muted"
              }`}
              animate={i < streak ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          ))}
        </div>

        <div className="space-y-2">
          {rewards.map((reward, i) => {
            const unlocked = streak >= reward.day;
            return (
              <motion.div
                key={i}
                data-testid={`reward-${reward.day}-day`}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  unlocked ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                }`}
                animate={unlocked && streak === reward.day ? { scale: [1, 1.05, 1] } : {}}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  unlocked ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                }`}>
                  <reward.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${unlocked ? "" : "text-muted-foreground"}`} data-testid={`text-reward-label-${reward.day}`}>
                    {reward.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{reward.day}-day streak</div>
                </div>
                {unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    data-testid={`icon-reward-unlocked-${reward.day}`}
                  >
                    <Check className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function InstagramDemo() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" data-testid="demo-instagram">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
      <Card className="relative p-4 sm:p-6 max-w-sm mx-auto overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">Instagram Integration</div>
            <div className="text-xs text-muted-foreground">Post directly from the app</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
              data-testid="instagram-stage-select"
            >
              <div className="aspect-video bg-gradient-to-br from-rose-200 to-amber-100 dark:from-rose-900 dark:to-amber-900 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <Button className="w-full gap-2" data-testid="button-post-instagram">
                <Send className="w-4 h-4" />
                Post to Instagram
              </Button>
            </motion.div>
          )}
          {stage === 1 && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
              data-testid="instagram-stage-preview"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                <span className="text-sm font-medium" data-testid="text-username">@yoursalon</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-rose-200 to-amber-100 dark:from-rose-900 dark:to-amber-900 rounded-lg" />
              <div className="text-xs text-muted-foreground line-clamp-2">
                Show your clients the magic of volume! These tape-in extensions...
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Button className="w-full gap-2" variant="default" data-testid="button-posting">
                  <Clock className="w-4 h-4" />
                  Posting...
                </Button>
              </motion.div>
            </motion.div>
          )}
          {stage === 2 && (
            <motion.div
              key="posted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6"
              data-testid="instagram-stage-posted"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 rounded-full bg-green-500 mx-auto mb-3 flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-lg font-semibold" data-testid="text-posted-status">Posted!</div>
              <div className="text-sm text-muted-foreground">Your content is now live</div>
            </motion.div>
          )}
          {stage === 3 && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
              data-testid="instagram-stage-stats"
            >
              <div className="text-xs text-muted-foreground mb-2">Engagement Stats</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Heart, label: "Likes", value: "247" },
                  { icon: MessageSquare, label: "Comments", value: "18" },
                  { icon: Share2, label: "Shares", value: "12" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-muted/50 rounded-lg p-2 text-center"
                    data-testid={`stat-${stat.label.toLowerCase()}`}
                  >
                    <stat.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-lg font-bold" data-testid={`text-${stat.label.toLowerCase()}-value`}>{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg" data-testid="status-engagement-change">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs">+23% engagement vs last week</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

export function HashtagDemo() {
  const [visible, setVisible] = useState(0);
  const hashtags = [
    { tag: "#HairExtensions", type: "Popular" },
    { tag: "#MiamiStylist", type: "Location" },
    { tag: "#TapeIns", type: "Specialty" },
    { tag: "#BlondeHair", type: "Style" },
    { tag: "#HairTransformation", type: "Trending" },
    { tag: "#ExtensionSpecialist", type: "Niche" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => (prev < hashtags.length ? prev + 1 : 0));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visible === 0) {
      const timeout = setTimeout(() => setVisible(1), 500);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <div className="relative" data-testid="demo-hashtags">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
      <Card className="relative p-4 sm:p-6 max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Hash className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">Smart Hashtags</div>
            <div className="text-xs text-muted-foreground">Personalized for you</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[120px]" data-testid="hashtag-container">
          {hashtags.slice(0, visible).map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <Badge 
                variant="secondary" 
                className="text-xs py-1 gap-1"
                data-testid={`hashtag-${i}`}
              >
                {h.tag}
                <span className="text-[10px] text-muted-foreground ml-1">{h.type}</span>
              </Badge>
            </motion.div>
          ))}
        </div>

        {visible >= hashtags.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-2 bg-primary/10 rounded-lg text-center"
            data-testid="button-copy-all-hashtags"
          >
            <div className="text-xs text-primary font-medium">
              Tap to copy all 6 hashtags
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
