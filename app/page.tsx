'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GameBoard from '@/components/Game/GameBoard';
import ProgressBar from '@/components/UI/ProgressBar';
import ScoreBoard from '@/components/UI/ScoreBoard';
import VictoryModal from '@/components/UI/VictoryModal';
import { useGameStore } from '@/store/gameStore';
import { preloadSounds } from '@/lib/sounds';

export default function Home() {
  const { restart, isGameOver, isVictory, score, collectedLetters, moveCount } = useGameStore();
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // 监听胜利状态，显示弹窗
  useEffect(() => {
    if (isVictory) {
      setShowVictoryModal(true);
    }
  }, [isVictory]);

  // 预加载音效
  useEffect(() => {
    preloadSounds();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF8EF] to-[#F0EDE4] flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-2xl w-full space-y-3 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-[#32F08C] via-[#28D47C] to-[#1EB86C] bg-clip-text text-transparent mb-1 sm:mb-2">
            TRAE 1024
          </h1>
          <p className="text-sm sm:text-base text-gray-600">The Real AI Engineer Game</p>
        </div>

        {/* 进度条 */}
        <ProgressBar />

        {/* 分数和控制 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <ScoreBoard />
          <button
            onClick={restart}
            className="bg-gradient-to-r from-trae-primary to-emerald-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md text-sm sm:text-base w-full sm:w-auto"
          >
            🔄 重新开始
          </button>
        </div>

        {/* 游戏板 */}
        <div className="flex justify-center">
          <GameBoard />
        </div>

        {/* 操作提示 */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md text-center">
          <p className="text-gray-600 text-xs sm:text-sm">
            <span className="hidden sm:inline">
              使用 <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">↑</kbd>{' '}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">↓</kbd>{' '}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">←</kbd>{' '}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">→</kbd>{' '}
              或 <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">WASD</kbd> 移动方块
            </span>
            <span className="sm:hidden">👆 滑动屏幕移动方块</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            按顺序收集 T→R→A→E 字母（数字方块碰撞字母后×2），达成1024获得胜利！
          </p>
          <Link
            href="/leaderboard"
            className="inline-block mt-2 sm:mt-3 text-trae-blue hover:text-trae-purple transition-colors text-xs sm:text-sm font-semibold"
          >
            🏆 查看排行榜
          </Link>
        </div>

        {/* 胜利弹窗 - 包含用户名输入 */}
        <VictoryModal
          isVisible={showVictoryModal}
          score={score}
          collectedLetters={collectedLetters}
          onClose={() => setShowVictoryModal(false)}
        />

        {/* 失败提示 */}
        {isGameOver && !isVictory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold mb-2">游戏结束</h2>
              <p className="text-gray-600 mb-4">
                最大方块: <span className="font-bold text-2xl">{score}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                移动次数: {moveCount} | 收集进度: {collectedLetters.join(' → ') || '未收集'}
              </p>
              <button
                onClick={restart}
                className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                重新挑战
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
