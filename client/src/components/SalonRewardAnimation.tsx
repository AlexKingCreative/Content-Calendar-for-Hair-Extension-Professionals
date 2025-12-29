import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Gift, Coffee, Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SalonRewardAnimation() {
  const [currentDay, setCurrentDay] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentDay((prev) => {
        if (prev >= 6) {
          setShowReward(true);
          setTimeout(() => {
            setShowReward(false);
            setCurrentDay(0);
          }, 3000);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, showReward]);

  const resetAnimation = () => {
    setCurrentDay(0);
    setShowReward(false);
    setIsPlaying(true);
  };

  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-heading font-semibold text-foreground">Incentive Rewards</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Reward stylists who post 7 days in a row
        </p>
      </div>

      <div className="relative">
        <div className="flex justify-between gap-1 mb-4">
          {DAYS.map((day, index) => (
            <motion.div
              key={day}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  index <= currentDay
                    ? "bg-primary border-primary"
                    : "bg-muted border-muted-foreground/20"
                }`}
                initial={false}
                animate={
                  index === currentDay && index <= 6
                    ? { scale: [1, 1.2, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                {index <= currentDay ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                )}
              </motion.div>
              <span className="text-[10px] text-muted-foreground">{day}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 h-8">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">
            {currentDay + 1} day streak
          </span>
        </div>

        <AnimatePresence>
          {showReward && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-background/95 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                className="text-center"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <motion.div
                  className="relative mx-auto mb-3"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: 2
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <Coffee className="w-8 h-8 text-green-600" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Gift className="w-6 h-6 text-primary" />
                  </motion.div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-heading font-bold text-lg text-foreground">
                      Reward Earned!
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    7-day streak completed
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    $10 Starbucks Gift Card
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Set custom rewards for your team to keep them motivated
        </p>
      </div>
    </Card>
  );
}
