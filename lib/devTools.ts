// 开发工具 - 仅用于调试
// 在浏览器控制台中可以使用 window.__GAME_DEV__ 访问

import { useGameStore } from '@/store/gameStore';

export interface GameDevTools {
  setMoveCount: (count: number) => void;
  setScore: (score: number) => void;
  setLetters: (letters: string | string[]) => void;
  setBoardTile: (row: number, col: number, value: number | string | null) => void;
  getState: () => any;
  resetGame: () => void;
  triggerVictory: () => void;
  triggerEasterEgg: () => void;
  testTraen: () => void;
  testTraenb: () => void;
}

export function createDevTools(): GameDevTools {
  return {
    // 设置步数
    setMoveCount: (count: number) => {
      const state = useGameStore.getState();
      useGameStore.setState({ moveCount: count });
      console.log(`✅ 步数已设置为: ${count}`);
    },

    // 设置分数（最大方块值）
    setScore: (score: number) => {
      const state = useGameStore.getState();
      useGameStore.setState({
        score,
        bestScore: Math.max(state.bestScore, score)
      });
      console.log(`✅ 分数已设置为: ${score}`);
    },

    // 设置已收集字母
    setLetters: (letters: string | string[]) => {
      let letterArray: string[];

      // 支持字符串或数组输入
      if (typeof letters === 'string') {
        // 如果是字符串，拆分成字母数组（例如 "TRAEN" -> ['T','R','A','E','N']）
        letterArray = letters.split('');
      } else {
        letterArray = letters;
      }

      // 验证字母是否合法
      const validLetters = ['T', 'R', 'A', 'E', 'N', 'B'];
      for (const letter of letterArray) {
        if (!validLetters.includes(letter)) {
          console.error(`❌ 无效字母: ${letter}，有效字母为: T, R, A, E, N, B`);
          return;
        }
      }

      useGameStore.setState({ collectedLetters: letterArray as any });
      console.log(`✅ 字母已设置为: [${letterArray.join(', ')}]`);
    },

    // 设置棋盘指定位置的方块值
    setBoardTile: (row: number, col: number, value: number | string | null) => {
      const state = useGameStore.getState();
      const newBoard = state.board.map(r => [...r]);
      if (row >= 0 && row < 4 && col >= 0 && col < 4) {
        newBoard[row][col] = value as any;
        useGameStore.setState({ board: newBoard });
        console.log(`✅ 棋盘 [${row},${col}] 已设置为: ${value}`);
      } else {
        console.error('❌ 行列索引必须在 0-3 之间');
      }
    },

    // 获取当前游戏状态
    getState: () => {
      const state = useGameStore.getState();
      const info = {
        moveCount: state.moveCount,
        score: state.score,
        bestScore: state.bestScore,
        collectedLetters: state.collectedLetters,
        isVictory: state.isVictory,
        isGameOver: state.isGameOver,
        isEasterEgg1024: state.isEasterEgg1024,
      };
      console.table(info);
      return state;
    },

    // 重置游戏
    resetGame: () => {
      useGameStore.getState().restart();
      console.log('✅ 游戏已重置');
    },

    // 触发胜利条件（收集TRAE + 1024）
    triggerVictory: () => {
      const state = useGameStore.getState();
      const newBoard = state.board.map(r => [...r]);

      // 设置一个1024方块
      newBoard[0][0] = 1024;

      useGameStore.setState({
        board: newBoard,
        score: 1024,
        collectedLetters: ['T', 'R', 'A', 'E'] as any,
        isVictory: true,
        showVictoryDialog: true,
      });
      console.log('✅ 已触发胜利条件');
    },

    // 触发隐藏彩蛋（1024步 + 1024分）
    triggerEasterEgg: () => {
      const state = useGameStore.getState();
      const newBoard = state.board.map(r => [...r]);

      // 设置一个1024方块
      newBoard[0][0] = 1024;

      useGameStore.setState({
        board: newBoard,
        score: 1024,
        moveCount: 1024,
        collectedLetters: ['T', 'R', 'A', 'E'] as any,
        isVictory: true,
        isEasterEgg1024: true,
        showVictoryDialog: true,
      });
      console.log('✅ 已触发隐藏彩蛋（1024×1024）');
    },

    // 快捷方法：测试 TRAEN 样式
    testTraen: () => {
      const state = useGameStore.getState();
      const newBoard = state.board.map(r => [...r]);
      newBoard[0][0] = 1024;

      useGameStore.setState({
        board: newBoard,
        score: 1024,
        collectedLetters: ['T', 'R', 'A', 'E', 'N'] as any,
        isVictory: true,
        showVictoryDialog: true,
      });
      console.log('✅ 已设置 TRAEN 字母组合，可以测试排行榜样式');
    },

    // 快捷方法：测试 TRAENB 样式
    testTraenb: () => {
      const state = useGameStore.getState();
      const newBoard = state.board.map(r => [...r]);
      newBoard[0][0] = 2048;

      useGameStore.setState({
        board: newBoard,
        score: 2048,
        collectedLetters: ['T', 'R', 'A', 'E', 'N', 'B'] as any,
        isVictory: true,
        showVictoryDialog: true,
      });
      console.log('✅ 已设置 TRAENB 字母组合，可以测试排行榜样式');
    },
  };
}

// 挂载到全局 window 对象（仅在客户端）
export function mountDevTools() {
  if (typeof window !== 'undefined') {
    (window as any).__GAME_DEV__ = createDevTools();
    console.log('🎮 开发工具已挂载到 window.__GAME_DEV__');
    console.log('💡 使用示例：');
    console.log('  window.__GAME_DEV__.setMoveCount(1020)     // 设置步数为1020');
    console.log('  window.__GAME_DEV__.setScore(2048)         // 设置分数为2048');
    console.log('  window.__GAME_DEV__.setLetters("TRAEN")    // 设置字母为TRAEN');
    console.log('  window.__GAME_DEV__.setLetters("TRAENB")   // 设置字母为TRAENB');
    console.log('  window.__GAME_DEV__.setLetters(["T","R"])  // 设置字母为T和R');
    console.log('  window.__GAME_DEV__.getState()             // 查看当前状态');
    console.log('  window.__GAME_DEV__.triggerVictory()       // 触发胜利');
    console.log('  window.__GAME_DEV__.triggerEasterEgg()     // 触发彩蛋');
    console.log('  window.__GAME_DEV__.testTraen()            // 测试TRAEN样式');
    console.log('  window.__GAME_DEV__.testTraenb()           // 测试TRAENB样式');
  }
}
