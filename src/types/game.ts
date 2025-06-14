
export type CellType = 'WALL' | 'PATH' | 'BANK_DOOR' | 'MONKEY_SPAWN'; // MONKEY_SPAWN will be treated as PATH after init
export type MazeLayoutSymbol = '#' | '.' | 'S' | 'D' | 'M' | 'B';

export interface Position {
  row: number;
  col: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface DollarItem {
  id: string;
  position: Position;
  isCollected: boolean;
  isAnimatingOut: boolean;
}

export type GameState = 'LOADING' | 'PLAYING' | 'WON' | 'START_SCREEN'; // Removed 'GAME_OVER_CAUGHT'

export const CELL_SIZE = 40; // pixels - Increased size
export const MONKEY_MOVE_INTERVAL = 3; // Monkey moves every N tiger moves - Slower monkey

export const INITIAL_MAZE_LAYOUT: MazeLayoutSymbol[][] = [
  ['#','B','#','#','#','#','#','#','#','#','#','#','#','#','#'],
  ['#','S','D','#','D','D','D','D','D','D','#','D','D','D','#'],
  ['#','D','#','#','D','#','#','D','#','D','#','D','#','D','#'],
  ['#','D','D','D','D','D','D','D','#','D','D','D','D','D','#'],
  ['#','D','#','#','#','D','#','M','#','#','#','.','#','D','#'],
  ['#','D','D','D','D','D','D','D','D','D','D','D','D','D','#'],
  ['#','#','#','D','#','#','D','#','#','#','D','#','#','#','#'],
  ['#','D','D','D','D','D','D','D','D','D','D','D','D','D','#'],
  ['#','D','#','#','#','#','#','#','D','#','#','#','#','D','#'],
  ['#','D','D','D','D','D','D','D','D','D','D','D','D','D','#'],
  ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
];
