// TRAE字母收集进度条组件

'use client';

import { useGameStore } from '@/store/gameStore';
import { Letter } from '@/types/game';
import { getNextLetter } from '@/lib/letter-system';

export default function ProgressBar() {
  const { collectedLetters } = useGameStore();
  const letters: Letter[] = ['T', 'R', 'A', 'E'];
  const nextLetter = getNextLetter(collectedLetters);

  const letterColors: Record<Letter, string> = {
    T: 'from-trae-blue to-blue-400',
    R: 'from-trae-red to-red-400',
    A: 'from-trae-green to-green-400',
    E: 'from-trae-purple to-purple-400',
  };

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-md">
      <span className="text-sm font-semibold text-gray-600">收集进度:</span>
      <div className="flex gap-2">
        {letters.map((letter) => {
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
              {isCollected ? letter : letter}
            </div>
          );
        })}
      </div>
      <div className="flex-1" />
      <div className="text-right">
        <div className="text-sm text-gray-600">目标</div>
        <div className="text-2xl font-bold text-yellow-600">1024</div>
      </div>
    </div>
  );
}
