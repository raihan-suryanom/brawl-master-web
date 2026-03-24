import { useEffect, useState } from "react";
import { api, type ClutchStats } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClutchStatsCardProps {
  playerId: string;
  playerName: string;
}

export function ClutchStatsCard({ playerId, playerName }: ClutchStatsCardProps) {
  const [clutchStats, setClutchStats] = useState<ClutchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClutchStats = async () => {
      try {
        const data = await api.getPlayerClutchStats(playerId);
        setClutchStats(data as ClutchStats);
      } catch (error) {
        console.error("Error fetching clutch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClutchStats();
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clutch Performance</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!clutchStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clutch Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { closeGameWinRate, closeGamesPlayed, closeGamesWon, clutchRating } = clutchStats;

  // Rating colors
  const getRatingColor = () => {
    if (clutchRating === 'Elite Clutch') return 'bg-yellow-500';
    if (clutchRating === 'Clutch') return 'bg-green-500';
    if (clutchRating === 'Reliable') return 'bg-blue-500';
    if (clutchRating === 'Average') return 'bg-gray-500';
    if (clutchRating === 'Choker') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getRatingEmoji = () => {
    if (clutchRating === 'Elite Clutch') return '🔥';
    if (clutchRating === 'Clutch') return '💪';
    if (clutchRating === 'Reliable') return '✅';
    if (clutchRating === 'Average') return '😐';
    if (clutchRating === 'Choker') return '😰';
    return '❓';
  };

  // Win rate bar width
  const barWidth = Math.min(closeGameWinRate, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Clutch Performance</CardTitle>
        <CardDescription>
          Performance in close games (within ±2 pts)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clutch Rating Badge */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">{getRatingEmoji()}</span>
          <div className={`px-4 py-2 rounded-lg text-white font-bold text-lg ${getRatingColor()}`}>
            {clutchRating}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Close Games</div>
            <div className="text-3xl font-bold">{closeGamesPlayed}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Wins</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {closeGamesWon}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-3xl font-bold">{closeGameWinRate}%</div>
          </div>
        </div>

        {/* Win Rate Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Close Game Win Rate</span>
            <span className="font-bold">{closeGameWinRate}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getRatingColor()} transition-all duration-500`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">What is a close game?</p>
          <p>
            A series where {playerName} finished within 2 points of another player. 
            {clutchRating === 'N/A' && ' Need at least 3 close games for rating.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}