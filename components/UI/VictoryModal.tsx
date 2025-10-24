// 胜利弹窗组件 - 包含用户名输入和分数提交

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitScore } from '@/lib/supabase';
import { useGameStore } from '@/store/gameStore';

interface VictoryModalProps {
  isVisible: boolean;
  score: number;
  collectedLetters: string[];
  onClose: () => void;
}

export default function VictoryModal({
  isVisible,
  score,
  collectedLetters,
  onClose,
}: VictoryModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { restart, moveCount } = useGameStore();

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      setError('请输入玩家名称');
      return;
    }

    if (playerName.length > 20) {
      setError('名称不能超过20个字符');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitScore({
        playerName: playerName.trim(),
        score,
        maxTile: 1024,
        lettersCollected: collectedLetters,
        isVictory: true,
        playTime: moveCount,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || '提交失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请检查连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    restart();
    onClose();
    setPlayerName('');
    setSubmitted(false);
    setError('');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 庆祝图标 */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                恭喜你！
              </h2>
              <div className="text-5xl font-bold bg-gradient-to-r from-trae-blue via-trae-red to-trae-purple bg-clip-text text-transparent my-4">
                T R A E   1 0 2 4
              </div>
              <p className="text-xl text-gray-700 mb-2">
                The Real AI Engineer!
              </p>
            </div>

            {/* 分数显示 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">最大方块:</span>
                <span className="text-3xl font-bold text-yellow-600">
                  {score}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600 text-sm">移动次数:</span>
                <span className="text-lg font-semibold text-emerald-600">
                  {moveCount} 步
                </span>
              </div>
            </div>

            {/* 用户名输入 */}
            {!submitted ? (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  输入你的名字上榜 🏆
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="请输入玩家名称（最多20字）"
                  maxLength={20}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-trae-blue focus:outline-none text-lg transition-colors"
                  disabled={isSubmitting}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
            ) : (
              <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-2xl">✓</span>
                  <span className="font-semibold">
                    {playerName} 已成功上榜！
                  </span>
                </div>
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-3">
              {!submitted ? (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !playerName.trim()}
                    className="flex-1 bg-gradient-to-r from-trae-blue to-trae-purple text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '提交中...' : '提交到排行榜'}
                  </button>
                  <button
                    onClick={handlePlayAgain}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    跳过
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePlayAgain}
                    className="flex-1 bg-gradient-to-r from-trae-blue to-trae-purple text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    再来一局
                  </button>
                  <a
                    href="/leaderboard"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-center"
                  >
                    查看排行榜
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
