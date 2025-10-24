// 触摸手势检测 Hook

import { useEffect, RefObject } from 'react';
import { Direction } from '@/types/game';

interface SwipeConfig {
  minSwipeDistance?: number; // 最小滑动距离（像素）
  maxSwipeTime?: number;     // 最大滑动时间（毫秒）
}

export function useSwipe(
  elementRef: RefObject<HTMLElement>,
  onSwipe: (direction: Direction) => void,
  config: SwipeConfig = {}
) {
  const {
    minSwipeDistance = 30, // 最小30px才算有效滑动
    maxSwipeTime = 1000,   // 1秒内的滑动才有效
  } = config;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 阻止默认的滚动行为
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const elapsedTime = touchEndTime - touchStartTime;

      // 检查滑动时间是否在有效范围内
      if (elapsedTime > maxSwipeTime) {
        return;
      }

      // 计算滑动距离
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // 检查是否达到最小滑动距离
      if (absDx < minSwipeDistance && absDy < minSwipeDistance) {
        return;
      }

      // 判断滑动方向（哪个方向的距离更大）
      if (absDx > absDy) {
        // 水平滑动
        if (dx > 0) {
          onSwipe('right');
        } else {
          onSwipe('left');
        }
      } else {
        // 垂直滑动
        if (dy > 0) {
          onSwipe('down');
        } else {
          onSwipe('up');
        }
      }
    };

    // 添加事件监听器
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 清理函数
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, onSwipe, minSwipeDistance, maxSwipeTime]);
}
