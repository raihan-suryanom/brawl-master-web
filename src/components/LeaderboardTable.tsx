import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerStats } from "@/lib/api";

interface LeaderboardTableProps {
  stats: PlayerStats[];
}

export function LeaderboardTable({ stats }: LeaderboardTableProps) {
  // Get zone styling based on backend-calculated zone
  const getZoneStyle = (zone?: string) => {
    switch (zone) {
      case "champion":
        return { 
          color: "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700", 
          label: "🥇 Brawl Master",
          textColor: "text-green-700 dark:text-green-300"
        };
      case "safe":
        return { 
          color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800", 
          label: "✓ Zona Aman",
          textColor: "text-yellow-700 dark:text-yellow-300"
        };
      case "last":
        return { 
          color: "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700", 
          label: "🤣 Penghibur Malam",
          textColor: "text-red-700 dark:text-red-300"
        };
      default:
        return { color: "", label: "", textColor: "" };
    }
  };

  // Check if any zones are active (for showing legend)
  const hasActiveZones = stats.some(s => s.zone && s.zone !== "none");

  return (
    <div className="space-y-4">
      {/* Legend - only show if zones are active */}
      {hasActiveZones && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-700"></div>
            <span className="text-muted-foreground">Brawl Master</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800"></div>
            <span className="text-muted-foreground">Zona Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700"></div>
            <span className="text-muted-foreground">Penghibur Malam</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">WS</TableHead>
              <TableHead className="text-center">LS</TableHead>
              <TableHead className="text-center">Pts</TableHead>
              {/* <TableHead className="text-center">Max Pts</TableHead> */}
              <TableHead className="text-center">WR%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat, index) => {
              const rank = index + 1;
              const zoneStyle = getZoneStyle(stat.zone);
              
              return (
                <TableRow 
                  key={stat.playerId}
                  className={`${zoneStyle.color} ${zoneStyle.color ? 'border-l-4' : ''}`}
                >
                  <TableCell className="font-bold text-lg">
                    {rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stat.color }}
                      />
                      <img
                        src={stat.picture}
                        alt={stat.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <a className="font-semibold truncate hover:underline" href={`/players/${stat.playerId}`}>{stat.name}</a>
                        {zoneStyle.label && (
                          <div className={`text-xs font-medium ${zoneStyle.textColor}`}>
                            {zoneStyle.label}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {stat.totalWin}
                  </TableCell>
                  <TableCell className="text-center font-medium text-green-600 dark:text-green-400">
                    {stat.highestWinStreak}
                  </TableCell>
                  <TableCell className="text-center font-medium text-red-600 dark:text-red-400">
                    {stat.highestLoseStreak}
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">
                    {stat.pts}
                  </TableCell>
                  {/* <TableCell className="text-center text-muted-foreground text-sm">
                    {stat.maxPossiblePts !== undefined ? stat.maxPossiblePts : '-'}
                  </TableCell> */}
                  <TableCell className="text-center font-medium">
                    {stat.winRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Info Box */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
        <div>
          <span className="font-semibold">Tiebreaker Rules:</span> Pts → Total Win → Win Streak → Win Rate → Lose Streak (lower is better) → First Loss Game
        </div>
      </div>
    </div>
  );
}