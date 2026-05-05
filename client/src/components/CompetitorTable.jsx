export default function CompetitorTable({ competitors, productRevenue }) {
  if (!competitors || competitors.length === 0) return null;

  const threatColors = {
    High: "text-red-400 bg-red-500/10",
    Medium: "text-amber-400 bg-amber-500/10",
    Low: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 text-sm">
            &#x2694;
          </span>
          <h3 className="font-display text-lg font-semibold text-white">
            Competitor Analysis
          </h3>
        </div>
        {productRevenue && (
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
            Your est. revenue: {productRevenue}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-500 font-medium text-xs uppercase tracking-wider pb-3 pr-4">
                #
              </th>
              <th className="text-left text-zinc-500 font-medium text-xs uppercase tracking-wider pb-3 pr-4">
                Competitor
              </th>
              <th className="text-left text-zinc-500 font-medium text-xs uppercase tracking-wider pb-3 pr-4">
                Est. Revenue
              </th>
              <th className="text-left text-zinc-500 font-medium text-xs uppercase tracking-wider pb-3 pr-4">
                Strength
              </th>
              <th className="text-left text-zinc-500 font-medium text-xs uppercase tracking-wider pb-3 pr-4">
                Weakness
              </th>
              <th className="text-left text-zinc-500 font-medium text-xs uppercase tracking-wider pb-3">
                Threat
              </th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, i) => (
              <tr
                key={i}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 pr-4 text-zinc-500 font-mono text-xs">
                  {comp.rank || i + 1}
                </td>
                <td className="py-3 pr-4 text-white font-medium max-w-[200px]">
                  {comp.name}
                </td>
                <td className="py-3 pr-4 text-zinc-300 font-mono text-xs">
                  {comp.estimated_monthly_revenue}
                </td>
                <td className="py-3 pr-4 text-zinc-400 text-xs max-w-[180px]">
                  {comp.strengths}
                </td>
                <td className="py-3 pr-4 text-zinc-400 text-xs max-w-[180px]">
                  {comp.weakness}
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                      threatColors[comp.threat_level] ||
                      "text-zinc-400 bg-zinc-800"
                    }`}
                  >
                    {comp.threat_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
