'use client';
import TigerRunGame from '@/components/game/TigerRunGame';
import PinEntry from '@/components/PinEntry';
import { useState } from 'react';

export default function Home() {
  const [isPinCorrect, setIsPinCorrect] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      {isPinCorrect ? (
        <TigerRunGame />
      ) : (
        <PinEntry onPinCorrect={() => setIsPinCorrect(true)} />
      )}
    </main>
  );
}
