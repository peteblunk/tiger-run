export type CellType = 'WALL' | 'PATH';
export type MazeLayoutSymbol = '#' | '.' | 'S' | 'D';

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

export type GameState = 'LOADING' | 'PLAYING' | 'WON' | 'START_SCREEN';

export const CELL_SIZE = 32; // pixels

export const INITIAL_MAZE_LAYOUT: MazeLayoutSymbol[][] = [
  ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
  ['#','S','D','#','D','D','D','D','D','D','#','D','D','D','#'],
  ['#','D','#','#','D','#','#','D','#','D','#','D','#','D','#'],
  ['#','D','D','D','D','D','D','D','#','D','D','D','D','D','#'],
  ['#','D','#','#','#','D','#','#','#','#','#','.','#','D','#'],
  ['#','D','D','D','D','D','D','D','D','D','D','D','D','D','#'],
  ['#','#','#','D','#','#','D','#','#','#','D','#','#','#','#'],
  ['#','D','D','D','D','D','D','D','D','D','D','D','D','D','#'],
  ['#','D','#','#','#','#','#','#','D','#','#','#','#','D','#'],
  ['#','D','D','D','D','D','D','D','D','D','D','D','D','D','#'],
  ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
];
