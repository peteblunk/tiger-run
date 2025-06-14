'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  CellType,
  Position,
  Direction,
  DollarItem,
  GameState,
  MazeLayoutSymbol,
} from '@/types/game';
import { INITIAL_MAZE_LAYOUT, CELL_SIZE } from '@/types/game';

const MAZE_HEIGHT = INITIAL_MAZE_LAYOUT.length;
const MAZE_WIDTH = INITIAL_MAZE_LAYOUT[0].length;

interface GameEngineOutput {
  maze: CellType[][];
  tigerPosition: Position;
  tigerDirection: Direction;
  score: number;
  dollars: DollarItem[];
  gameState: GameState;
  isTigerMoving: boolean;
  startGame: () => void;
  moveTiger: (direction: Direction) => void;
  handleDollarAnimationComplete: (dollarId: string) => void;
}

export const useGameEngine = (): GameEngineOutput => {
  const [maze, setMaze] = useState<CellType[][]>([]);
  const [initialTigerPosition, setInitialTigerPosition] = useState<Position>({ row: 0, col: 0 });
  const [tigerPosition, setTigerPosition] = useState<Position>({ row: 0, col: 0 });
  const [tigerDirection, setTigerDirection] = useState<Direction>('RIGHT');
  const [dollars, setDollars] = useState<DollarItem[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START_SCREEN');
  const [isTigerMoving, setIsTigerMoving] = useState(false);

  const initializeGame = useCallback(() => {
    const newMaze: CellType[][] = [];
    const newDollars: DollarItem[] = [];
    let startPos: Position = { row: 1, col: 1 }; // Default if 'S' not found
    let dollarIdCounter = 0;

    INITIAL_MAZE_LAYOUT.forEach((rowLayout, r) => {
      const mazeRow: CellType[] = [];
      rowLayout.forEach((cellSymbol: MazeLayoutSymbol, c) => {
        switch (cellSymbol) {
          case '#':
            mazeRow.push('WALL');
            break;
          case 'D':
            mazeRow.push('PATH'); // Path underneath, dollar is separate layer
            newDollars.push({
              id: `dollar-${dollarIdCounter++}`,
              position: { row: r, col: c },
              isCollected: false,
              isAnimatingOut: false,
            });
            break;
          case 'S':
            mazeRow.push('PATH');
            startPos = { row: r, col: c };
            break;
          case '.':
          default:
            mazeRow.push('PATH');
            break;
        }
      });
      newMaze.push(mazeRow);
    });

    setMaze(newMaze);
    setDollars(newDollars);
    setInitialTigerPosition(startPos);
    setTigerPosition(startPos);
    setTigerDirection('RIGHT');
    setScore(0);
    setGameState('PLAYING');
  }, []);
  
  const startGame = () => {
    initializeGame();
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && dollars.length > 0 && dollars.every(d => d.isCollected)) {
      setGameState('WON');
    }
  }, [dollars, gameState]);

  const moveTiger = useCallback((direction: Direction) => {
    if (gameState !== 'PLAYING') return;

    setTigerDirection(direction);
    setIsTigerMoving(true); // For chomping animation

    setTigerPosition(prevPos => {
      let newRow = prevPos.row;
      let newCol = prevPos.col;

      switch (direction) {
        case 'UP': newRow--; break;
        case 'DOWN': newRow++; break;
        case 'LEFT': newCol--; break;
        case 'RIGHT': newCol++; break;
      }

      // Collision detection with maze boundaries and walls
      if (
        newRow < 0 || newRow >= MAZE_HEIGHT ||
        newCol < 0 || newCol >= MAZE_WIDTH ||
        maze[newRow]?.[newCol] === 'WALL'
      ) {
        setIsTigerMoving(false);
        return prevPos; // Invalid move
      }
      
      // Check for dollar collection
      const dollarIndex = dollars.findIndex(
        d => !d.isCollected && !d.isAnimatingOut && d.position.row === newRow && d.position.col === newCol
      );

      if (dollarIndex !== -1) {
        setScore(s => s + 10);
        setDollars(prevDollars => 
          prevDollars.map((d, i) => 
            i === dollarIndex ? { ...d, isAnimatingOut: true } : d
          )
        );
      }
      
      // Short timeout to allow chomping animation to be visible before stopping
      setTimeout(() => setIsTigerMoving(false), 150);
      return { row: newRow, col: newCol };
    });

  }, [maze, dollars, gameState]);

  const handleDollarAnimationComplete = useCallback((dollarId: string) => {
    setDollars(prevDollars => 
      prevDollars.map(d => 
        d.id === dollarId ? { ...d, isCollected: true, isAnimatingOut: false } : d
      )
    );
  }, []);


  return {
    maze,
    tigerPosition,
    tigerDirection,
    score,
    dollars,
    gameState,
    isTigerMoving,
    startGame,
    moveTiger,
    handleDollarAnimationComplete,
  };
};
