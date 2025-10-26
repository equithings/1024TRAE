// 游戏核心逻辑

import { TileValue, Direction, Letter } from '@/types/game';

export const GRID_SIZE = 4;

// 初始化空棋盘
export function createEmptyBoard(): (TileValue | null)[][] {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
}

// 初始化游戏棋盘（包含2个初始方块）
export function initializeBoard(): (TileValue | null)[][] {
  const board = createEmptyBoard();
  addRandomTile(board, [], 4, 0);
  addRandomTile(board, [], 4, 0);
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

// 获取最大数字方块的位置
function getMaxTilePosition(board: (TileValue | null)[][]): [number, number] | null {
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

  return maxPosition;
}

// 获取某个位置左右相邻的空位置
function getAdjacentEmptyPositions(
  board: (TileValue | null)[][],
  position: [number, number]
): [number, number][] {
  const [row, col] = position;
  const adjacentPositions: [number, number][] = [];

  // 左边
  if (col > 0 && board[row][col - 1] === null) {
    adjacentPositions.push([row, col - 1]);
  }
  // 右边
  if (col < GRID_SIZE - 1 && board[row][col + 1] === null) {
    adjacentPositions.push([row, col + 1]);
  }

  return adjacentPositions;
}

// 添加随机方块（带保底机制）
export function addRandomTile(
  board: (TileValue | null)[][],
  collectedLetters: Letter[],
  minTileValue: number = 4,
  movesSinceLastLetter: number = 0
): { success: boolean; letterGenerated: Letter | null } {
  const emptyPositions = getEmptyPositions(board);
  if (emptyPositions.length === 0) return { success: false, letterGenerated: null };

  // 生成逻辑
  const rand = Math.random();

  // 检查棋盘上是否已有字母
  const letterCount = board.flat().filter(v =>
    typeof v === 'string' && ['T', 'R', 'A', 'E', 'N', 'B'].includes(v)
  ).length;

  // 保底机制阈值（步数）
  const guaranteedThresholds: Record<number, number> = {
    0: 20,   // T 字母保底 20 步
    1: 40,   // R 字母保底 40 步
    2: 60,   // A 字母保底 60 步
    3: 120,  // E 字母保底 120 步
  };

  const guaranteedThresholdsEaster: Record<string, number> = {
    'N': 512,   // N 字母保底 512 步
    'B': 1024,  // B 字母保底 1024 步
  };

  // 【彩蛋字母生成逻辑】只在收集完 TRAE 之后，且每个字母只出现 1 次
  if (letterCount === 0 && collectedLetters.length >= 4) {
    const hasCollectedN = collectedLetters.includes('N');
    const hasCollectedB = collectedLetters.includes('B');

    // B 字母：保底 1024 步或 0.05% 概率
    if (!hasCollectedB && (movesSinceLastLetter >= guaranteedThresholdsEaster['B'] || rand < 0.0005)) {
      const targetPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      const [row, col] = targetPosition;
      board[row][col] = 'B';
      return { success: true, letterGenerated: 'B' };
    }

    // N 字母：保底 512 步或 0.2% 概率
    if (!hasCollectedN && (movesSinceLastLetter >= guaranteedThresholdsEaster['N'] || (rand >= 0.0005 && rand < 0.0025))) {
      const targetPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      const [row, col] = targetPosition;
      board[row][col] = 'N';
      return { success: true, letterGenerated: 'N' };
    }
  }

  // 【TRAE 字母生成逻辑】保底机制 + 原有概率
  if (collectedLetters.length < 4 && letterCount === 0) {
    const letterSequence: Letter[] = ['T', 'R', 'A', 'E'];
    const nextLetter = letterSequence[collectedLetters.length];
    const threshold = guaranteedThresholds[collectedLetters.length];

    // 根据已收集字母数量决定概率：T=10%, R=5%, A=3%, E=1%
    const letterProbabilities: Record<number, number> = {
      0: 0.10,  // T 的概率 10%
      1: 0.05,  // R 的概率 5%
      2: 0.03,  // A 的概率 3%
      3: 0.01,  // E 的概率 1%
    };
    const letterProbability = letterProbabilities[collectedLetters.length] || 0;

    // 触发条件：达到保底步数 或 随机概率命中
    if (movesSinceLastLetter >= threshold || rand < letterProbability) {
      let targetPosition: [number, number];

      // R 字母特殊处理：优先生成在最大数字方块的左右
      if (nextLetter === 'R') {
        const maxPosition = getMaxTilePosition(board);
        if (maxPosition !== null) {
          const adjacentPositions = getAdjacentEmptyPositions(board, maxPosition);
          if (adjacentPositions.length > 0) {
            targetPosition = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
          } else {
            targetPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
          }
        } else {
          targetPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        }
      } else {
        targetPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      }

      const [row, col] = targetPosition;
      board[row][col] = nextLetter;
      return { success: true, letterGenerated: nextLetter };
    }
  }

  // 根据最小方块值生成数字方块
  const [row, col] = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  if (minTileValue >= 128) {
    // N 字母效果：最小方块为 128
    board[row][col] = rand < 0.7 ? 128 : 256;
  } else if (minTileValue >= 512) {
    // B 字母效果：最小方块为 512
    board[row][col] = rand < 0.7 ? 512 : 1024;
  } else {
    // 默认：70%生成4，30%生成8
    board[row][col] = rand < 0.7 ? 4 : 8;
  }
  return { success: true, letterGenerated: null };
}

// 计算一行中数字的数量（不包括字母和null）
function countNumbersInLine(line: (TileValue | null)[]): number {
  let count = 0;
  for (const cell of line) {
    if (typeof cell === 'number') {
      count++;
    }
  }
  return count;
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
  mergedPosition: { row: number; col: number } | null; // 新增：合并位置
} {
  let newBoard = board.map(row => [...row]);
  let moved = false;
  let mergedScore = 0;
  const letterCollisions: { letter: Letter; value: number }[] = [];
  let mergedPosition: { row: number; col: number } | null = null;

  // 根据方向旋转棋盘，统一向左移动
  newBoard = rotateBoard(newBoard, direction);

  // 🔄 迭代式合并：对每一行持续移动/合并，直到稳定
  for (let row = 0; row < GRID_SIZE; row++) {
    // 检测当前行的数字数量
    const numberCount = countNumbersInLine(newBoard[row]);

    if (numberCount === 1) {
      // ✅ 只有1个数字：只执行1次moveLine（避免一次性移动多格）
      const { line, lineMoved, score, collisions, mergedCol } = moveLine(newBoard[row], collectedLetters);

      if (lineMoved) {
        moved = true;
        mergedScore += score;
        letterCollisions.push(...collisions);
        newBoard[row] = line;

        // 记录合并位置
        if (mergedCol !== null) {
          mergedPosition = { row, col: mergedCol };
        }
      }
    } else {
      // ✅ 多个数字：使用迭代式合并（保持"合并优先"机制）
      let rowMoved = true;

      // 持续移动当前行，直到无法再移动或合并
      while (rowMoved) {
        const { line, lineMoved, score, collisions, mergedCol } = moveLine(newBoard[row], collectedLetters);
        rowMoved = lineMoved;

        if (lineMoved) {
          moved = true;
          mergedScore += score;
          letterCollisions.push(...collisions);
          newBoard[row] = line;

          // 记录合并位置（只记录最后一次合并）
          if (mergedCol !== null) {
            mergedPosition = { row, col: mergedCol };
          }
        }
      }
    }
  }

  // 如果有合并位置，转换回原始方向的坐标
  if (mergedPosition !== null) {
    mergedPosition = reverseRotatePosition(mergedPosition, direction);
  }

  // 旋转回原方向
  newBoard = rotateBoard(newBoard, direction, true);

  return { newBoard, moved, mergedScore, letterCollisions, mergedPosition };
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
  mergedCol: number | null; // 合并发生的列位置
} {
  const newLine: (TileValue | null)[] = [...line];
  let lineMoved = false;
  let score = 0;
  const collisions: { letter: Letter; value: number }[] = [];
  const letterSequence: Letter[] = ['T', 'R', 'A', 'E'];
  const expectedLetter = collectedLetters.length < 4 ? letterSequence[collectedLetters.length] : null;
  let mergedCol: number | null = null;

  // 步骤1：先尝试合并 - 从右到左扫描，找相邻相同的数字
  let merged = false;
  for (let i = GRID_SIZE - 1; i > 0; i--) {
    const rightValue = newLine[i];
    const leftValue = newLine[i - 1];
    
    if (rightValue === null || leftValue === null) continue;
    
    // 情况1：左边是数字，右边是字母
    if (typeof leftValue === 'number' && typeof rightValue === 'string' && ['T', 'R', 'A', 'E', 'N', 'B'].includes(rightValue)) {
      // R 字母特殊处理：撞击任意数字都会×2
      // 彩蛋字母 N 和 B：可以直接碰撞收集
      if (rightValue === 'R' || rightValue === expectedLetter || rightValue === 'N' || rightValue === 'B') {
        collisions.push({ letter: rightValue as Letter, value: leftValue });
        newLine[i - 1] = leftValue * 2; // 左边数字×2
        newLine[i] = null; // 右边字母消失
        lineMoved = true;
        merged = true;
        mergedCol = i - 1; // 记录合并位置
        break; // 本次只处理一次合并
      }
    }
    // 情况2：左边是字母，右边是数字
    else if (typeof leftValue === 'string' && ['T', 'R', 'A', 'E', 'N', 'B'].includes(leftValue) && typeof rightValue === 'number') {
      // R 字母特殊处理：撞击任意数字都会×2
      // 彩蛋字母 N 和 B：可以直接碰撞收集
      if (leftValue === 'R' || leftValue === expectedLetter || leftValue === 'N' || leftValue === 'B') {
        collisions.push({ letter: leftValue as Letter, value: rightValue });
        newLine[i - 1] = rightValue * 2; // 数字×2放在左边
        newLine[i] = null; // 右边消失
        lineMoved = true;
        merged = true;
        mergedCol = i - 1; // 记录合并位置
        break; // 本次只处理一次合并
      }
    }
    // 情况3：数字合并逻辑
    else if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      let canMerge = false;
      let mergedValue = 0;

      // 标准合并：两个相同数字
      if (leftValue === rightValue) {
        canMerge = true;
        mergedValue = leftValue * 2;
      }
      // 特殊合并：两个都是1024的偶数倍（且都 >= 2048）
      else if (leftValue >= 2048 && rightValue >= 2048) {
        const leftMultiple = leftValue / 1024;
        const rightMultiple = rightValue / 1024;

        // 检查是否都是1024的整数倍且都是偶数倍
        if (
          leftValue % 1024 === 0 &&
          rightValue % 1024 === 0 &&
          leftMultiple % 2 === 0 &&
          rightMultiple % 2 === 0
        ) {
          canMerge = true;
          mergedValue = leftValue + rightValue; // 两数相加
        }
      }

      if (canMerge) {
        newLine[i - 1] = mergedValue; // 合并结果放在左边
        score += mergedValue;
        newLine[i] = null; // 右边消失
        lineMoved = true;
        merged = true;
        mergedCol = i - 1; // 记录合并位置
        break; // 本次只处理一次合并
      }
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

  return { line: newLine, lineMoved, score, collisions, mergedCol };
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

  // 检查最大方块是否>=1024（而不是检查是否存在1024方块）
  // 因为可能已经合成更大的方块（2048, 4096等）或触发E字母效果（×4）
  const maxTile = getMaxTile(board);
  const has1024OrMore = maxTile >= 1024;

  return hasAllLetters && has1024OrMore;
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

// 将旋转后的位置转换回原始方向的坐标
function reverseRotatePosition(
  position: { row: number; col: number },
  direction: Direction
): { row: number; col: number } {
  const { row, col } = position;
  const n = GRID_SIZE;
  
  switch (direction) {
    case 'up':
      // 向上：逆时针90度 → 还原：顺时针90度
      return { row: col, col: n - 1 - row };
    case 'down':
      // 向下：顺时针90度 → 还原：逆时针90度
      return { row: n - 1 - col, col: row };
    case 'left':
      // 向左：不旋转 → 还原：不旋转
      return { row, col };
    case 'right':
      // 向右：180度 → 还原：180度
      return { row: n - 1 - row, col: n - 1 - col };
  }
}
