// TRAE 字母系统逻辑

import { TileValue, Letter, LetterEffect } from '@/types/game';
import { GRID_SIZE } from './game-logic';

// 字母效果定义
export const letterEffects: Record<Letter, LetterEffect> = {
  T: {
    letter: 'T',
    name: 'Think (思考)',
    description: '显示下一个将生成的方块（预览3秒）',
    color: '#0084FF',
    execute: (board) => board, // T效果在UI层实现
  },
  R: {
    letter: 'R',
    name: 'Real (真实)',
    description: '碰撞的数字方块×2',
    color: '#FF3B30',
    execute: (board) => board, // R效果在碰撞时实现
  },
  A: {
    letter: 'A',
    name: 'Adaptive (自适应)',
    description: '自动执行一次最优移动',
    color: '#34C759',
    execute: (board) => board, // A效果需要AI算法
  },
  E: {
    letter: 'E',
    name: 'Engineer (工程师)',
    description: '获得一次撤销机会',
    color: '#AF52DE',
    execute: (board) => board, // E效果在状态管理层实现
  },
};

// 检查是否可以收集字母
export function canCollectLetter(
  letter: Letter,
  collectedLetters: Letter[]
): boolean {
  const letterSequence: Letter[] = ['T', 'R', 'A', 'E'];
  const currentIndex = collectedLetters.length;
  
  // 必须按顺序收集
  if (currentIndex >= 4) return false;
  
  const expectedLetter = letterSequence[currentIndex];
  return letter === expectedLetter;
}

// 收集字母
export function collectLetter(
  letter: Letter,
  collectedLetters: Letter[]
): {
  newCollectedLetters: Letter[];
  collected: boolean;
} {
  if (!canCollectLetter(letter, collectedLetters)) {
    return { newCollectedLetters: collectedLetters, collected: false };
  }
  
  const newCollectedLetters = [...collectedLetters, letter];
  return { newCollectedLetters, collected: true };
}

// 应用R字母效果（数字×2）
export function applyREffect(value: number): number {
  return value * 2;
}

// 应用A字母效果（最优移动推荐）
export function suggestBestMove(
  board: (TileValue | null)[][]
): 'up' | 'down' | 'left' | 'right' | null {
  // 简单策略：优先向角落移动
  // 实际项目中可以使用Minimax或Monte Carlo算法
  
  // 检查右下角是否有最大值
  const maxValue = getMaxValue(board);
  const bottomRight = board[GRID_SIZE - 1][GRID_SIZE - 1];
  
  if (typeof bottomRight === 'number' && bottomRight === maxValue) {
    // 优先向下和向右移动
    return 'down';
  }
  
  // 否则尝试将最大值移向右下角
  return 'right';
}

// 获取棋盘最大数值
function getMaxValue(board: (TileValue | null)[][]): number {
  let max = 0;
  for (const row of board) {
    for (const cell of row) {
      if (typeof cell === 'number' && cell > max) {
        max = cell;
      }
    }
  }
  return max;
}

// 获取字母方块的样式类名
export function getLetterClassName(letter: Letter): string {
  const baseClass = 'letter-tile';
  const letterClasses: Record<Letter, string> = {
    T: 'letter-t bg-gradient-to-br from-trae-blue to-blue-400',
    R: 'letter-r bg-gradient-to-br from-trae-red to-red-400',
    A: 'letter-a bg-gradient-to-br from-trae-green to-green-400',
    E: 'letter-e bg-gradient-to-br from-trae-purple to-purple-400',
  };
  
  return `${baseClass} ${letterClasses[letter]}`;
}

// 获取收集进度百分比
export function getCollectionProgress(collectedLetters: Letter[]): number {
  return (collectedLetters.length / 4) * 100;
}

// 检查字母是否在序列中
export function isLetter(value: TileValue): value is Letter {
  return typeof value === 'string' && ['T', 'R', 'A', 'E'].includes(value);
}

// 获取下一个应该收集的字母
export function getNextLetter(collectedLetters: Letter[]): Letter | null {
  const letterSequence: Letter[] = ['T', 'R', 'A', 'E'];
  if (collectedLetters.length >= 4) return null;
  return letterSequence[collectedLetters.length];
}
