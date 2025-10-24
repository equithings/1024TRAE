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
  isLetter,
} from '@/lib/letter-system';
import { playSound, playSoundDebounced } from '@/lib/sounds';
import { TileValue, Letter, Direction, GameHistory } from '@/types/game';

interface GameStore {
  // 游戏状态
  board: (TileValue | null)[][];
  score: number;
  bestScore: number;
  collectedLetters: Letter[];
  isGameOver: boolean;
  isVictory: boolean;
  canUndo: boolean;
  moveCount: number;
  startTime: number;
  
  // 字母效果状态
  showPreview: boolean; // T字母效果
  previewValue: TileValue | null;
  undoAvailable: boolean; // E字母效果
  
  // 历史记录
  history: GameHistory[];
  
  // Actions
  initGame: () => void;
  move: (direction: Direction) => void;
  undo: () => void;
  restart: () => void;
  setBestScore: (score: number) => void;
}

const BEST_SCORE_KEY = 'trae-1024-best-score';

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

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  board: createEmptyBoard(),
  score: 0,
  bestScore: 0, // 服务端渲染时初始为0，客户端会在initGame中加载
  collectedLetters: [],
  isGameOver: false,
  isVictory: false,
  canUndo: false,
  moveCount: 0,
  startTime: Date.now(),
  showPreview: false,
  previewValue: null,
  undoAvailable: false,
  history: [],

  // 初始化游戏
  initGame: () => {
    const board = initializeBoard();
    const savedBestScore = loadBestScore(); // 客户端加载最高分
    
    set({
      board,
      score: 0,
      bestScore: savedBestScore, // 使用加载的最高分
      collectedLetters: [],
      isGameOver: false,
      isVictory: false,
      canUndo: false,
      moveCount: 0,
      startTime: Date.now(),
      showPreview: false,
      previewValue: null,
      undoAvailable: false,
      history: [],
    });
  },

  // 移动
  move: (direction: Direction) => {
    const state = get();
    if (state.isGameOver || state.isVictory) return;

    // 保存当前状态到历史
    const currentState: GameHistory = {
      board: state.board.map(row => [...row]),
      score: state.score,
      collectedLetters: [...state.collectedLetters],
    };

    const { newBoard, moved, mergedScore, letterCollisions } = gameMove(
      state.board,
      direction,
      state.collectedLetters
    );

    if (!moved) return; // 没有移动，不做任何操作

    // 如果有合并，播放音效（使用防抖避免卡顿）
    if (mergedScore > 0) {
      playSoundDebounced('merge', 0.3);
    }

    // 【方案1】处理字母碰撞
    let newCollectedLetters = [...state.collectedLetters];
    let showPreviewFlag = state.showPreview;
    let previewValueFlag = state.previewValue;
    let undoAvailableFlag = state.undoAvailable;

    console.log('字母碰撞记录:', letterCollisions);
    console.log('当前已收集:', newCollectedLetters);

    for (const collision of letterCollisions) {
      const { letter, value } = collision;
      
      console.log(`处理碰撞: 字母${letter}, 数字${value}`);
      
      // 检查是否可以收集（必须按顺序）
      if (canCollectLetter(letter, newCollectedLetters)) {
        console.log(`可以收集字母${letter}`);
        // 收集字母
        const result = collectLetter(letter, newCollectedLetters);
        if (result.collected) {
          newCollectedLetters = result.newCollectedLetters;
          console.log(`成功收集字母${letter}, 现在已收集:`, newCollectedLetters);
          
          // 应用字母效果
          switch (letter) {
            case 'T':
              // Think - 显示下一个方块预览
              showPreviewFlag = true;
              previewValueFlag = 2;
              setTimeout(() => {
                set({ showPreview: false, previewValue: null });
              }, 3000);
              playSound('collect', 0.4);
              break;
            
            case 'R':
              // Real - 碰撞时数字已经×2了
              playSound('collect', 0.4);
              break;
            
            case 'A':
              // Adaptive - 可以后续添加AI提示
              playSound('collect', 0.4);
              break;
            
            case 'E':
              // Engineer - 获得撤销机会
              undoAvailableFlag = true;
              playSound('collect', 0.4);
              break;
          }
        } else {
          console.log(`收集字母${letter}失败`);
        }
      } else {
        console.log(`不能收集字母${letter}，当前已收集:`, newCollectedLetters);
      }
    }

    // 添加随机方块
    addRandomTile(newBoard, newCollectedLetters);

    // 计算当前最大数字作为分数
    const newScore = getMaxTile(newBoard);
    const newBestScore = Math.max(state.bestScore, newScore);

    // 检查胜利条件
    const victory = checkVictory(newBoard, newCollectedLetters);

    // 检查失败条件
    const gameOver = !victory && !canMove(newBoard);

    // 保存最高分
    if (newBestScore > state.bestScore) {
      saveBestScore(newBestScore);
    }

    set({
      board: newBoard,
      score: newScore,
      bestScore: newBestScore,
      collectedLetters: newCollectedLetters,
      isVictory: victory,
      isGameOver: gameOver,
      moveCount: state.moveCount + 1,
      canUndo: state.undoAvailable,
      showPreview: showPreviewFlag,
      previewValue: previewValueFlag,
      undoAvailable: undoAvailableFlag,
      history: [...state.history, currentState].slice(-10), // 保留最近10步
    });
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
  },

  // 重新开始
  restart: () => {
    get().initGame();
  },

  // 设置最高分
  setBestScore: (score: number) => {
    saveBestScore(score);
    set({ bestScore: score });
  },
}));
