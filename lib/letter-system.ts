// TRAE 字母系统逻辑

import { TileValue, Letter, LetterEffect } from '@/types/game';
import { GRID_SIZE } from './game-logic';

// 字母效果定义
export const letterEffects: Record<Letter, LetterEffect> = {
  T: {
    letter: 'T',
    name: 'Think (思考)',
    description: '将所有数字从大到小重新排列',
    color: '#0084FF',
    execute: applyTEffect,
  },
  R: {
    letter: 'R',
    name: 'Real (真实)',
    description: '碰撞任何数字都会×2',
    color: '#FF3B30',
    execute: (board) => board, // R效果在碰撞时实现
  },
  A: {
    letter: 'A',
    name: 'Adaptive (自适应)',
    description: '消除<32的方块，生成8个32方块',
    color: '#34C759',
    execute: applyAEffect,
  },
  E: {
    letter: 'E',
    name: 'Engineer (工程师)',
    description: '保留最大数字×4，清除其他',
    color: '#AF52DE',
    execute: applyEEffect,
  },
  N: {
    letter: 'N',
    name: '???',
    description: '???',
    color: '#34C759',
    execute: applySpecialEffect1,
  },
  B: {
    letter: 'B',
    name: '???',
    description: '???',
    color: '#34C759',
    execute: applySpecialEffect2,
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

// T字母效果：将所有数字从大到小重新排列（从左上到右下）
export function applyTEffect(board: (TileValue | null)[][]): (TileValue | null)[][] {
  const newBoard: (TileValue | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  // 收集所有数字方块
  const numbers: number[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (typeof cell === 'number') {
        numbers.push(cell);
      }
    }
  }

  // 从大到小排序
  numbers.sort((a, b) => b - a);

  // 从左上到右下依次填充
  let index = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (index < numbers.length) {
        newBoard[row][col] = numbers[index];
        index++;
      }
    }
  }

  return newBoard;
}

// R字母效果：碰撞时数字×2（在碰撞逻辑中实现）
export function applyREffect(value: number): number {
  return value * 2;
}

// A字母效果：消除所有小于32的方块，随机生成8个32的方块
export function applyAEffect(board: (TileValue | null)[][]): (TileValue | null)[][] {
  const newBoard: (TileValue | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  // 保留所有 >= 32 的方块
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (typeof cell === 'number' && cell >= 32) {
        newBoard[row][col] = cell;
      }
    }
  }

  // 找出所有空位置
  const emptyPositions: [number, number][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (newBoard[row][col] === null) {
        emptyPositions.push([row, col]);
      }
    }
  }

  // 随机选择最多8个位置生成32
  const count = Math.min(8, emptyPositions.length);
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const [row, col] = emptyPositions.splice(randomIndex, 1)[0];
    newBoard[row][col] = 32;
  }

  return newBoard;
}

// E字母效果：保留最大数字×4，清除其他所有数字
export function applyEEffect(board: (TileValue | null)[][]): (TileValue | null)[][] {
  const newBoard: (TileValue | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  // 找到最大数字及其位置
  let maxValue = 0;
  let maxPosition: [number, number] | null = null;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (typeof cell === 'number' && cell > maxValue) {
        maxValue = cell;
        maxPosition = [row, col];
      }
    }
  }

  // 如果找到最大值，将其×4并放在原位置
  if (maxPosition !== null) {
    const [row, col] = maxPosition;
    newBoard[row][col] = maxValue * 4;
  }

  return newBoard;
}

// 彩蛋效果1
export function applySpecialEffect1(board: (TileValue | null)[][]): (TileValue | null)[][] {
  const newBoard: (TileValue | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  // 找到最大数字
  let maxValue = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (typeof cell === 'number' && cell > maxValue) {
        maxValue = cell;
      }
    }
  }

  // 如果最大值 < 1024，生成一个 1024
  const targetValue = maxValue < 1024 ? 1024 : maxValue;

  // 保留所有 >= targetValue 的方块
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (typeof cell === 'number' && cell >= targetValue) {
        newBoard[row][col] = cell;
      }
    }
  }

  // 如果没有 1024 方块，添加一个
  if (maxValue < 1024) {
    const emptyPositions: [number, number][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newBoard[row][col] === null) {
          emptyPositions.push([row, col]);
        }
      }
    }
    if (emptyPositions.length > 0) {
      const [row, col] = emptyPositions[0];
      newBoard[row][col] = 1024;
    }
  }

  return newBoard;
}

// 彩蛋效果2
export function applySpecialEffect2(board: (TileValue | null)[][]): (TileValue | null)[][] {
  const newBoard: (TileValue | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  // 找到最大数字及其位置
  let maxValue = 0;
  let maxPosition: [number, number] | null = null;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (typeof cell === 'number' && cell > maxValue) {
        maxValue = cell;
        maxPosition = [row, col];
      }
    }
  }

  // 如果最大值 < 8192，将最大值变为 8192
  if (maxValue < 8192 && maxPosition !== null) {
    const [row, col] = maxPosition;
    newBoard[row][col] = 8192;
  } else if (maxPosition !== null) {
    // 保留原最大值
    const [row, col] = maxPosition;
    newBoard[row][col] = maxValue;
  }

  return newBoard;
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
    N: 'letter-n bg-gradient-to-br from-trae-green to-green-400',
    B: 'letter-b bg-gradient-to-br from-trae-green to-green-400',
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
