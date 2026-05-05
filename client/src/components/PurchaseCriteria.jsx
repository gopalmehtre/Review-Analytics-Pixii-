export default function PurchaseCriteria({ criteria }) {
  if (!criteria || criteria.length === 0) return null;

  const importanceColors = {
    High: "text-red-400 bg-red-500/10 border-red-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 text-sm">
          &#x2605;
        </span>
        <h3 className="font-display text-lg font-semibold text-white">
          Key Purchase Criteria
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {criteria.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-zinc-600/60 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                {item.criteria}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  importanceColors[item.importance] ||
                  "text-zinc-400 bg-zinc-800 border-zinc-700"
                }`}
              >
                {item.importance}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
