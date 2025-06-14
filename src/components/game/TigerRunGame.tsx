
'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useGameEngine } from '@/hooks/useGameEngine';
import TigerIcon from '@/components/icons/TigerIcon';
import DollarIcon from '@/components/icons/DollarIcon';
import MonkeyIcon from '@/components/icons/MonkeyIcon'; // New Icon
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CellType } from '@/types/game';
import { CELL_SIZE } from '@/types/game';

const TigerRunGame: React.FC = () => {
  const {
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
  } = useGameEngine();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      switch (event.key) {
        case 'ArrowUp': moveTiger('UP'); break;
        case 'ArrowDown': moveTiger('DOWN'); break;
        case 'ArrowLeft': moveTiger('LEFT'); break;
        case 'ArrowRight': moveTiger('RIGHT'); break;
      }
    },
    [moveTiger, gameState]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
        return <div style={{ width: CELL_SIZE, height: CELL_SIZE }} className="bg-green-700 flex items-center justify-center text-primary-foreground font-bold" aria-label="Bank">B</div>; // Simple Bank style
      default:
        return null;
    }
  };
  
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
              Guide the tiger through the maze, collect dollars, bank them, and avoid the monkey!
            </p>
            <p className="text-md text-muted-foreground">Use arrow keys to move.</p>
            <Button onClick={startGame} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6">
              Start Game
            </Button>
          </CardContent>
        </Card>
      )}
      
      { (gameState === 'PLAYING' || gameState === 'WON' || gameState === 'GAME_OVER_CAUGHT') && maze.length > 0 && (
        <>
          <Card className="mb-6 bg-card shadow-lg">
            <CardContent className="p-4 flex justify-around gap-4">
              <p className="text-2xl font-semibold text-accent">
                Score: <span className="text-primary">{score}</span>
              </p>
              <p className="text-2xl font-semibold text-accent">
                Banked: <span className="text-primary">{bankedScore}</span>
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center">
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

          {gameState === 'WON' && (
            <Card className="mt-8 w-full max-w-md text-center shadow-2xl bg-card">
              <CardHeader>
                <CardTitle className="text-4xl text-primary">You Won!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl text-card-foreground">Final Score (Banked): {bankedScore + score}</p>
                <Button onClick={startGame} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6">
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}

          {gameState === 'GAME_OVER_CAUGHT' && (
            <Card className="mt-8 w-full max-w-md text-center shadow-2xl bg-card border-destructive">
              <CardHeader>
                <CardTitle className="text-4xl text-destructive">Game Over!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xl text-card-foreground">The monkey caught you!</p>
                <p className="text-2xl text-card-foreground">Banked Score: {bankedScore}</p>
                 <p className="text-md text-muted-foreground">(Unbanked score of {score} lost)</p>
                <Button onClick={startGame} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6">
                  Try Again
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
