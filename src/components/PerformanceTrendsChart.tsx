import { useEffect, useState } from "react";
import { api, type PerformanceTrends } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceTrendsChartProps {
  playerId: string;
  playerName: string;
}

export function PerformanceTrendsChart({ playerId, playerName }: PerformanceTrendsChartProps) {
  const [trends, setTrends] = useState<PerformanceTrends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await api.getPlayerPerformanceTrends(playerId);
        setTrends(data as PerformanceTrends);
      } catch (error) {
        console.error("Error fetching performance trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!trends || trends.seriesPerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { seriesPerformance, rating, avgPts, peakPts, peakSeries, winRate, consistency, form, totalSeries } = trends;

  // Calculate chart dimensions
  const maxPts = Math.max(...seriesPerformance.map(s => s.pts), 15);
  const chartHeight = 200;
  const chartWidth = Math.min(600, seriesPerformance.length * 60);
  const padding = 40;

  // Calculate points for line
  const points = seriesPerformance.map((s, i) => {
    const x = padding + (i / (seriesPerformance.length - 1 || 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((s.pts / maxPts) * (chartHeight - 2 * padding));
    return { x, y, ...s };
  });

  // Create path for line chart
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Form indicator
  const getFormIcon = () => {
    if (form.trend === 'improving') return '📈';
    if (form.trend === 'declining') return '📉';
    return '➡️';
  };

  const getFormColor = () => {
    if (form.trend === 'improving') return 'text-green-600 dark:text-green-400';
    if (form.trend === 'declining') return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{playerName}'s Performance Trends</CardTitle>
        <CardDescription>Performance across {totalSeries} series</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Badge */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Overall Rating:</span>
            <div 
              className="px-3 py-1 rounded-lg font-bold text-white"
              style={{ backgroundColor: rating.color }}
            >
              {rating.tier} - {rating.label}
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${getFormColor()}`}>
            <span className="text-sm font-medium">Form:</span>
            <span className="font-bold">
              {getFormIcon()} {form.trend.charAt(0).toUpperCase() + form.trend.slice(1)}
              {form.change !== 0 && ` (${form.change > 0 ? '+' : ''}${form.change}%)`}
            </span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Avg Pts/Series</div>
            <div className="text-2xl font-bold">{avgPts}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Peak Performance</div>
            <div className="text-2xl font-bold">{peakPts} pts</div>
            <div className="text-xs text-muted-foreground">{peakSeries}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold">{winRate}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Consistency</div>
            <div className="text-2xl font-bold">
              {consistency < 2 ? 'High' : consistency < 4 ? 'Medium' : 'Low'}
            </div>
            <div className="text-xs text-muted-foreground">σ = {consistency}</div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="mx-auto">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = chartHeight - padding - ((percent / 100) * (chartHeight - 2 * padding));
              const value = Math.round((percent / 100) * maxPts);
              return (
                <g key={percent}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted-foreground opacity-20"
                    strokeDasharray="4"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    className="fill-muted-foreground"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={rating.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points and labels */}
            {points.map((point, i) => (
              <g key={i}>
                {/* Point circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill={rating.color}
                  className="cursor-pointer hover:r-7 transition-all"
                >
                  <title>
                    {point.seriesName}: {point.pts} pts ({point.wins}W-{point.losses}L)
                  </title>
                </circle>
                
                {/* Series label */}
                <text
                  x={point.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-muted-foreground"
                >
                  {point.seriesName.replace('Brawl Master Championship ', 'S')}
                </text>
                
                {/* Pts value above point */}
                <text
                  x={point.x}
                  y={point.y - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  className="fill-foreground"
                >
                  {point.pts}
                </text>
              </g>
            ))}

            {/* Axes */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />
          </svg>
        </div>

        {/* Series breakdown table */}
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Series</th>
                  <th className="px-4 py-2 text-center font-medium">Pts</th>
                  <th className="px-4 py-2 text-center font-medium">W-L</th>
                  <th className="px-4 py-2 text-center font-medium">Win%</th>
                  <th className="px-4 py-2 text-center font-medium">WS</th>
                  <th className="px-4 py-2 text-center font-medium">LS</th>
                </tr>
              </thead>
              <tbody>
                {seriesPerformance.map((series, i) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-2">{series.seriesName}</td>
                    <td className="px-4 py-2 text-center font-bold">{series.pts}</td>
                    <td className="px-4 py-2 text-center">{series.wins}-{series.losses}</td>
                    <td className="px-4 py-2 text-center">{Math.round(series.winRate)}%</td>
                    <td className="px-4 py-2 text-center">{series.winStreak}</td>
                    <td className="px-4 py-2 text-center">{series.loseStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}