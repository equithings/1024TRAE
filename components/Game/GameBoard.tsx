// 游戏棋盘组件

'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSwipe } from '@/hooks/useSwipe';
import Tile from './Tile';
import MoveIndicator from './MoveIndicator';
import { Direction } from '@/types/game';

export default function GameBoard() {
  const { board, move, initGame } = useGameStore();
  const [lastDirection, setLastDirection] = useState<Direction | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 处理移动（统一的移动处理函数）
  const handleMove = (direction: Direction) => {
    setLastDirection(direction);
    move(direction);
    // 清除方向指示
    setTimeout(() => setLastDirection(null), 300);
  };

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果用户正在输入框中输入，不触发游戏控制
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // 触摸手势控制
  useSwipe(boardRef, handleMove, {
    minSwipeDistance: 30,
    maxSwipeTime: 1000,
  });

  return (
    <div
      ref={boardRef}
      className="relative bg-[#BBADA0] rounded-lg
                 w-full max-w-[460px] aspect-square
                 min-w-[320px]
                 mx-auto
                 touch-none select-none"
    >
      {/* 移动方向指示器 */}
      <MoveIndicator direction={lastDirection} />
      
      {/* 网格背景和方块层 */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 absolute inset-0 p-2 sm:p-3">
        {Array.from({ length: 25 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const cellValue = board[row][col];

          return (
            <div
              key={i}
              className="relative w-full aspect-square rounded-lg bg-[#CDC1B4]"
            >
              {/* 如果该位置有方块，在这里渲染 */}
              {cellValue !== null && (
                <Tile
                  key={`${row}-${col}-${cellValue}`}
                  value={cellValue}
                  position={{ row, col }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
