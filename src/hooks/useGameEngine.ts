
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
import { INITIAL_MAZE_LAYOUT, CELL_SIZE, MONKEY_MOVE_INTERVAL } from '@/types/game';

const MAZE_HEIGHT = INITIAL_MAZE_LAYOUT.length;
const MAZE_WIDTH = INITIAL_MAZE_LAYOUT[0].length;

interface GameEngineOutput {
  maze: CellType[][];
  tigerPosition: Position;
  tigerDirection: Direction;
  monkeyPosition: Position;
  score: number;
  bankedScore: number;
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
  
  const [initialMonkeyPosition, setInitialMonkeyPosition] = useState<Position>({ row: 0, col: 0 });
  const [monkeyPosition, setMonkeyPosition] = useState<Position>({ row: 0, col: 0 });
  const [monkeyMoveCounter, setMonkeyMoveCounter] = useState(0);

  const [dollars, setDollars] = useState<DollarItem[]>([]);
  const [score, setScore] = useState(0);
  const [bankedScore, setBankedScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START_SCREEN');
  const [isTigerMoving, setIsTigerMoving] = useState(false);
  const [bankPositions, setBankPositions] = useState<Position[]>([]);

  const initializeGame = useCallback(() => {
    const newMaze: CellType[][] = [];
    const newDollars: DollarItem[] = [];
    let startPos: Position = { row: 1, col: 1 };
    let monkeyStartPos: Position = { row: 1, col: 1 };
    const currentBankPositions: Position[] = [];
    let dollarIdCounter = 0;

    INITIAL_MAZE_LAYOUT.forEach((rowLayout, r) => {
      const mazeRow: CellType[] = [];
      rowLayout.forEach((cellSymbol: MazeLayoutSymbol, c) => {
        switch (cellSymbol) {
          case '#':
            mazeRow.push('WALL');
            break;
          case 'D':
            mazeRow.push('PATH');
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
          case 'M':
            mazeRow.push('PATH'); // Monkey spawn is a path
            monkeyStartPos = { row: r, col: c };
            break;
          case 'B':
            mazeRow.push('BANK_DOOR');
            currentBankPositions.push({ row: r, col: c });
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
    setInitialMonkeyPosition(monkeyStartPos);
    setMonkeyPosition(monkeyStartPos);
    setBankPositions(currentBankPositions);
    setTigerDirection('RIGHT');
    setScore(0);
    setBankedScore(0);
    setMonkeyMoveCounter(0);
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

  const moveMonkey = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    setMonkeyPosition(prevMonkeyPos => {
      let newMonkeyRow = prevMonkeyPos.row;
      let newMonkeyCol = prevMonkeyPos.col;

      const dy = tigerPosition.row - prevMonkeyPos.row;
      const dx = tigerPosition.col - prevMonkeyPos.col;

      // Try to move vertically first if vertical distance is greater or equal
      if (Math.abs(dy) >= Math.abs(dx)) {
        if (dy > 0) newMonkeyRow++;
        else if (dy < 0) newMonkeyRow--;
      } else { // Else try to move horizontally
        if (dx > 0) newMonkeyCol++;
        else if (dx < 0) newMonkeyCol--;
      }
      
      // Check if the primary intended move is valid
      if (
        newMonkeyRow >= 0 && newMonkeyRow < MAZE_HEIGHT &&
        newMonkeyCol >= 0 && newMonkeyCol < MAZE_WIDTH &&
        maze[newMonkeyRow]?.[newMonkeyCol] !== 'WALL'
      ) {
        // Valid primary move
      } else { // Primary move invalid, try alternative axis
        newMonkeyRow = prevMonkeyPos.row; // Reset to current
        newMonkeyCol = prevMonkeyPos.col;
        if (Math.abs(dx) > Math.abs(dy)) { // Original was horizontal, try vertical
            if (dy > 0) newMonkeyRow++;
            else if (dy < 0) newMonkeyRow--;
        } else { // Original was vertical, try horizontal
            if (dx > 0) newMonkeyCol++;
            else if (dx < 0) newMonkeyCol--;
        }
        // Check validity of alternative move
        if (
            !(newMonkeyRow >= 0 && newMonkeyRow < MAZE_HEIGHT &&
            newMonkeyCol >= 0 && newMonkeyCol < MAZE_WIDTH &&
            maze[newMonkeyRow]?.[newMonkeyCol] !== 'WALL')
        ) { // Alternative also invalid, don't move
            newMonkeyRow = prevMonkeyPos.row;
            newMonkeyCol = prevMonkeyPos.col;
        }
      }
      
      const nextMonkeyPos = {row: newMonkeyRow, col: newMonkeyCol};

      // Check for collision with tiger AFTER monkey moves
      if (nextMonkeyPos.row === tigerPosition.row && nextMonkeyPos.col === tigerPosition.col) {
        setGameState('GAME_OVER_CAUGHT');
      }
      return nextMonkeyPos;
    });

  }, [maze, tigerPosition, gameState]);


  const moveTiger = useCallback((direction: Direction) => {
    if (gameState !== 'PLAYING') return;

    setTigerDirection(direction);
    setIsTigerMoving(true);

    setTigerPosition(prevPos => {
      let newRow = prevPos.row;
      let newCol = prevPos.col;

      switch (direction) {
        case 'UP': newRow--; break;
        case 'DOWN': newRow++; break;
        case 'LEFT': newCol--; break;
        case 'RIGHT': newCol++; break;
      }

      if (
        newRow < 0 || newRow >= MAZE_HEIGHT ||
        newCol < 0 || newCol >= MAZE_WIDTH ||
        maze[newRow]?.[newCol] === 'WALL'
      ) {
        setTimeout(() => setIsTigerMoving(false), 150);
        return prevPos;
      }
      
      const newPos = { row: newRow, col: newCol };

      // Check for banking
      if (bankPositions.some(bp => bp.row === newRow && bp.col === newCol)) {
        if (score > 0) {
          setBankedScore(prevBanked => prevBanked + score);
          setScore(0);
        }
      } else { // Only collect dollars if not banking on this move
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
      }
      
      // Check for collision with monkey AFTER tiger moves, before monkey's turn
      if (newPos.row === monkeyPosition.row && newPos.col === monkeyPosition.col) {
        setGameState('GAME_OVER_CAUGHT');
        setTimeout(() => setIsTigerMoving(false), 150);
        return newPos; // Return new position even if caught, state change handles outcome
      }

      const newMonkeyMoveCounter = monkeyMoveCounter + 1;
      setMonkeyMoveCounter(newMonkeyMoveCounter);
      if (newMonkeyMoveCounter % MONKEY_MOVE_INTERVAL === 0) {
        moveMonkey();
      }
      
      setTimeout(() => setIsTigerMoving(false), 150);
      return newPos;
    });

  }, [maze, dollars, gameState, score, bankPositions, monkeyPosition, monkeyMoveCounter, moveMonkey]);

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
    monkeyPosition,
    score,
    bankedScore,
    dollars,
    gameState,
    isTigerMoving,
    startGame,
    moveTiger,
    handleDollarAnimationComplete,
  };
};
