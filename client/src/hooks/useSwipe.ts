import { useState, useCallback, useRef } from "react";

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 75 }: UseSwipeOptions): SwipeHandlers {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, [role='button']")) {
      touchStartX.current = null;
      return;
    }
    
    touchEndX.current = null;
    isHorizontalSwipe.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    if (isHorizontalSwipe.current === null && touchStartY.current !== null) {
      const deltaX = Math.abs(currentX - touchStartX.current);
      const deltaY = Math.abs(currentY - touchStartY.current);
      
      if (deltaX > 10 || deltaY > 10) {
        isHorizontalSwipe.current = deltaX > deltaY * 1.5;
      }
    }
    
    if (isHorizontalSwipe.current) {
      touchEndX.current = currentX;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current || !isHorizontalSwipe.current) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      isHorizontalSwipe.current = null;
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    isHorizontalSwipe.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
