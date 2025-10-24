// 游戏相关类型定义

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TileValue = number | 'T' | 'R' | 'A' | 'E';

export type Letter = 'T' | 'R' | 'A' | 'E';

export interface Tile {
  id: string;
  value: TileValue;
  position: Position;
  mergedFrom?: Tile[];
  isNew?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (TileValue | null)[][];
  score: number;
  bestScore: number;
  collectedLetters: Letter[];
  isGameOver: boolean;
  isVictory: boolean;
  canUndo: boolean;
  moveCount: number;
}

export interface LetterEffect {
  letter: Letter;
  name: string;
  description: string;
  color: string;
  execute: (board: (TileValue | null)[][]) => (TileValue | null)[][];
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  max_tile: number;
  letters_collected: string[];
  is_victory: boolean;
  play_time: number;
  created_at: string;
}

export interface GameHistory {
  board: (TileValue | null)[][];
  score: number;
  collectedLetters: Letter[];
}
