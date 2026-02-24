import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerCombination } from "@/lib/api";

interface CombinationsTableProps {
  combinations: PlayerCombination[];
  size: 2 | 3;
}

export function CombinationsTable({ combinations, size }: CombinationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Players</TableHead>
          <TableHead className="text-center">Games</TableHead>
          <TableHead className="text-center">Wins</TableHead>
          <TableHead className="text-center">Losses</TableHead>
          <TableHead className="text-center">WR%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinations.map((combo, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-2 flex-wrap">
                {combo.players.map((player, pIndex) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <img
                      src={player.picture}
                      alt={player.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <a className="text-sm hover:underline" href={`/players/${player.id}`}>{player.name}</a>
                    {pIndex < combo.players.length - 1 && (
                      <span className="text-muted-foreground">+</span>
                    )}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-center">{combo.totalGames}</TableCell>
            <TableCell className="text-center text-green-600">{combo.wins}</TableCell>
            <TableCell className="text-center text-red-600">{combo.losses}</TableCell>
            <TableCell className="text-center font-medium">
              {combo.winRate.toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
