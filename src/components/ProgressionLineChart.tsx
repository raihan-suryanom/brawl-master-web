import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { GameProgression } from "@/lib/api";

interface PlayerProgressionLineChartProps {
  progression: GameProgression[];
}

export function PlayerProgressionLineChart({ progression }: PlayerProgressionLineChartProps) {
  if (!progression || progression.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No game data available
      </div>
    );
  }

  // Transform data for recharts
  const chartData = progression.map((item) => ({
    gameIndex: item.gameIndex,
    points: item.points,
    result: item.result,
    seriesName: item.seriesName,
    gameNumber: item.gameNumber,
    totalWins: item.totalWins,
    highestWinStreak: item.highestWinStreak,
    highestLoseStreak: item.highestLoseStreak,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.seriesName} - Game {data.gameNumber}</p>
          <p className="text-sm">
            <span className={data.result === "W" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {data.result === "W" ? "Win" : "Loss"}
            </span>
          </p>
          <div className="mt-2 text-xs space-y-1">
            <p>W: {data.totalWins} | WS: {data.highestWinStreak} | LS: {data.highestLoseStreak}</p>
            <p className="font-medium text-primary">
              Points: {data.points} = {data.totalWins} + {data.highestWinStreak} - {data.highestLoseStreak}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="gameIndex"
          label={{ value: "Game #", position: "insideBottom", offset: -5 }}
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
        />
        <YAxis
          label={{ value: "Points", angle: -90, position: "insideLeft" }}
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="points"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}