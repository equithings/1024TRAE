// 胜利弹窗组件

'use client';

import { useGameStore } from '@/store/gameStore';

export default function VictoryDialog() {
  const { showVictoryDialog, continueGame, endGame } = useGameStore();

  if (!showVictoryDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-yellow-600 mb-4">🎉 恭喜通关！</h2>
          <p className="text-lg text-gray-700 mb-6">
            你已经成功收集了 <span className="font-bold text-trae-blue">T-R-A-E</span> 并达到了 <span className="font-bold text-yellow-600">1024</span>！
          </p>
          <p className="text-md text-gray-600 mb-8">
            你想继续游戏寻找隐藏彩蛋，还是现在结束游戏？
          </p>
          <div className="flex gap-4">
            <button
              onClick={continueGame}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              继续游戏
            </button>
            <button
              onClick={endGame}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              结束游戏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
