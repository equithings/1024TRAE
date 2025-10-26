// TRAE字母收集进度条组件

'use client';

import { useGameStore } from '@/store/gameStore';
import { Letter } from '@/types/game';
import { getNextLetter } from '@/lib/letter-system';

export default function ProgressBar() {
  const { collectedLetters } = useGameStore();
  const mainLetters: Letter[] = ['T', 'R', 'A', 'E'];
  const bonusLetters: Letter[] = ['N', 'B'];
  const nextLetter = getNextLetter(collectedLetters);

  const letterColors: Record<Letter, string> = {
    T: 'from-trae-blue to-blue-400',
    R: 'from-trae-red to-red-400',
    A: 'from-trae-green to-green-400',
    E: 'from-trae-purple to-purple-400',
    N: 'from-orange-500 to-orange-400',
    B: 'from-purple-600 to-purple-500',
  };

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-md">
      <span className="text-sm font-semibold text-gray-600">收集进度:</span>
      <div className="flex gap-2">
        {/* TRAE主字母 */}
        {mainLetters.map((letter) => {
          const isCollected = collectedLetters.includes(letter);
          const isNext = letter === nextLetter;
          const gradient = letterColors[letter];

          return (
            <div
              key={letter}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                text-white font-bold text-xl font-mono
                transition-all duration-300
                ${
                  isCollected
                    ? `bg-gradient-to-br ${gradient} scale-100`
                    : isNext
                    ? 'bg-gray-300 border-2 border-dashed border-gray-400 scale-95 animate-pulse'
                    : 'bg-gray-200 scale-90 opacity-50'
                }
              `}
            >
              {letter}
            </div>
          );
        })}

        {/* NB奖励字母（始终显示） */}
        <>
          <div className="w-px h-10 bg-gray-300 mx-1" />
          {bonusLetters.map((letter) => {
            const isCollected = collectedLetters.includes(letter);
            const gradient = letterColors[letter];

            return (
              <div
                key={letter}
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  text-white font-bold text-xl font-mono
                  transition-all duration-300
                  ${
                    isCollected
                      ? `bg-gradient-to-br ${gradient} scale-100 ring-2 ring-yellow-400 ring-offset-2`
                      : 'bg-gray-200 scale-90 opacity-40'
                  }
                `}
              >
                {letter}
              </div>
            );
          })}
        </>
      </div>
      <div className="flex-1" />
      <div className="hidden md:block text-right">
        <div className="text-sm text-gray-600">目标</div>
        <div className="text-2xl font-bold text-yellow-600">1024</div>
      </div>
    </div>
  );
}
