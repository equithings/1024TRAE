// 游戏状态管理 (Zustand)

import { create } from 'zustand';
import {
  createEmptyBoard,
  initializeBoard,
  move as gameMove,
  addRandomTile,
  canMove,
  checkVictory,
  getMaxTile,
} from '@/lib/game-logic';
import {
  canCollectLetter,
  collectLetter,
  applyREffect,
  applyTEffect,
  applyAEffect,
  applyEEffect,
  applySpecialEffect1,
  applySpecialEffect2,
  isLetter,
} from '@/lib/letter-system';
import { playSound, playSoundDebounced } from '@/lib/sounds';
import { vibrate, VibrationPatterns } from '@/lib/vibration';
import { TileValue, Letter, Direction, GameHistory } from '@/types/game';

interface GameStore {
  // 游戏状态
  board: (TileValue | null)[][];
  score: number;
  bestScore: number;
  collectedLetters: Letter[];
  isGameOver: boolean;
  isVictory: boolean;
  showVictoryDialog: boolean; // 显示胜利弹窗
  continueAfterVictory: boolean; // 胜利后继续游戏
  canUndo: boolean;
  moveCount: number;
  startTime: number;
  minTileValue: number; // 最小方块值（N/B字母效果）
  isEasterEgg1024: boolean; // 1024×1024 隐藏彩蛋标记
  movesSinceLastLetter: number; // 自上次出现字母后的移动次数（用于保底机制）

  // 1024步彩蛋按键序列状态
  firstTime1048576Achieved: boolean; // 是否首次达到 1024 步（彩蛋2触发条件）
  easterEggKeySequence: Direction[]; // 彩蛋按键序列记录
  showEasterEgg1048576Modal: boolean; // 是否显示 1024步彩蛋提交面板

  // 字母效果状态
  showPreview: boolean; // T字母效果
  previewValue: TileValue | null;
  undoAvailable: boolean; // E字母效果

  // 合并动画状态
  mergedPosition: { row: number; col: number } | null;

  // 字母触发动画状态
  letterEffectTriggered: boolean; // 是否触发字母效果动画
  lastGeneratedLetter: Letter | null; // 最后生成的字母（用于提示）

  // 历史记录
  history: GameHistory[];

  // Actions
  initGame: () => void;
  move: (direction: Direction) => void;
  undo: () => void;
  restart: () => void;
  setBestScore: (score: number) => void;
  continueGame: () => void; // 继续游戏
  endGame: () => void; // 结束游戏
}

const BEST_SCORE_KEY = 'trae-1024-best-score';
const GAME_STATE_KEY = 'trae-1024-game-state';

// 从localStorage读取最高分
const loadBestScore = (): number => {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(BEST_SCORE_KEY);
  return saved ? parseInt(saved, 10) : 0;
};

// 保存最高分到localStorage
const saveBestScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BEST_SCORE_KEY, score.toString());
};

// 从localStorage加载游戏状态
const loadGameState = (): Partial<GameStore> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

