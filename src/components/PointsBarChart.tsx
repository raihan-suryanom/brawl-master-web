import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { PlayerStats } from "@/lib/api";

interface PointsBarChartProps {
  stats: PlayerStats[];
}

export function PointsBarChart({ stats }: PointsBarChartProps) {
  const data = stats.map((stat) => ({
    name: stat.name,
    pts: stat.pts,
    color: stat.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="pts" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
