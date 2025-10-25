'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GameBoard from '@/components/Game/GameBoard';
import ProgressBar from '@/components/UI/ProgressBar';
import ScoreBoard from '@/components/UI/ScoreBoard';
import VictoryModal from '@/components/UI/VictoryModal';
import VictoryDialog from '@/components/UI/VictoryDialog';
import LetterTips from '@/components/UI/LetterTips';
import LetterNotification from '@/components/UI/LetterNotification';
import EasterEgg1048576Modal from '@/components/UI/EasterEgg1048576Modal';
import { useGameStore } from '@/store/gameStore';
import { preloadSounds } from '@/lib/sounds';
import { mountDevTools } from '@/lib/devTools';

export default function Home() {
  const { restart, endGame, isGameOver, isVictory, score, collectedLetters, moveCount, continueAfterVictory, showEasterEgg1048576Modal } = useGameStore();
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // 监听胜利状态，只有在游戏结束时才显示提交弹窗
  // 如果选择了"继续游戏"后失败，也应该显示提交弹窗
  useEffect(() => {
    if ((isVictory && isGameOver) || (isGameOver && continueAfterVictory)) {
      setShowVictoryModal(true);
    } else {
      setShowVictoryModal(false);
    }
  }, [isVictory, isGameOver, continueAfterVictory]);

  // 预加载音效 & 挂载开发工具（仅开发环境）
  useEffect(() => {
    preloadSounds();
    // 🔒 只在开发环境挂载开发工具
    if (process.env.NODE_ENV === 'development') {
      mountDevTools();
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF8EF] to-[#F0EDE4] flex items-center justify-center p-2 sm:p-4">
      {/* 字母生成通知 */}
      <LetterNotification />

      <div className="max-w-5xl w-full space-y-3 sm:space-y-6">
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
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={restart}
              className="flex-1 sm:flex-none bg-gradient-to-r from-trae-primary to-emerald-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md text-sm sm:text-base"
            >
              🔄 重新开始
            </button>
            {/* 只有在选择继续游戏后才显示终止游戏按钮 */}
            {continueAfterVictory && (
              <button
                onClick={endGame}
                className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md text-sm sm:text-base"
              >
                🏁 终止游戏
              </button>
            )}
          </div>
        </div>

        {/* 排行榜链接 - 靠右显示 */}
        <div className="flex justify-end">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md text-trae-blue hover:text-trae-purple hover:bg-gray-50 transition-all text-sm sm:text-base font-semibold"
          >
            🏆 查看排行榜
          </Link>
        </div>

        {/* 游戏板和字母效果说明 - 并排显示 */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-start">
          {/* 左侧：游戏板 - PC端占60%-80%宽度 */}
          <div className="w-full lg:flex-1 lg:min-w-[60%] lg:max-w-[80%] flex justify-center">
            <GameBoard />
          </div>

          {/* 右侧：字母效果说明 - 占剩余空间 */}
          <div className="w-full lg:flex-shrink-0 lg:w-auto lg:min-w-[280px] lg:max-w-[320px]">
            <LetterTips />
          </div>
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
            按顺序收集 T→R→A→E 字母，分数打到1024，您可能会上榜，但也许会有更多可能
          </p>
        </div>

        {/* 胜利确认弹窗 - 询问是否继续游戏 */}
        <VictoryDialog />

        {/* 胜利弹窗 - 包含用户名输入 */}
        <VictoryModal
          isVisible={showVictoryModal}
          score={score}
          collectedLetters={collectedLetters}
          onClose={() => setShowVictoryModal(false)}
        />

        {/* 1024×1024 彩蛋提交面板 */}
        <EasterEgg1048576Modal isVisible={showEasterEgg1048576Modal} />

        {/* 失败提示 - 只在未达成胜利条件且未选择继续游戏时显示 */}
        {isGameOver && !isVictory && !continueAfterVictory && (
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