// 保存游戏状态到localStorage
const saveGameState = (state: GameStore): void => {
  if (typeof window === 'undefined') return;
  try {
    const stateToSave = {
      board: state.board,
      score: state.score,
      collectedLetters: state.collectedLetters,
      isGameOver: state.isGameOver,
      isVictory: state.isVictory,
      showVictoryDialog: state.showVictoryDialog,
      continueAfterVictory: state.continueAfterVictory,
      moveCount: state.moveCount,
      startTime: state.startTime,
      minTileValue: state.minTileValue,
      isEasterEgg1024: state.isEasterEgg1024,
      // 不保存 movesSinceLastLetter 和 lastGeneratedLetter（每次会话重新计数）
      showPreview: state.showPreview,
      previewValue: state.previewValue,
      undoAvailable: state.undoAvailable,
      canUndo: state.canUndo,
      history: state.history,
      hasSubmitted: false, // 默认未提交，只在实际提交时标记为 true
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

// 清除游戏状态
const clearGameState = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GAME_STATE_KEY);
};

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  board: createEmptyBoard(),
  score: 0,
  bestScore: 0, // 服务端渲染时初始为0，客户端会在initGame中加载
  collectedLetters: [],
  isGameOver: false,
  isVictory: false,
  showVictoryDialog: false,
  continueAfterVictory: false,
  canUndo: false,
  moveCount: 0,
  startTime: Date.now(),
  minTileValue: 4,
  isEasterEgg1024: false,
  movesSinceLastLetter: 0,
  firstTime1048576Achieved: false,
  easterEggKeySequence: [],
  showEasterEgg1048576Modal: false,
  showPreview: false,
  previewValue: null,
  undoAvailable: false,
  history: [],
  mergedPosition: null,
  letterEffectTriggered: false,
  lastGeneratedLetter: null,

  // 初始化游戏
  initGame: () => {
    const savedBestScore = loadBestScore(); // 客户端加载最高分
    const savedGameState = loadGameState(); // 加载保存的游戏状态

    // 检查保存的游戏状态
    // 如果已经提交过榜单，清除状态并开始新游戏
    if (savedGameState && (savedGameState as any).hasSubmitted) {
      clearGameState();
      const board = initializeBoard();
      set({
        board,
        score: 0,
        bestScore: savedBestScore,
        collectedLetters: [],
        isGameOver: false,
        isVictory: false,
        showVictoryDialog: false,
        continueAfterVictory: false,
        canUndo: false,
        moveCount: 0,
        startTime: Date.now(),
        minTileValue: 4,
        showPreview: false,
        previewValue: null,
        undoAvailable: false,
        history: [],
        mergedPosition: null,
        isEasterEgg1024: false,
        letterEffectTriggered: false,
        movesSinceLastLetter: 0,
        lastGeneratedLetter: null,
        firstTime1048576Achieved: false,
        easterEggKeySequence: [],
        showEasterEgg1048576Modal: false,
      });
      return;
    }

    // 如果有保存的游戏状态且未提交过，恢复它；否则创建新游戏
    if (savedGameState && savedGameState.board) {
      set({
        ...savedGameState,
        bestScore: savedBestScore, // 使用加载的最高分
        mergedPosition: null, // 不恢复动画状态
        letterEffectTriggered: false, // 不恢复动画状态
        movesSinceLastLetter: 0, // 重置字母计数器（不跨会话保留）
        lastGeneratedLetter: null, // 清除上次生成的字母提示
        firstTime1048576Achieved: false, // 不跨会话保留
        easterEggKeySequence: [], // 不跨会话保留
        showEasterEgg1048576Modal: false, // 不跨会话保留
      });
    } else {
      const board = initializeBoard();
      set({
        board,
        score: 0,
        bestScore: savedBestScore,
        collectedLetters: [],
        isGameOver: false,
        isVictory: false,
        showVictoryDialog: false,
        continueAfterVictory: false,
        canUndo: false,
        moveCount: 0,
        startTime: Date.now(),
        minTileValue: 4,
        showPreview: false,
        previewValue: null,
        undoAvailable: false,
        history: [],
        mergedPosition: null,
        isEasterEgg1024: false,
        letterEffectTriggered: false,
        movesSinceLastLetter: 0,
        lastGeneratedLetter: null,
        firstTime1048576Achieved: false,
        easterEggKeySequence: [],
        showEasterEgg1048576Modal: false,
      });
    }
  },

  // 移动
  move: (direction: Direction) => {
    const state = get();
    // 如果游戏结束，不允许移动
    if (state.isGameOver) return;
    // 如果已胜利但未选择继续游戏，不允许移动
    if (state.isVictory && !state.continueAfterVictory) return;

    // 保存当前状态到历史
    const currentState: GameHistory = {
      board: state.board.map(row => [...row]),
      score: state.score,
      collectedLetters: [...state.collectedLetters],
    };

    let { newBoard, moved, mergedScore, mergeCount, letterCollisions, mergedPosition } = gameMove(
      state.board,
      direction,
      state.collectedLetters
    );

    if (!moved) return; // 没有移动，不做任何操作

    // 移动音效：只要执行了移动操作就播放
    playSoundDebounced('move', 0.3);

    // 合并音效和震动：根据合并次数选择
    if (mergeCount >= 2) {
      // 连续合并（2次以上）：使用合并音效和更强震动
      playSoundDebounced('continue', 0.4);
      vibrate(VibrationPatterns.multiMerge);
    } else if (mergeCount === 1) {
      // 单次合并：使用合并音效和震动
      playSoundDebounced('continue', 0.4);
      vibrate(VibrationPatterns.singleMerge);
    }

    // 【方案1】处理字母碰撞
    let newCollectedLetters = [...state.collectedLetters];
    let showPreviewFlag = state.showPreview;
    let previewValueFlag = state.previewValue;
    let undoAvailableFlag = state.undoAvailable;
    let newMinTileValue = state.minTileValue;
    let letterEffectTriggered = false; // 字母效果是否触发

    for (const collision of letterCollisions) {
      const { letter, value } = collision;

      // 彩蛋字母 N 和 B 可以直接收集
      if (letter === 'N' || letter === 'B') {
        newCollectedLetters = [...newCollectedLetters, letter];

        // 应用彩蛋字母效果
        if (letter === 'N') {
          newBoard = applySpecialEffect1(newBoard);
          newMinTileValue = 128;
          letterEffectTriggered = true; // 标记字母效果触发
          vibrate(VibrationPatterns.letterCollect); // 触发震动
        } else if (letter === 'B') {
          newBoard = applySpecialEffect2(newBoard);
          newMinTileValue = 512;
          letterEffectTriggered = true; // 标记字母效果触发
          vibrate(VibrationPatterns.letterCollect); // 触发震动
        }
        continue;
      }

      // 检查是否可以收集（必须按顺序）
      if (canCollectLetter(letter, newCollectedLetters)) {
        // 收集字母
        const result = collectLetter(letter, newCollectedLetters);
        if (result.collected) {
          newCollectedLetters = result.newCollectedLetters;
          letterEffectTriggered = true; // 标记字母效果触发
          vibrate(VibrationPatterns.letterCollect); // 触发震动

          // 应用字母效果
          switch (letter) {
            case 'T':
              // Think - 将所有数字从大到小重新排列
              newBoard = applyTEffect(newBoard);
              break;

            case 'R':
              // Real - 碰撞时数字已经×2了，这里不需要额外操作
              break;

            case 'A':
              // Adaptive - 消除<32的方块，生成8个32的方块
              newBoard = applyAEffect(newBoard);
              break;

            case 'E':
              // Engineer - 保留最大数字×4，清除其他所有数字
              newBoard = applyEEffect(newBoard);
              break;
          }
        }
      }
    }

    // 添加随机方块（带保底机制）
    const { success: tileAdded, letterGenerated } = addRandomTile(
      newBoard,
      newCollectedLetters,
      newMinTileValue,
      state.movesSinceLastLetter + 1
    );

    // 如果生成了字母，重置计数器；否则递增
    const newMovesSinceLastLetter = letterGenerated !== null ? 0 : state.movesSinceLastLetter + 1;

    // 计算当前最大数字作为分数
    const newScore = getMaxTile(newBoard);
    const newBestScore = Math.max(state.bestScore, newScore);

    // 🎁 隐藏彩蛋检测：分数=1024 且 步数=512
    const isEasterEgg = newScore === 1024 && state.moveCount + 1 === 512;

    // 检查胜利条件（只在未选择继续游戏时才设置胜利状态）
    const victoryConditionMet = checkVictory(newBoard, newCollectedLetters) || isEasterEgg;
    const victory = !state.continueAfterVictory && victoryConditionMet;

    // 检查是否应该显示胜利弹窗（首次达到胜利条件）
    const shouldShowVictoryDialog = victoryConditionMet && !state.continueAfterVictory && !state.showVictoryDialog;

    // 检查失败条件
    const gameOver = !canMove(newBoard);

    // === 🎁 1024步彩蛋按键序列检测 ===
    let newFirstTime1048576Achieved = state.firstTime1048576Achieved;
    let newEasterEggKeySequence = [...state.easterEggKeySequence];
    let showEasterEgg1048576Modal = false;

    // 检测是否首次达到 1024 步
    if (!state.firstTime1048576Achieved && state.moveCount + 1 >= 1024) {
      newFirstTime1048576Achieved = true;
    }

    // 如果已经达到 1024 步，开始记录按键序列
    if (newFirstTime1048576Achieved && !state.showEasterEgg1048576Modal) {
      // 添加当前方向到序列
      newEasterEggKeySequence.push(direction);

      // 保持序列最多 4 个按键
      if (newEasterEggKeySequence.length > 4) {
        newEasterEggKeySequence.shift();
      }

      // 检查序列是否为：上、下、左、右
      const targetSequence: Direction[] = ['up', 'down', 'left', 'right'];
      const sequenceMatched = newEasterEggKeySequence.length === 4 &&
        newEasterEggKeySequence.every((dir, index) => dir === targetSequence[index]);

      // 如果序列匹配且游戏没有失败，触发彩蛋
      if (sequenceMatched && !gameOver) {
        showEasterEgg1048576Modal = true;
        vibrate(VibrationPatterns.letterCollect); // 震动反馈
      }
    }

    // 保存最高分
    if (newBestScore > state.bestScore) {
      saveBestScore(newBestScore);
    }

    const newState = {
      board: newBoard,
      score: newScore,
      bestScore: newBestScore,
      collectedLetters: newCollectedLetters,
      isVictory: victory,
      showVictoryDialog: shouldShowVictoryDialog,
      isGameOver: gameOver,
      moveCount: state.moveCount + 1,
      minTileValue: newMinTileValue,
      canUndo: state.undoAvailable,
      showPreview: showPreviewFlag,
      previewValue: previewValueFlag,
      undoAvailable: undoAvailableFlag,
      history: [...state.history, currentState].slice(-10), // 保留最近10步
      mergedPosition: mergedPosition, // 设置合并位置
      letterEffectTriggered: letterEffectTriggered, // 设置字母效果触发状态
      isEasterEgg1024: isEasterEgg, // 标记彩蛋状态
      movesSinceLastLetter: newMovesSinceLastLetter, // 更新计数器
      lastGeneratedLetter: letterGenerated, // 记录生成的字母
      firstTime1048576Achieved: newFirstTime1048576Achieved, // 1024步彩蛋状态
      easterEggKeySequence: newEasterEggKeySequence, // 按键序列
      showEasterEgg1048576Modal: showEasterEgg1048576Modal, // 彩蛋提交面板显示状态
    };

    set(newState);
    
    // 保存游戏状态到localStorage
    saveGameState(get());
    
    // 200ms 后清除合并位置，结束动画
    if (mergedPosition !== null) {
      setTimeout(() => {
        set({ mergedPosition: null });
      }, 200);
    }
    
    // 300ms 后清除字母效果触发状态，结束全局动画
    if (letterEffectTriggered) {
      setTimeout(() => {
        set({ letterEffectTriggered: false });
      }, 300);
    }

    // 如果生成了字母，3秒后清除提示
    if (letterGenerated !== null) {
      setTimeout(() => {
        set({ lastGeneratedLetter: null });
      }, 3000);
    }
  },

  // 撤销
  undo: () => {
    const state = get();
    if (!state.canUndo || state.history.length === 0) return;

    const lastState = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);

    set({
      board: lastState.board,
      score: lastState.score,
      collectedLetters: lastState.collectedLetters,
      history: newHistory,
      canUndo: false,
      undoAvailable: false,
    });
    
    // 保存游戏状态到localStorage
    saveGameState(get());
  },

  // 重新开始
  restart: () => {
    // 清除保存的游戏状态
    clearGameState();
    // 初始化新游戏
    const board = initializeBoard();
    const savedBestScore = loadBestScore();

    set({
      board,
      score: 0,
      bestScore: savedBestScore,
      collectedLetters: [],
      isGameOver: false,
      isVictory: false,
      showVictoryDialog: false,
      continueAfterVictory: false,
      canUndo: false,
      moveCount: 0,
      startTime: Date.now(),
      minTileValue: 4,
      showPreview: false,
      previewValue: null,
      undoAvailable: false,
      history: [],
      mergedPosition: null,
      isEasterEgg1024: false,
      movesSinceLastLetter: 0,
      lastGeneratedLetter: null,
      firstTime1048576Achieved: false,
      easterEggKeySequence: [],
      showEasterEgg1048576Modal: false,
    });
  },

  // 设置最高分
  setBestScore: (score: number) => {
    saveBestScore(score);
    set({ bestScore: score });
  },

  // 继续游戏
  continueGame: () => {
    set({
      showVictoryDialog: false,
      continueAfterVictory: true,
      isVictory: false, // 重置胜利状态，允许继续移动
    });
    
    // 保存游戏状态到localStorage
    saveGameState(get());
  },

  // 结束游戏（如果满足通关条件则提交排行榜）
  endGame: () => {
    const state = get();

    // 🎁 隐藏彩蛋检测：分数=1024 且 步数=512
    const isEasterEgg = state.score === 1024 && state.moveCount === 512;

    // 检查是否满足通关条件：收集完 TRAE + 分数不低于 1024
    const hasAllLetters = state.collectedLetters.includes('T') &&
                          state.collectedLetters.includes('R') &&
                          state.collectedLetters.includes('A') &&
                          state.collectedLetters.includes('E');
    const has1024 = state.score >= 1024;
    const meetsVictoryCondition = hasAllLetters && has1024;

    set({
      showVictoryDialog: false,
      isGameOver: true,
      isVictory: meetsVictoryCondition || isEasterEgg, // 彩蛋也算胜利
      isEasterEgg1024: isEasterEgg, // 标记彩蛋状态
    });
    
    // 保存游戏状态到localStorage
    saveGameState(get());
  },
}));

// 导出标记游戏已提交的函数
export const markGameAsSubmitted = () => {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      state.hasSubmitted = true;
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error('Failed to mark game as submitted:', error);
  }
};
