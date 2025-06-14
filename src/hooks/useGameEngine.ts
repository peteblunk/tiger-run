
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
  monkeyScore: number; // Added monkey's score
  dollars: DollarItem[];
  gameState: GameState;
  isTigerMoving: boolean;
  startGame: () => void;
  moveTiger: (direction: Direction) => void;
  handleDollarAnimationComplete: (dollarId: string) => void;
  bankPositions: Position[];
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
  const [monkeyScore, setMonkeyScore] = useState(0); // Initialize monkey score
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
            mazeRow.push('PATH'); 
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
    setDollars(newDollars.map(d => ({ ...d, isCollected: false, isAnimatingOut: false }))); // Ensure dollars are reset
    setInitialTigerPosition(startPos);
    setTigerPosition(startPos);
    setInitialMonkeyPosition(monkeyStartPos);
    setMonkeyPosition(monkeyStartPos);
    setBankPositions(currentBankPositions);
    setTigerDirection('RIGHT');
    setScore(0);
    setBankedScore(0);
    setMonkeyScore(0); // Reset monkey score on new game
    setMonkeyMoveCounter(0);
    setGameState('PLAYING');
  }, []);
  
  const startGame = () => {
    initializeGame();
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && dollars.length > 0 && dollars.every(d => d.isCollected && !d.isAnimatingOut)) {
      setGameState('WON');
    }
  }, [dollars, gameState]);

  const handlePlayerCaught = useCallback(() => {
    setMonkeyScore(prevMonkeyScore => prevMonkeyScore + score);
    setScore(0);
    setTigerPosition(initialTigerPosition);
    setMonkeyPosition(initialMonkeyPosition);
    // Note: Game state does not change to 'GAME_OVER_CAUGHT' anymore
  }, [score, initialTigerPosition, initialMonkeyPosition]);


  const moveMonkey = useCallback(() => {
    if (gameState !== 'PLAYING' || !maze || maze.length === 0) return;

    setMonkeyPosition(prevMonkeyPos => {
      let targetRow = prevMonkeyPos.row;
      let targetCol = prevMonkeyPos.col;

      const dy = tigerPosition.row - prevMonkeyPos.row;
      const dx = tigerPosition.col - prevMonkeyPos.col;

      const isValidMove = (r: number, c: number) => {
        return r >= 0 && r < MAZE_HEIGHT &&
               c >= 0 && c < MAZE_WIDTH &&
               maze[r]?.[c] !== 'WALL';
      };

      let moved = false;
      const preferVertical = Math.abs(dy) > Math.abs(dx) || (Math.abs(dy) === Math.abs(dx) && dy !== 0);

      if (preferVertical) {
        let tempRow = prevMonkeyPos.row;
        if (dy > 0) tempRow++; else if (dy < 0) tempRow--;
        if (tempRow !== prevMonkeyPos.row && isValidMove(tempRow, prevMonkeyPos.col)) {
          targetRow = tempRow;
          moved = true;
        }
        if (!moved && dx !== 0) {
          let tempCol = prevMonkeyPos.col;
          if (dx > 0) tempCol++; else if (dx < 0) tempCol--;
          if (tempCol !== prevMonkeyPos.col && isValidMove(prevMonkeyPos.row, tempCol)) {
            targetCol = tempCol;
            moved = true;
          }
        }
      } else {
        let tempCol = prevMonkeyPos.col;
        if (dx > 0) tempCol++; else if (dx < 0) tempCol--;
        if (tempCol !== prevMonkeyPos.col && isValidMove(prevMonkeyPos.row, tempCol)) {
          targetCol = tempCol;
          moved = true;
        }
        if (!moved && dy !== 0) {
          let tempRow = prevMonkeyPos.row;
          if (dy > 0) tempRow++; else if (dy < 0) tempRow--;
          if (tempRow !== prevMonkeyPos.row && isValidMove(tempRow, prevMonkeyPos.col)) {
            targetRow = tempRow;
            moved = true;
          }
        }
      }
      
      const nextMonkeyPos = {row: targetRow, col: targetCol};

      if (nextMonkeyPos.row === tigerPosition.row && nextMonkeyPos.col === tigerPosition.col) {
        handlePlayerCaught();
        return initialMonkeyPosition; // Monkey also resets
      }
      return nextMonkeyPos;
    });

  }, [maze, tigerPosition, gameState, handlePlayerCaught, initialMonkeyPosition]);


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
        (maze[newRow]?.[newCol] === 'WALL')
      ) {
        setTimeout(() => setIsTigerMoving(false), 150);
        return prevPos;
      }
      
      const newPos = { row: newRow, col: newCol };

      if (newPos.row === monkeyPosition.row && newPos.col === monkeyPosition.col) {
        handlePlayerCaught();
        setTimeout(() => setIsTigerMoving(false), 150);
        return initialTigerPosition; // Tiger resets
      }
      
      if (bankPositions.some(bp => bp.row === newRow && bp.col === newCol)) {
        if (score > 0) {
          setBankedScore(prevBanked => prevBanked + score);
          setScore(0);
          setMonkeyPosition(initialMonkeyPosition); // Reset monkey to start when tiger banks
        }
      } else { 
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
      
      const newMonkeyMoveCounter = monkeyMoveCounter + 1;
      setMonkeyMoveCounter(newMonkeyMoveCounter);
      if (newMonkeyMoveCounter % MONKEY_MOVE_INTERVAL === 0) {
        if (!(bankPositions.some(bp => bp.row === newRow && bp.col === newCol) && score > 0)) {
            moveMonkey();
        }
      }
      
      setTimeout(() => setIsTigerMoving(false), 150);
      return newPos;
    });

  }, [maze, dollars, gameState, score, bankedScore, bankPositions, monkeyPosition, monkeyMoveCounter, moveMonkey, initialMonkeyPosition, initialTigerPosition, handlePlayerCaught]);

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
    monkeyScore,
    dollars,
    gameState,
    isTigerMoving,
    startGame,
    moveTiger,
    handleDollarAnimationComplete,
    bankPositions, 
  };
};
