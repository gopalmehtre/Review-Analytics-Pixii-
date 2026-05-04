import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = {
  Positive: "#10B981",
  Negative: "#EF4444",
  Neutral: "#F59E0B",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-400">{payload[0].payload.name}</p>
        <p className="text-sm font-semibold text-white">
          {payload[0].value} reviews
        </p>
      </div>
    );
  }
  return null;
};

export default function SentimentChart({ data }) {
  const chartData = [
    { name: "Positive", value: data.positive, fill: COLORS.Positive },
    { name: "Negative", value: data.negative, fill: COLORS.Negative },
    { name: "Neutral", value: data.neutral, fill: COLORS.Neutral },
  ];

  const total = data.positive + data.negative + data.neutral;

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 text-sm">
            &#x25A0;
          </span>
          <h3 className="font-display text-lg font-semibold text-white">
            Sentiment Breakdown
          </h3>
        </div>
        <span className="text-xs text-zinc-500">{total} reviews analyzed</span>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-zinc-400">{item.name}</span>
            <span className="text-xs font-semibold text-white">
              {item.value}
            </span>
            <span className="text-[10px] text-zinc-500">
              ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            barCategoryGap="30%"
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
