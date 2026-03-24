import { useEffect, useState } from "react";
import { api, type ComebackAnalysis } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComebackAnalysisCardProps {
  playerId: string;
  playerName: string;
}

export function ComebackAnalysisCard({ playerId, playerName }: ComebackAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<ComebackAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await api.getPlayerComebackAnalysis(playerId);
        setAnalysis(data as ComebackAnalysis);
      } catch (error) {
        console.error("Error fetching comeback analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comeback Analysis</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!analysis || analysis.totalSeries === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comeback Analysis</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { 
    comebacks, 
    throws, 
    comebackRate, 
    throwRate, 
    avgComebackStrength,
    mentalToughness,
    momentumShifts 
  } = analysis;

  // Mental toughness color
  const getMentalToughnessColor = () => {
    if (mentalToughness === 'Elite') return 'bg-yellow-500';
    if (mentalToughness === 'Strong') return 'bg-green-500';
    if (mentalToughness === 'Solid') return 'bg-blue-500';
    if (mentalToughness === 'Shaky') return 'bg-orange-500';
    if (mentalToughness === 'Fragile') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getMentalToughnessEmoji = () => {
    if (mentalToughness === 'Elite') return '🏆';
    if (mentalToughness === 'Strong') return '💪';
    if (mentalToughness === 'Solid') return '👍';
    if (mentalToughness === 'Shaky') return '😬';
    if (mentalToughness === 'Fragile') return '😰';
    return '❓';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔄 Comeback Analysis</CardTitle>
        <CardDescription>
          Mental toughness and resilience metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mental Toughness Badge */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">{getMentalToughnessEmoji()}</span>
          <div className={`px-4 py-2 rounded-lg text-white font-bold text-lg ${getMentalToughnessColor()}`}>
            {mentalToughness} Mental Toughness
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Comebacks</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {comebacks}
            </div>
            <div className="text-xs text-muted-foreground">{comebackRate}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Throws</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {throws}
            </div>
            <div className="text-xs text-muted-foreground">{throwRate}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Avg Comeback</div>
            <div className="text-3xl font-bold">
              +{avgComebackStrength}
            </div>
            <div className="text-xs text-muted-foreground">positions</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Momentum</div>
            <div className="text-3xl font-bold">
              {momentumShifts}
            </div>
            <div className="text-xs text-muted-foreground">shifts</div>
          </div>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-4">
          {/* Comeback Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">👑 Comeback Rate</span>
              <span className="font-bold text-green-600 dark:text-green-400">{comebackRate}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${comebackRate}%` }}
              />
            </div>
          </div>

          {/* Throw Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">💀 Throw Rate</span>
              <span className="font-bold text-red-600 dark:text-red-400">{throwRate}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${throwRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">What do these mean?</p>
          <ul className="text-xs space-y-1 ml-4 list-disc">
            <li><strong>Comeback:</strong> Started in bottom half, finished in top half</li>
            <li><strong>Throw:</strong> Started in top half, finished in bottom half</li>
            <li><strong>Mental Toughness:</strong> Comeback rate - Throw rate</li>
            <li><strong>Momentum Shifts:</strong> Total position changes across all series</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}