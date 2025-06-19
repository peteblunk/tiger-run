'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface PinEntryProps {
  onPinCorrect: () => void;
}

const CORRECT_PIN = '1397';
const MAX_PIN_LENGTH = 4;

const PinEntry: React.FC<PinEntryProps> = ({ onPinCorrect }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigitClick = (digit: string) => {
    if (pin.length < MAX_PIN_LENGTH) {
      setPin(prevPin => prevPin + digit);
      setError(''); // Clear error on new input
    }
  };

  const handleBackspace = () => {
    setPin(prevPin => prevPin.slice(0, -1));
    setError(''); // Clear error on new input
  };

  const handleEnter = () => {
    if (pin === CORRECT_PIN) {
      setError('');
      onPinCorrect();
    } else {
      setError('Incorrect PIN');
      setPin(''); // Clear PIN on incorrect entry
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key >= '0' && event.key <= '9') {
      handleDigitClick(event.key);
    } else if (event.key === 'Backspace') {
      handleBackspace();
    } else if (event.key === 'Enter') {
      handleEnter();
    }
  }, [handleDigitClick, handleBackspace, handleEnter]); // Include handlers in dependencies

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]); // Add handleKeyPress to effect dependencies

  // Add a separate effect to trigger PIN check if 4 digits are entered via keyboard
  useEffect(() => {
    if (pin.length === MAX_PIN_LENGTH) {
      // Use a timeout to allow the last digit to render before checking
      const timeoutId = setTimeout(() => handleEnter(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [pin, handleEnter]); // Depend on pin and handleEnter

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['Backspace', '0', 'Enter'],
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="bg-card p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">Enter PIN</h2>
        <div className="mb-6 text-3xl tracking-widest">
          {pin.padEnd(MAX_PIN_LENGTH, '_')}
        </div>
        {error && <p className="text-destructive mb-4">{error}</p>}
        <div className="grid grid-cols-3 gap-4">
          {keypad.flat().map((key) => (
            <Button
              key={key}
              onClick={() => {
                if (key === 'Backspace') {
                  handleBackspace();
                } else if (key === 'Enter') {
                  handleEnter();
                } else {
                  handleDigitClick(key);
                }
              }}
              className="text-xl py-4"
              disabled={key !== 'Backspace' && key !== 'Enter' && pin.length >= MAX_PIN_LENGTH}
            >
              {key}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinEntry;