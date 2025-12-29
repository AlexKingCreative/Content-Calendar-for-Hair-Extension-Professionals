import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Check, Star, Zap, Clock } from "lucide-react";

interface BuildingScheduleAnimationProps {
  onComplete: () => void;
  duration?: number;
}

const FLOATING_ICONS = [
  { Icon: Calendar, delay: 0, x: -60, y: -40 },
  { Icon: Star, delay: 0.2, x: 80, y: -30 },
  { Icon: Sparkles, delay: 0.4, x: -80, y: 20 },
  { Icon: Zap, delay: 0.6, x: 60, y: 50 },
  { Icon: Clock, delay: 0.8, x: -40, y: 60 },
  { Icon: Calendar, delay: 1.0, x: 90, y: -60 },
];

const STEPS = [
  "Analyzing your services...",
  "Curating content ideas...",
  "Building your custom schedule...",
  "Adding hashtags & captions...",
  "Finalizing 365 days of content...",
];

export function BuildingScheduleAnimation({ onComplete, duration = 3000 }: BuildingScheduleAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    const stepDuration = duration / STEPS.length;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    const completeTimer = setTimeout(() => {
      setShowComplete(true);
      setTimeout(onComplete, 500);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
              scale: Math.random() * 2 + 0.5,
            }}
            animate={{
              y: -10,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-8 px-6">
        <div className="relative">
          <motion.div
            className="relative flex items-center justify-center w-32 h-32"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/40"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-gradient-to-r from-primary/30 to-primary/50"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: 360,
              }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
            />
            <motion.div
              className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg"
              animate={showComplete ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {showComplete ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="calendar"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Calendar className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {FLOATING_ICONS.map(({ Icon, delay, x, y }, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5],
                x: [0, x * 0.5, x, x * 1.2],
                y: [0, y * 0.5, y, y * 1.2],
              }}
              transition={{
                duration: 2.5,
                delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <Icon className="w-5 h-5 text-primary/60" />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {showComplete ? "Your Schedule is Ready!" : "Building Your Calendar"}
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {showComplete ? "365 days of personalized content" : STEPS[currentStep]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="w-64"
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Personalizing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </motion.div>

        <motion.div
          className="flex gap-3 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
