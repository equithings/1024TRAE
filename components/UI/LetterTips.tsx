// 字母效果提示组件

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { letterEffects } from '@/lib/letter-system';

export default function LetterTips() {
  const [isExpanded, setIsExpanded] = useState(true); // 默认展开

  // 显示 TRAE + NB 六个字母的效果
  const mainLetters = ['T', 'R', 'A', 'E'] as const;
  const easterEggLetters = ['N', 'B'] as const;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 标题栏 - 可点击展开/收起 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-semibold text-gray-800">字母效果说明</span>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-500"
        >
          ▼
        </motion.span>
      </button>

      {/* 效果列表 - 可展开/收起 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* TRAE 字母 */}
              {mainLetters.map((letter) => {
                const effect = letterEffects[letter];
                return (
                  <div
                    key={letter}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200"
                  >
                    {/* 字母图标 */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md"
                      style={{ backgroundColor: effect.color }}
                    >
                      {letter}
                    </div>

                    {/* 效果说明 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm mb-1">
                        {effect.name}
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {effect.description}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* NB 彩蛋字母（显示为 ?） */}
              {easterEggLetters.map((letter) => {
                const effect = letterEffects[letter];
                return (
                  <div
                    key={letter}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 opacity-75"
                  >
                    {/* 字母图标显示为 ? */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md"
                      style={{ backgroundColor: effect.color }}
                    >
                      ?
                    </div>

                    {/* 效果说明 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm mb-1">
                        {effect.name}
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {effect.description}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 提示文字 */}
              <div className="text-xs text-gray-500 italic pt-2 border-t border-gray-200">
                💡 提示：必须按照 T → R → A → E 的顺序收集字母
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
