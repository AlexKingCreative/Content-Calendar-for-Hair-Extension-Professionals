import { Calendar, Hash, Heart, Sparkles, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const contentCards = [
  { title: "Before & After Magic", category: "Before & After", icon: Camera, color: "bg-rose-500" },
  { title: "Extension Care Tips", category: "Educational", icon: Sparkles, color: "bg-blue-500" },
  { title: "Client Transformation", category: "Inspiration", icon: Heart, color: "bg-amber-500" },
];

const floatingHashtags = [
  "#HairExtensions",
  "#HairTransformation", 
  "#ExtensionSpecialist",
  "#HairGoals",
  "#BeforeAndAfter",
];

export function LandingAnimation() {
  return (
    <div className="relative w-full max-w-lg mx-auto h-[500px] sm:h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/20 rounded-3xl blur-3xl animate-pulse" />

      <div className="relative flex items-center justify-center h-full">
        <div className="relative w-[280px] sm:w-[320px] h-[500px] sm:h-[580px] bg-background border-4 border-foreground/10 rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-b-2xl" />
          
          <div className="h-full pt-8 pb-4 px-3 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 px-2 animate-slide-in-left">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs font-semibold">Today's Post</div>
                <div className="text-[10px] text-muted-foreground">December 28</div>
              </div>
            </div>

            <div className="space-y-3 relative">
              {contentCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-card border rounded-xl p-3 shadow-sm animate-card-flow"
                  style={{ 
                    animationDelay: `${index * 1.5}s`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{card.title}</div>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                        {card.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1 text-xs">
                      <Heart className="w-3 h-3" />
                      <span>Copy</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Hash className="w-3 h-3" />
                      <span>Hashtags</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 px-1 animate-slide-in-up" style={{ animationDelay: "1s" }}>
              <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Your Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["#Miami", "#TapIns", "#GreatLengths"].map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full animate-pop-in"
                      style={{ animationDelay: `${1.5 + i * 0.2}s` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {floatingHashtags.map((tag, index) => (
          <div
            key={index}
            className="absolute text-xs bg-card/80 backdrop-blur-sm border rounded-full px-3 py-1 shadow-lg animate-float"
            style={{
              top: `${15 + (index * 18)}%`,
              left: index % 2 === 0 ? "-5%" : "auto",
              right: index % 2 === 1 ? "-5%" : "auto",
              animationDelay: `${0.5 + index * 0.8}s`,
            }}
          >
            <span className="text-primary font-medium">{tag}</span>
          </div>
        ))}

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 animate-slide-in-up" style={{ animationDelay: "2s" }}>
          <div className="flex items-center gap-2 bg-card border rounded-full px-4 py-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Post ready in seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
