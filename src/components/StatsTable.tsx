import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerStats } from "@/lib/api";
import { Check, X } from "lucide-react";

interface StatsTableProps {
  stats: PlayerStats[];
}

export function StatsTable({ stats }: StatsTableProps) {
  const getZoneStyle = (zone?: string) => {
    switch (zone) {
      case "champion":
        return "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700";
      case "safe":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      case "last":
        return "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden mt-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">GP</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">WS</TableHead>
            <TableHead className="text-center">LS</TableHead>
            <TableHead className="text-center">Pts</TableHead>
            <TableHead className="text-center">Last 5</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat, index) => {
            const rank = index + 1;
            const zoneStyle = getZoneStyle(stat.zone);
            const losses = stat.totalGames - stat.totalWin;
            
            return (
              <TableRow 
                key={stat.playerId}
                className={`${zoneStyle} ${zoneStyle ? 'border-l-4' : ''}`}
              >
                <TableCell className="font-bold text-lg">
                  {rank}
                </TableCell>
                <TableCell>
                  <a 
                    href={`/players/${stat.playerId}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stat.color }}
                    />
                    <img
                      src={stat.picture}
                      alt={stat.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="font-medium">{stat.name}</span>
                  </a>
                </TableCell>
                <TableCell className="text-center">{stat.totalGames}</TableCell>
                <TableCell className="text-center font-medium text-green-600 dark:text-green-400">
                  {stat.totalWin}
                </TableCell>
                <TableCell className="text-center font-medium text-red-600 dark:text-red-400">
                  {losses}
                </TableCell>
                <TableCell className="text-center">{stat.highestWinStreak}</TableCell>
                <TableCell className="text-center">{stat.highestLoseStreak}</TableCell>
                <TableCell className="text-center font-bold text-lg">
                  {stat.pts}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    {stat.lastFiveGames?.map((game, idx) => {
                      const isNewest = idx === stat.lastFiveGames!.length - 1;
                      
                      return (
                        <div
                          key={`${stat.playerId}-${game.gameNumber}`}
                          className={`
                            w-5 h-5 rounded-full flex items-center justify-center
                            ${game.result === 'W' 
                              ? 'bg-green-600 dark:bg-green-500' 
                              : 'bg-red-600 dark:bg-red-500'
                            }
                            ${isNewest ? 'ring-1 ring-offset-1 ring-primary' : ''}
                          `}
                          title={`Game ${game.gameNumber}: ${game.result === 'W' ? 'Win' : 'Loss'}`}
                        >
                          {game.result === 'W' ? (
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 text-white stroke-[3]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}