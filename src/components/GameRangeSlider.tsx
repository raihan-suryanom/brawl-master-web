"use client";

import { useState, useEffect } from "react";

interface GameRangeSliderProps {
  totalGames: number;
  currentGameRange: number | null;
}

export function GameRangeSlider({ 
  totalGames,
  currentGameRange 
}: GameRangeSliderProps) {
  const [gameRange, setGameRange] = useState(currentGameRange || totalGames);

  useEffect(() => {
    setGameRange(currentGameRange || totalGames);
  }, [totalGames, currentGameRange]);

  const handleGameRangeChange = (value: number) => {
    setGameRange(value);
    
    // Update URL with new game range
    const url = new URL(window.location.href);
    if (value === totalGames) {
      url.searchParams.delete('gameRange');
    } else {
      url.searchParams.set('gameRange', value.toString());
    }
    
    // Navigate to updated URL (causes page reload in Astro)
    window.location.href = url.toString();
  };

  if (totalGames <= 1) {
    return null;
  }

  return (
    <div className="space-y-2 mt-3 pt-3 border-t">
      <div className="flex items-center justify-between text-sm">
        <label className="font-semibold">Game Range:</label>
        <span className="text-muted-foreground">
          Games 1 to {gameRange}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground min-w-[20px]">1</span>
        <div className="flex-1 relative">
          {/* Slider */}
          <input
            type="range"
            min="1"
            max={totalGames}
            step="1"
            value={gameRange}
            onChange={(e) => handleGameRangeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary relative z-10"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((gameRange - 1) / (totalGames - 1)) * 100}%, hsl(var(--muted)) ${((gameRange - 1) / (totalGames - 1)) * 100}%, hsl(var(--muted)) 100%)`
            }}
          />
          {/* Tick marks */}
          <div className="absolute top-0 left-0 w-full h-2 flex justify-between items-center pointer-events-none">
            {Array.from({ length: totalGames }, (_, i) => i + 1).map((tick) => (
              <div
                key={tick}
                className={`w-1.5 h-1.5 rounded-full ${
                  tick <= gameRange 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                }`}
                style={{
                  position: 'absolute',
                  left: `${((tick - 1) / (totalGames - 1)) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground min-w-[20px]">{totalGames}</span>
      </div>
      {gameRange < totalGames && (
        <p className="text-xs text-amber-600 dark:text-amber-500">
          ⚠️ Showing stats for games 1-{gameRange} only (excluding games {gameRange + 1}-{totalGames})
        </p>
      )}
    </div>
  );
}