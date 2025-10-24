// 游戏核心逻辑

import { TileValue, Direction, Letter } from '@/types/game';

export const GRID_SIZE = 5;

// 初始化空棋盘
export function createEmptyBoard(): (TileValue | null)[][] {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
}

// 初始化游戏棋盘（包含2个初始方块）
export function initializeBoard(): (TileValue | null)[][] {
  const board = createEmptyBoard();
  addRandomTile(board, []);
  addRandomTile(board, []);
  return board;
}

// 获取空位置
export function getEmptyPositions(board: (TileValue | null)[][]): [number, number][] {
  const positions: [number, number][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === null) {
        positions.push([row, col]);
      }
    }
  }
  return positions;
}

// 添加随机方块
export function addRandomTile(
  board: (TileValue | null)[][],
  collectedLetters: Letter[]
): boolean {
  const emptyPositions = getEmptyPositions(board);
  if (emptyPositions.length === 0) return false;

  const [row, col] = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  
  // 生成逻辑
  const rand = Math.random();

  // 根据已收集字母数量决定概率：T/R/A=15%，E=5%
  let letterProbability = 0.15; // T, R, A 的概率
  if (collectedLetters.length === 3) {
    letterProbability = 0.05; // E 的概率为5%
  }

  // 生成字母（如果还未集齐且棋盘上没有字母）
  if (rand < letterProbability && collectedLetters.length < 4) {
    const letterSequence: Letter[] = ['T', 'R', 'A', 'E'];
    const nextLetter = letterSequence[collectedLetters.length];

    // 检查棋盘上是否已有字母（方案1：同时最多只有1个字母）
    const letterCount = board.flat().filter(v =>
      typeof v === 'string' && ['T', 'R', 'A', 'E'].includes(v)
    ).length;

    if (letterCount === 0) {
      board[row][col] = nextLetter;
      return true;
    }
  }
  
  // 70%生成4，30%生成8（移除2，最低从4开始）
  board[row][col] = rand < 0.7 ? 4 : 8;
  return true;
}

// 移动逻辑
export function move(
  board: (TileValue | null)[][],
  direction: Direction,
  collectedLetters: Letter[]
): {
  newBoard: (TileValue | null)[][];
  moved: boolean;
  mergedScore: number;
  letterCollisions: { letter: Letter; value: number }[]; // 新增：记录字母碰撞
} {
  let newBoard = board.map(row => [...row]);
  let moved = false;
  let mergedScore = 0;
  const letterCollisions: { letter: Letter; value: number }[] = [];

  // 根据方向旋转棋盘，统一向左移动
  newBoard = rotateBoard(newBoard, direction);

  for (let row = 0; row < GRID_SIZE; row++) {
    const { line, lineMoved, score, collisions } = moveLine(newBoard[row], collectedLetters);
    if (lineMoved) moved = true;
    mergedScore += score;
    letterCollisions.push(...collisions);
    newBoard[row] = line;
  }

  // 旋转回原方向
  newBoard = rotateBoard(newBoard, direction, true);

  return { newBoard, moved, mergedScore, letterCollisions };
}

// 移动单行（向左）- 逐格移动策略：每次只移动一格，移动时立即合并
// 移动单行（向左）- 逐格移动策略：从右到左扫描，找到相邻相同的就合并（左边×2，右边消失），否则就移动
function moveLine(
  line: (TileValue | null)[],
  collectedLetters: Letter[]
): {
  line: (TileValue | null)[];
  lineMoved: boolean;
  score: number;
  collisions: { letter: Letter; value: number }[]; // 字母碰撞记录
} {
  const newLine: (TileValue | null)[] = [...line];
  let lineMoved = false;
  let score = 0;
  const collisions: { letter: Letter; value: number }[] = [];
  const letterSequence: Letter[] = ['T', 'R', 'A', 'E'];
  const expectedLetter = collectedLetters.length < 4 ? letterSequence[collectedLetters.length] : null;

  // 步骤1：先尝试合并 - 从右到左扫描，找相邻相同的数字
  let merged = false;
  for (let i = GRID_SIZE - 1; i > 0; i--) {
    const rightValue = newLine[i];
    const leftValue = newLine[i - 1];
    
    if (rightValue === null || leftValue === null) continue;
    
    // 情况1：左边是数字，右边是字母
    if (typeof leftValue === 'number' && typeof rightValue === 'string' && ['T', 'R', 'A', 'E'].includes(rightValue)) {
      if (rightValue === expectedLetter) {
        collisions.push({ letter: rightValue as Letter, value: leftValue });
        newLine[i - 1] = leftValue * 2; // 左边数字×2
        newLine[i] = null; // 右边字母消失
        lineMoved = true;
        merged = true;
        break; // 本次只处理一次合并
      }
    }
    // 情况2：左边是字母，右边是数字
    else if (typeof leftValue === 'string' && ['T', 'R', 'A', 'E'].includes(leftValue) && typeof rightValue === 'number') {
      if (leftValue === expectedLetter) {
        collisions.push({ letter: leftValue as Letter, value: rightValue });
        newLine[i - 1] = rightValue * 2; // 数字×2放在左边
        newLine[i] = null; // 右边消失
        lineMoved = true;
        merged = true;
        break; // 本次只处理一次合并
      }
    }
    // 情况3：两个相同数字合并到左边
    else if (typeof leftValue === 'number' && typeof rightValue === 'number' && leftValue === rightValue) {
      newLine[i - 1] = leftValue * 2; // 左边×2
      score += leftValue * 2;
      newLine[i] = null; // 右边消失
      lineMoved = true;
      merged = true;
      break; // 本次只处理一次合并
    }
  }

  // 步骤2：如果没有合并发生，则尝试移动（从左到右找空格，把右边的移过来）
  if (!merged) {
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      if (newLine[i] !== null) continue; // 当前位置有方块，跳过
      
      const rightValue = newLine[i + 1];
      if (rightValue === null) continue; // 右边没有方块，跳过
      
      // 右边有方块，移动到当前空格位置
      newLine[i] = rightValue;
      newLine[i + 1] = null;
      lineMoved = true;
      break; // 本次只移动一个方块
    }
  }

  return { line: newLine, lineMoved, score, collisions };
}

// 旋转棋盘
function rotateBoard(
  board: (TileValue | null)[][],
  direction: Direction,
  reverse: boolean = false
): (TileValue | null)[][] {
  let rotations = 0;
  
  if (!reverse) {
    switch (direction) {
      case 'up': rotations = 3; break;    // 向上：逆时针90度（相当于顺时针270度）
      case 'down': rotations = 1; break;  // 向下：顺时针90度
      case 'left': rotations = 0; break;  // 向左：不旋转
      case 'right': rotations = 2; break; // 向右：180度
    }
  } else {
    switch (direction) {
      case 'up': rotations = 1; break;    // 还原：顺时针90度
      case 'down': rotations = 3; break;  // 还原：顺时针270度
      case 'left': rotations = 0; break;  // 还原：不旋转
      case 'right': rotations = 2; break; // 还原：180度
    }
  }

  let result = board;
  for (let i = 0; i < rotations; i++) {
    result = rotateClockwise(result);
  }
  return result;
}

// 顺时针旋转90度
function rotateClockwise(board: (TileValue | null)[][]): (TileValue | null)[][] {
  const n = board.length;
  const rotated = Array(n).fill(null).map(() => Array(n).fill(null));
  
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      rotated[col][n - 1 - row] = board[row][col];
    }
  }
  
  return rotated;
}

// 检查是否有可移动的步数
export function canMove(board: (TileValue | null)[][]): boolean {
  // 有空位就能移动
  if (getEmptyPositions(board).length > 0) return true;

  // 检查是否有相邻的相同数字可以合并
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = board[row][col];
      if (typeof current === 'number') {
        // 检查右边
        if (col < GRID_SIZE - 1 && board[row][col + 1] === current) {
          return true;
        }
        // 检查下边
        if (row < GRID_SIZE - 1 && board[row + 1][col] === current) {
          return true;
        }
      }
    }
  }

  return false;
}

// 检查胜利条件
export function checkVictory(
  board: (TileValue | null)[][],
  collectedLetters: Letter[]
): boolean {
  const hasAllLetters = 
    collectedLetters.length === 4 &&
    collectedLetters.join('') === 'TRAE';
  
  const has1024 = board.flat().some(cell => cell === 1024);
  
  return hasAllLetters && has1024;
}

// 获取最大方块值
export function getMaxTile(board: (TileValue | null)[][]): number {
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

// 工具函数：比较数组
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// 计算理论最大分数（用于防刷分验证）
export function calculateTheoreticalMaxScore(maxTile: number): number {
  let total = 0;
  let tile = 4;
  while (tile <= maxTile) {
    total += tile;
    tile *= 2;
  }
  return total * 16; // 粗略估计
}
