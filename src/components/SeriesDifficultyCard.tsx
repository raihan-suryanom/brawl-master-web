import { useEffect, useState } from "react";
import { api, type SeriesDifficulty } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SeriesDifficultyCardProps {
  seriesId: string;
  seriesName: string;
}

export function SeriesDifficultyCard({ seriesId, seriesName }: SeriesDifficultyCardProps) {
  const [difficulty, setDifficulty] = useState<SeriesDifficulty | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDifficulty = async () => {
      try {
        const data = await api.getSeriesDifficulty(seriesId);
        setDifficulty(data as SeriesDifficulty);
      } catch (error) {
        console.error("Error fetching series difficulty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDifficulty();
  }, [seriesId, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Series Difficulty</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!difficulty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Series Difficulty</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { difficultyScore, difficultyTier, difficultyEmoji, difficultyColor, factors } = difficulty;

  // Score bar width
  const barWidth = (difficultyScore / 10) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>💀 Series Difficulty Rating</CardTitle>
            <CardDescription>
              How competitive was {seriesName}?
            </CardDescription>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            title="Refresh difficulty data"
          >
            🔄 Refresh
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Difficulty Badge */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl">{difficultyEmoji}</span>
          <div className="text-center">
            <div 
              className="px-6 py-3 rounded-lg text-white font-bold text-2xl"
              style={{ backgroundColor: difficultyColor }}
            >
              {difficultyTier}
            </div>
            <div className="text-3xl font-bold mt-2">
              {difficultyScore} / 10
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Difficulty Score</span>
            <span className="font-bold">{difficultyScore} / 10</span>
          </div>
          <div className="h-6 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{ 
                width: `${barWidth}%`,
                backgroundColor: difficultyColor,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>😴 Easy</span>
            <span>😐 Average</span>
            <span>🔥 Insane</span>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Difficulty Factors:</h3>
          
          {/* Competitiveness */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">🏆 Competitiveness</span>
              <span className="font-medium">{factors.competitiveness.score} / 10</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(factors.competitiveness.score / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{factors.competitiveness.description}</p>
          </div>

          {/* Close Finishes */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">🎯 Close Finishes</span>
              <span className="font-medium">{factors.closeFinishes.score} / 10</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(factors.closeFinishes.score / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{factors.closeFinishes.description}</p>
          </div>

          {/* Variance */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">📈 Points Variance</span>
              <span className="font-medium">{factors.ptsVariance.score} / 10</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${(factors.ptsVariance.score / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{factors.ptsVariance.description}</p>
          </div>

          {/* Position Changes */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">🔄 Rank Volatility</span>
              <span className="font-medium">{factors.positionChanges.score} / 10</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${(factors.positionChanges.score / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{factors.positionChanges.description}</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">How is difficulty calculated?</p>
          <ul className="text-xs space-y-1 ml-4 list-disc">
            <li>Tight competition = higher score</li>
            <li>More close finishes (±2 pts) = harder</li>
            <li>Higher variance = more unpredictable</li>
            <li>More rank changes = more volatile</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}