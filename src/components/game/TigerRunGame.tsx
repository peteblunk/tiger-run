
'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { useGameEngine } from '@/hooks/useGameEngine';
import TigerIcon from '@/components/icons/TigerIcon';
import DollarIcon from '@/components/icons/DollarIcon';
import MonkeyIcon from '@/components/icons/MonkeyIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CellType, Position, Direction as GameDirection } from '@/types/game'; // Renamed Direction to GameDirection
import { CELL_SIZE } from '@/types/game';
import { Landmark, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const instructionMessages = [
  "Ready, Tiger?",
  "Run through the maze and grab the cash!",
  "Bring it back and put it in the bank before the monkey takes it from you!",
  "Come back to the bank as often as you want!",
  "Pick up all the money and see who wins!",
];
const INSTRUCTION_DURATION = 3500; // ms for each instruction to show

const TigerRunGame: React.FC = () => {
  const {
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
  } = useGameEngine();

  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [instructionAnimKey, setInstructionAnimKey] = useState(0);
  const [pressedArrowKeys, setPressedArrowKeys] = useState<{ [key: string]: boolean }>({
    UP: false, DOWN: false, LEFT: false, RIGHT: false
  });

  useEffect(() => {
    let instructionTimeoutId: NodeJS.Timeout;
    if (gameState === 'PLAYING') {
      let currentIndex = 0;
      const showNext = () => {
        if (currentIndex < instructionMessages.length) {
          setCurrentInstruction(instructionMessages[currentIndex]);
          setInstructionAnimKey(key => key + 1);
          currentIndex++;
          instructionTimeoutId = setTimeout(showNext, INSTRUCTION_DURATION);
        } else {
          setCurrentInstruction(null); 
        }
      };
      // Delay start of instructions slightly to allow player to orient
      setTimeout(showNext, 500);
    } else {
      setCurrentInstruction(null); 
    }
    return () => clearTimeout(instructionTimeoutId);
  }, [gameState]);

  const internalHandleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'PLAYING' && event.key.startsWith('Arrow')) return;

    let directionToMove: GameDirection | null = null;
    switch (event.key) {
      case 'ArrowUp':
        setPressedArrowKeys(prev => ({ ...prev, UP: true }));
        directionToMove = 'UP';
        break;
      case 'ArrowDown':
        setPressedArrowKeys(prev => ({ ...prev, DOWN: true }));
        directionToMove = 'DOWN';
        break;
      case 'ArrowLeft':
        setPressedArrowKeys(prev => ({ ...prev, LEFT: true }));
        directionToMove = 'LEFT';
        break;
      case 'ArrowRight':
        setPressedArrowKeys(prev => ({ ...prev, RIGHT: true }));
        directionToMove = 'RIGHT';
        break;
    }
    if (directionToMove && gameState === 'PLAYING') {
      moveTiger(directionToMove);
    }
  }, [moveTiger, gameState]);

  const internalHandleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': setPressedArrowKeys(prev => ({ ...prev, UP: false })); break;
      case 'ArrowDown': setPressedArrowKeys(prev => ({ ...prev, DOWN: false })); break;
      case 'ArrowLeft': setPressedArrowKeys(prev => ({ ...prev, LEFT: false })); break;
      case 'ArrowRight': setPressedArrowKeys(prev => ({ ...prev, RIGHT: false })); break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', internalHandleKeyDown);
    window.addEventListener('keyup', internalHandleKeyUp);
    return () => {
      window.removeEventListener('keydown', internalHandleKeyDown);
      window.removeEventListener('keyup', internalHandleKeyUp);
    };
  }, [internalHandleKeyDown, internalHandleKeyUp]);


  if (gameState === 'LOADING') {
    return <div className="flex items-center justify-center h-screen text-2xl">Loading Game...</div>;
  }
  
  const mazeHeight = maze.length * CELL_SIZE;
  const mazeWidth = maze.length > 0 ? maze[0].length * CELL_SIZE : 0;

  const renderCellContent = (cell: CellType, rowIndex: number, colIndex: number) => {
    switch (cell) {
      case 'WALL':
        return <div style={{ width: CELL_SIZE, height: CELL_SIZE }} className="bg-muted" aria-label="Wall"></div>;
      case 'PATH':
        return <div style={{ width: CELL_SIZE, height: CELL_SIZE }} className="bg-background" aria-label="Path"></div>;
      case 'BANK_DOOR':
        return <div style={{ width: CELL_SIZE, height: CELL_SIZE }} className="bg-green-700" aria-label="Bank Entrance"></div>; 
      default:
        return null;
    }
  };
  
  const bankVisual = bankPositions.length > 0 ? bankPositions[0] : null;
  let bankTopStyle = '0px';
  let bankLeftStyle = '0px';
  const bankVisualWidth = CELL_SIZE * 3;
  const bankVisualHeight = CELL_SIZE * 2;

  if (bankVisual) {
    bankTopStyle = bankVisual.row === 0 ? `-${bankVisualHeight + 10}px` : `${(bankVisual.row + 1) * CELL_SIZE + 10}px`;
    bankLeftStyle = `${bankVisual.col * CELL_SIZE + (CELL_SIZE / 2) - (bankVisualWidth / 2)}px`;
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <h1 className="text-5xl font-bold text-primary mb-8 font-headline">Tiger Run</h1>

      {gameState === 'START_SCREEN' && (
        <Card className="w-full max-w-md text-center shadow-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Welcome to Tiger Run!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-card-foreground">
              Collect dollars, avoid the monkey, and return to the bank to store your money. 
              You can bank your dollars as many times as you want throughout the game until all the money is collected.
              If the monkey catches you, it will steal your unbanked dollars!
            </p>
            <p className="text-md text-muted-foreground">Use arrow keys to move.</p>
            <Button onClick={startGame} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6">
              Start Game
            </Button>
          </CardContent>
        </Card>
      )}
      
      { (gameState === 'PLAYING' || gameState === 'WON') && maze.length > 0 && (
        <>
          <Card className="mb-6 bg-card shadow-lg">
            <CardContent className="p-4 flex flex-wrap justify-around gap-x-6 gap-y-2">
              <p className="text-2xl font-semibold text-accent">
                Tiger Score: <span className="text-primary">{score}</span>
              </p>
              <p className="text-2xl font-semibold text-accent">
                Tiger Banked: <span className="text-primary">{bankedScore}</span>
              </p>
              <p className="text-2xl font-semibold text-destructive"> 
                Monkey Score: <span className="text-destructive">{monkeyScore}</span>
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center pt-12 relative"> {/* pt-12 for bank space, relative for instruction positioning */}
            <Image 
              src="https://placehold.co/100x120.png" 
              alt="Decorative Tiger Left" 
              width={100} 
              height={120} 
              data-ai-hint="cartoon tiger" 
              className="mr-4 hidden md:block" 
            />
            <div 
              className="relative border-2 border-primary shadow-2xl" 
              style={{ width: mazeWidth, height: mazeHeight, backgroundColor: 'hsl(var(--background))' }}
              role="grid"
              aria-label="Game Maze"
            >
              {bankVisual && (
                <div className="absolute flex items-start" style={{ top: bankTopStyle, left: bankLeftStyle, zIndex: 20, pointerEvents: 'none' }}>
                    <div
                       className="bg-green-700 border-4 border-yellow-500 rounded-lg p-2 flex flex-col items-center justify-center text-white shadow-xl"
                       style={{
                         width: bankVisualWidth,
                         height: bankVisualHeight,
                       }}
                       aria-label="The Bank"
                    >
                      <Landmark className="w-10 h-10 text-yellow-300" />
                      <span className="mt-1 text-lg font-bold text-primary-foreground">THE BANK</span>
                    </div>
                    {currentInstruction && (
                        <div
                            key={instructionAnimKey}
                            className="ml-4 instruction-text-area instruction-text-animated"
                            style={{ minWidth: '220px', textAlign: 'left' }}
                        >
                            {currentInstruction}
                        </div>
                    )}
                </div>
              )}

              {maze.map((row, rowIndex) => (
                <div key={rowIndex} className="flex" role="row">
                  {row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} role="gridcell">
                      {renderCellContent(cell, rowIndex, colIndex)}
                    </div>
                  ))}
                </div>
              ))}

              {dollars.filter(d => !d.isCollected).map(dollar => (
                <div
                  key={dollar.id}
                  className="absolute transition-all duration-100"
                  style={{
                    left: dollar.position.col * CELL_SIZE,
                    top: dollar.position.row * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                >
                  <DollarIcon 
                    size={CELL_SIZE * 0.8} 
                    isAnimatingOut={dollar.isAnimatingOut} 
                    onAnimationComplete={() => handleDollarAnimationComplete(dollar.id)} 
                  />
                </div>
              ))}
              
              <div
                className="absolute transition-all duration-100"
                style={{
                  left: tigerPosition.col * CELL_SIZE,
                  top: tigerPosition.row * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
                role="img"
                aria-label="Tiger"
              >
                <TigerIcon isMoving={isTigerMoving} direction={tigerDirection} size={CELL_SIZE} />
              </div>

              <div
                className="absolute transition-all duration-100"
                style={{
                  left: monkeyPosition.col * CELL_SIZE,
                  top: monkeyPosition.row * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
                role="img"
                aria-label="Monkey"
              >
                <MonkeyIcon size={CELL_SIZE * 0.9} />
              </div>
            </div>
            <Image 
              src="https://placehold.co/100x120.png" 
              alt="Decorative Tiger Right" 
              width={100} 
              height={120} 
              data-ai-hint="cartoon tiger" 
              className="ml-4 hidden md:block"
            />
          </div>

          {gameState === 'PLAYING' && (
            <div className="mt-8 flex flex-col items-center" aria-label="Keyboard arrow key hints">
              <div className={cn('arrow-key', pressedArrowKeys['UP'] && 'arrow-key-pressed')}>
                <ArrowUp />
              </div>
              <div className="flex mt-1">
                <div className={cn('arrow-key', pressedArrowKeys['LEFT'] && 'arrow-key-pressed')}>
                  <ArrowLeft />
                </div>
                <div className={cn('arrow-key mx-1', pressedArrowKeys['DOWN'] && 'arrow-key-pressed')}>
                  <ArrowDown />
                </div>
                <div className={cn('arrow-key', pressedArrowKeys['RIGHT'] && 'arrow-key-pressed')}>
                  <ArrowRight />
                </div>
              </div>
            </div>
          )}


          {gameState === 'WON' && (
            <Card className="mt-8 w-full max-w-md text-center shadow-2xl bg-card">
              <CardHeader>
                <CardTitle className="text-4xl text-primary">
                  { (bankedScore + score) > monkeyScore ? "Tiger Wins!" : (monkeyScore > (bankedScore + score) ? "Monkey Wins!" : "It's a Tie!") }
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl text-card-foreground">Tiger's Final Score: {bankedScore + score}</p>
                <p className="text-2xl text-card-foreground">Monkey's Final Score: {monkeyScore}</p>
                <Button onClick={startGame} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6">
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default TigerRunGame;
