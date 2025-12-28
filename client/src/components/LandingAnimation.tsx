import { Calendar, Sparkles, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const contentCards = [
  { title: "Before & After", category: "Transformation", icon: Camera, color: "bg-rose-500" },
  { title: "Care Tips", category: "Educational", icon: Sparkles, color: "bg-blue-500" },
];

export function LandingAnimation() {
  return (
    <div className="relative w-full max-w-xs mx-auto h-[280px] sm:h-[320px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/20 rounded-3xl blur-3xl animate-pulse" />

      <div className="relative flex items-center justify-center h-full">
        <div className="relative w-[200px] sm:w-[220px] h-[280px] sm:h-[320px] bg-background border-4 border-foreground/10 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-b-2xl" />
          
          <div className="h-full pt-6 pb-2 px-2 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2 px-1 animate-slide-in-left">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Calendar className="w-3 h-3 text-primary-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-semibold">Today's Post</div>
              </div>
            </div>

            <div className="space-y-2 relative">
              {contentCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-card border rounded-lg p-2 shadow-sm animate-card-flow"
                  style={{ 
                    animationDelay: `${index * 1.5}s`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-md ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium truncate">{card.title}</div>
                      <Badge variant="secondary" className="text-[8px] px-1 py-0">
                        {card.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 px-1 animate-slide-in-up" style={{ animationDelay: "1s" }}>
              <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-medium">Your Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {["#Miami", "#TapIns"].map((tag, i) => (
                    <span
                      key={i}
                      className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full animate-pop-in"
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

      </div>
    </div>
  );
}
