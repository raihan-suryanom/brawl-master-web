import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { PlayerStats } from "@/lib/api";

interface PlayerRadarChartProps {
  stats: PlayerStats;
  allPlayersStats: PlayerStats[]; // For normalization context
}

export function PlayerRadarChart({ stats, allPlayersStats }: PlayerRadarChartProps) {
  // Calculate per-game metrics for wins and points
  const perGameMetrics = allPlayersStats.map(s => ({
    winRate: s.winRate,
    winsPerGame: s.totalGames > 0 ? s.totalWin / s.totalGames : 0,
    ptsPerGame: s.totalGames > 0 ? s.pts / s.totalGames : 0,
    dominance: s.totalGames > 0 ? (s.totalWin * s.highestWinStreak) / s.totalGames : 0,
    streakStability: s.totalGames > 0 ? ((s.highestWinStreak - s.highestLoseStreak) / s.totalGames) : 0,
    efficiency: s.totalWin > 0 ? s.pts / s.totalWin : 0,
  }));

  // Find min/max for per-game metrics
  const maxWinsPerGame = Math.max(...perGameMetrics.map(m => m.winsPerGame), 1);
  const maxDominance = Math.max(...perGameMetrics.map(m => m.dominance), 1);
  const maxStreakStability = Math.max(...perGameMetrics.map(m => m.streakStability), 1);
  const minStreakStability = Math.min(...perGameMetrics.map(m => m.streakStability), -1);
  const maxEfficiency = Math.max(...perGameMetrics.map(m => m.efficiency), 1);
  const minEfficiency = Math.min(...perGameMetrics.map(m => m.efficiency), 0);

  // Find absolute max for streaks (not per-game!)
  const maxLS = Math.max(...allPlayersStats.map(s => s.highestLoseStreak), 1);

  // Calculate current player's metrics
  const currentWinsPerGame = stats.totalGames > 0 ? stats.totalWin / stats.totalGames : 0;
  
  // Dominance: (Total Win × WS) / Total Games
  const dominance = stats.totalGames > 0 
    ? (stats.totalWin * stats.highestWinStreak) / stats.totalGames 
    : 0;

  // Streak Stability: (WS - LS) / Total Games
  const streakStability = stats.totalGames > 0 
    ? (stats.highestWinStreak - stats.highestLoseStreak) / stats.totalGames 
    : 0;

  // Efficiency: Points per Win
  const efficiency = stats.totalWin > 0 ? stats.pts / stats.totalWin : 0;

  // Normalize to 0-100 scale
  const normalizedData = [
    {
      metric: "Win Rate",
      value: stats.winRate, // Already 0-100
      fullMark: 100,
      raw: `${stats.winRate.toFixed(1)}%`,
    },
    {
      metric: "Wins/Game",
      value: (currentWinsPerGame / maxWinsPerGame) * 100,
      fullMark: 100,
      raw: currentWinsPerGame.toFixed(2),
    },
    {
      metric: "Dominance",
      // (Win × WS) / Games, normalized
      value: (dominance / maxDominance) * 100,
      fullMark: 100,
      raw: dominance.toFixed(2),
    },
    {
      metric: "Consistency",
      // Invert absolute LS value (lower is better)
      value: 100 - (stats.highestLoseStreak / maxLS) * 100,
      fullMark: 100,
      raw: `LS: ${stats.highestLoseStreak}`,
    },
    {
      metric: "Stability",
      // (WS - LS) / Total Games, normalized
      value: ((streakStability - minStreakStability) / (maxStreakStability - minStreakStability)) * 100,
      fullMark: 100,
      raw: streakStability.toFixed(2),
    },
    {
      metric: "Efficiency",
      // Pts per Win, normalized
      value: ((efficiency - minEfficiency) / (maxEfficiency - minEfficiency)) * 100,
      fullMark: 100,
      raw: efficiency.toFixed(2),
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.metric}</p>
          <p className="text-sm text-muted-foreground">{data.raw}</p>
          <p className="text-xs text-muted-foreground">Score: {data.value.toFixed(1)}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={450}>
      <RadarChart data={normalizedData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Radar
          name={stats.name}
          dataKey="value"
          stroke={stats.color}
          fill={stats.color}
          fillOpacity={0.6}
          strokeWidth={2}
          dot={{ fill: stats.color, r: 4 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}