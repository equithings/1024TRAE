// 移动方向指示器组件

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoveIndicatorProps {
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

export default function MoveIndicator({ direction }: MoveIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (direction) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [direction]);

  if (!direction || !visible) return null;

  const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  };

  const positions = {
    up: 'top-2 left-1/2 -translate-x-1/2',
    down: 'bottom-2 left-1/2 -translate-x-1/2',
    left: 'left-2 top-1/2 -translate-y-1/2',
    right: 'right-2 top-1/2 -translate-y-1/2',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className={`absolute ${positions[direction]} text-5xl text-trae-blue filter drop-shadow-lg z-10 pointer-events-none`}
      >
        {arrows[direction]}
      </motion.div>
    </AnimatePresence>
  );
}
