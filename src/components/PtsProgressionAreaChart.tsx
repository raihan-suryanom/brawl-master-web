import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PtsProgression } from "@/lib/api";

interface PtsProgressionAreaChartProps {
  progression: PtsProgression[];
}

export function PtsProgressionAreaChart({ progression }: PtsProgressionAreaChartProps) {
  // Transform data for recharts format
  // We need data in format: [{gameNumber: 1, playerA: 2, playerB: 1, ...}, ...]
  const gameNumbers = progression[0]?.progression.map(p => p.gameNumber) || [];
  
  const chartData = gameNumbers.map(gameNum => {
    const dataPoint: any = { gameNumber: gameNum };
    
    progression.forEach(player => {
      const gameData = player.progression.find(p => p.gameNumber === gameNum);
      dataPoint[player.name] = gameData?.pts || 0;
    });
    
    return dataPoint;
  });

  // Custom tooltip to show player stats
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">Game {label}</p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => {
              const player = progression.find(p => p.name === entry.name);
              const gameData = player?.progression.find(p => p.gameNumber === label);
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium">{entry.name}:</span>
                  <span className="font-bold">{entry.value} pts</span>
                  {gameData && (
                    <span className="text-muted-foreground text-xs">
                      ({gameData.win}W • WS:{gameData.ws} • LS:{gameData.ls})
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="gameNumber" 
          label={{ value: 'Game Number', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {progression.map((player) => (
          <Line
            key={player.id}
            type="monotone"
            dataKey={player.name}
            stroke={player.color}
            strokeWidth={3}
            dot={{ fill: player.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}