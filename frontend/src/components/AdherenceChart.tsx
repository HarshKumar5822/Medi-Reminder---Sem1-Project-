import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: { day: string; taken: number; missed: number; total: number }[];
}

export default function AdherenceChart({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Weekly Adherence
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="taken" name="Taken" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill="hsl(var(--secondary))" />
              ))}
            </Bar>
            <Bar dataKey="missed" name="Missed" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill="hsl(var(--coral))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
