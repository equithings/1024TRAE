// 字母生成通知组件

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { letterEffects } from '@/lib/letter-system';
import { Letter } from '@/types/game';

const LETTER_NOTIFICATION_PREFIX = 'trae-1024-letter-notified-';

export default function LetterNotification() {
  const { lastGeneratedLetter } = useGameStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastGeneratedLetter !== null) {
      // 检查这个字母是否已经显示过通知
      const notificationKey = LETTER_NOTIFICATION_PREFIX + lastGeneratedLetter;
      const hasNotified = localStorage.getItem(notificationKey);

      if (!hasNotified) {
        // 首次显示这个字母的通知
        setVisible(true);
        // 标记为已通知
        localStorage.setItem(notificationKey, 'true');
      } else {
        // 已经显示过，不再显示
        setVisible(false);
      }
    } else {
      setVisible(false);
    }
  }, [lastGeneratedLetter]);

  if (!lastGeneratedLetter || !visible) return null;

  const effect = letterEffects[lastGeneratedLetter];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          className="fixed top-24 left-0 right-0 z-50 pointer-events-none flex justify-center"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border-4 p-6 flex items-center gap-4 w-[320px]"
            style={{ borderColor: effect.color }}
          >
            {/* 字母图标 */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
              style={{ backgroundColor: effect.color }}
            >
              {lastGeneratedLetter}
            </motion.div>

            {/* 文字内容 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✨</span>
                <span className="font-bold text-lg text-gray-800">
                  字母出现！
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {effect.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {effect.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
