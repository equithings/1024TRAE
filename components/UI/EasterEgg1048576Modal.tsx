// 1024×1024 彩蛋提交面板

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, markGameAsSubmitted } from '@/store/gameStore';
import { submitScore } from '@/lib/supabase';
import { getOrCreatePlayerId } from '@/lib/player-identity';

interface EasterEgg1048576ModalProps {
  isVisible: boolean;
}

export default function EasterEgg1048576Modal({ isVisible }: EasterEgg1048576ModalProps) {
  const { score, collectedLetters, moveCount, restart } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 提交分数
  const handleSubmit = async () => {
    if (!playerName.trim()) {
      setSubmitError('请输入玩家名称');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    // 获取或创建玩家唯一标识符
    const playerId = getOrCreatePlayerId();

    const result = await submitScore({
      playerName: playerName.trim(),
      score,
      maxTile: score,
      lettersCollected: ['TRAENB4EVER'], // 彩蛋特殊标记
      isVictory: true,
      playTime: 1024, // 彩蛋固定步数
      isEasterEgg: true, // 标记为彩蛋
      playerId, // 玩家唯一标识符
    });

    setSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      // 标记游戏已提交
      markGameAsSubmitted();
      // 2秒后自动重新开始
      setTimeout(() => {
        restart();
      }, 2000);
    } else {
      setSubmitError(result.error || '提交失败，请重试');
    }
  };

  // 结束游戏（不提交）
  const handleEndGame = () => {
    restart();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400"
          >
            {!submitSuccess ? (
              <>
                {/* 彩蛋标题 */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1.1, 1.1, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    className="text-8xl mb-4"
                  >
                    👑
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-red-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    恭喜发现彩蛋！
                  </h2>
                  <p className="text-lg text-gray-700 font-semibold">
                    1024 × 1024 = 终极成就
                  </p>
                </div>

                {/* 彩蛋信息 */}
                <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">当前分数:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {(score / 1024).toFixed(0)} × 1024
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">移动次数:</span>
                    <span className="text-xl font-semibold text-blue-600">{moveCount} 步</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">字母收集:</span>
                    <span className="text-sm font-mono font-bold text-emerald-600">
                      {collectedLetters.join(' → ') || '无'}
                    </span>
                  </div>
                </div>

                {/* 错误提示 */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
                  >
                    {submitError}
                  </motion.div>
                )}

                {/* 玩家名称输入 */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    输入您的名称（可选）
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="匿名玩家"
                    maxLength={20}
                    disabled={submitting}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-center font-semibold"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {submitting ? '提交中...' : '🎁 提交排行榜'}
                  </button>
                  <button
                    onClick={handleEndGame}
                    disabled={submitting}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    🏁 结束游戏
                  </button>
                </div>

                {/* 提示文字 */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  💡 提示：选择"提交排行榜"将以彩蛋身份上榜
                </p>
              </>
            ) : (
              /* 提交成功 */
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="text-8xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">提交成功！</h3>
                <p className="text-gray-600">您的成就已被记录</p>
                <p className="text-sm text-gray-500 mt-4">正在重新开始游戏...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
