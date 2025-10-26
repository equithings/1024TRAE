// 胜利弹窗组件 - 包含用户名输入和分数提交

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { submitScore } from '@/lib/supabase';
import { useGameStore, markGameAsSubmitted } from '@/store/gameStore';
import { getOrCreatePlayerId } from '@/lib/player-identity';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { restart, moveCount, isEasterEgg1024 } = useGameStore();

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
      // 获取或创建玩家唯一标识符
      const playerId = getOrCreatePlayerId();

      // 🎁 彩蛋特殊处理：score=1024 且 moveCount=1024
      const submitData = isEasterEgg1024
        ? {
            playerName: playerName.trim(),
            score: 1024 * 1024, // 1024×1024 = 1048576
            maxTile: 1024,
            lettersCollected: ['TRAENB4EVER'], // 特殊字母显示
            isVictory: true,
            playTime: moveCount,
            isEasterEgg: true, // 标记为彩蛋
            playerId, // 玩家唯一标识符
          }
        : {
            playerName: playerName.trim(),
            score,
            maxTile: score, // 使用实际的最大方块值
            lettersCollected: collectedLetters,
            isVictory: true,
            playTime: moveCount,
            playerId, // 玩家唯一标识符
          };

      const result = await submitScore(submitData);

      if (result.success) {
        setSubmitted(true);
        // 标记游戏已提交榜单，下次启动时开始新游戏
        markGameAsSubmitted();
      } else {
        setError(result.error || '提交失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请检查连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 尝试跳过 - 如果未提交则显示确认对话框
  const handleTrySkip = () => {
    if (!submitted) {
      setShowConfirmDialog(true);
    } else {
      handleConfirmSkip();
    }
  };

  // 确认跳过 - 真正关闭并重新开始
  const handleConfirmSkip = () => {
    restart();
    onClose();
    setPlayerName('');
    setSubmitted(false);
    setError('');
    setShowConfirmDialog(false);
  };

  // 取消跳过 - 关闭确认对话框，返回提交界面
  const handleCancelSkip = () => {
    setShowConfirmDialog(false);
  };

  // 键盘快捷键支持（仅在弹窗显示时启用）
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在显示确认对话框，使用不同的快捷键
      if (showConfirmDialog) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCancelSkip(); // Enter = 返回提交
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleConfirmSkip(); // Esc = 确认跳过
        }
        return;
      }

      // 正常提交界面的快捷键
      if (!submitted) {
        if (e.key === 'Enter' && playerName.trim() && !isSubmitting) {
          e.preventDefault();
          handleSubmit(); // Enter = 提交
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleTrySkip(); // Esc = 跳过
        }
      } else {
        // 提交成功后的快捷键
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmSkip(); // Enter = 再来一局
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, showConfirmDialog, submitted, playerName, isSubmitting]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleTrySkip()}
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
                    <span className="hidden md:inline text-xs opacity-75 ml-2">(Enter)</span>
                  </button>
                  <button
                    onClick={handleTrySkip}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    跳过
                    <span className="hidden md:inline text-xs opacity-75 ml-2">(Esc)</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConfirmSkip}
                    className="flex-1 bg-gradient-to-r from-trae-blue to-trae-purple text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    再来一局
                    <span className="hidden md:inline text-xs opacity-75 ml-2">(Enter)</span>
                  </button>
                  <Link
                    href="/leaderboard"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-center flex items-center justify-center"
                  >
                    查看排行榜
                  </Link>
                </>
              )}
            </div>

            {/* 确认跳过对话框 */}
            <AnimatePresence>
              {showConfirmDialog && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
                  >
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">⚠️</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        确认跳过？
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        跳过后<span className="font-bold text-red-600">不会记录您的分数和排名</span>，
                        您将失去上榜的机会。
                      </p>
                      <p className="text-gray-500 text-sm mt-3">
                        确定要放弃提交成绩吗？
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelSkip}
                        className="flex-1 bg-gradient-to-r from-trae-blue to-trae-purple text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        返回提交
                        <span className="hidden md:inline text-xs opacity-75 ml-2">(Enter)</span>
                      </button>
                      <button
                        onClick={handleConfirmSkip}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        确认跳过
                        <span className="hidden md:inline text-xs opacity-75 ml-2">(Esc)</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
