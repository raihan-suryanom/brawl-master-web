import { useEffect, useState } from "react";
import { api, type SeriesDifficulty } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default function AllSeriesDifficultyList() {
  const [difficulties, setDifficulties] = useState<SeriesDifficulty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDifficulties = async () => {
      try {
        const data = await api.getAllSeriesDifficulty();
        setDifficulties(data as SeriesDifficulty[]);
      } catch (error) {
        console.error("Error fetching series difficulties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDifficulties();
  }, [refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading series difficulty rankings...</div>
        </CardContent>
      </Card>
    );
  }

  if (difficulties.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No series data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>🔄</span>
          <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {difficulties.map((difficulty, index) => {
        const rank = index + 1;
        const barWidth = (difficulty.difficultyScore / 10) * 100;

        return (
          <Card key={difficulty.seriesId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="text-3xl font-bold text-muted-foreground w-12 text-center">
                  #{rank}
                </div>

                {/* Emoji */}
                <div className="text-4xl">
                  {difficulty.difficultyEmoji}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  {/* Series Name */}
                  <div className="flex items-center justify-between">
                    <a 
                      href={`/series/${difficulty.seriesId}`}
                      className="text-lg font-bold hover:underline"
                    >
                      {difficulty.seriesName}
                    </a>
                    <div 
                      className="px-3 py-1 rounded-lg text-white font-bold text-sm"
                      style={{ backgroundColor: difficulty.difficultyColor }}
                    >
                      {difficulty.difficultyTier}
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty Score</span>
                      <span className="font-bold">{difficulty.difficultyScore} / 10</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{ 
                          width: `${barWidth}%`,
                          backgroundColor: difficulty.difficultyColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Factors Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Competitiveness</div>
                      <div className="font-bold">{difficulty.factors.competitiveness.value}</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Close Finishes</div>
                      <div className="font-bold">{difficulty.factors.closeFinishes.value}</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Variance</div>
                      <div className="font-bold">σ = {difficulty.factors.ptsVariance.value}</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Rank Changes</div>
                      <div className="font-bold">{difficulty.factors.positionChanges.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">🎯 Difficulty Tiers:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div>🔥 <strong>Insane:</strong> 8.5-10</div>
              <div>💀 <strong>Brutal:</strong> 7-8.5</div>
              <div>⚔️ <strong>Tough:</strong> 5-7</div>
              <div>😐 <strong>Average:</strong> 3-5</div>
              <div>😴 <strong>Easy:</strong> 0-3</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}