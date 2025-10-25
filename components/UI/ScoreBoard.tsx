// 分数显示组件

'use client';

import { useGameStore } from '@/store/gameStore';

export default function ScoreBoard() {
  const { score, moveCount } = useGameStore();

  return (
    <div className="flex gap-4">
      <ScoreBox label="最大方块" value={score} />
      <ScoreBox
        label="当前步数"
        value={moveCount}
        highlight
      />
    </div>
  );
}

function ScoreBox({ label, value, highlight = false }: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        bg-white rounded-lg px-6 py-3 shadow-md min-w-[120px]
        ${highlight ? 'border-2 border-yellow-400' : ''}
      `}
    >
      <div className="text-sm text-gray-600 uppercase font-semibold">
        {label}
      </div>
      <div
        className={`
          text-3xl font-bold
          ${highlight ? 'text-yellow-600' : 'text-gray-800'}
        `}
      >
        {value}
      </div>
    </div>
  );
}
