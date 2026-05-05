export default function MarketSummary({ productName, category, summary }) {
  if (!summary) return null;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 text-sm">
          &#x1F4CA;
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            Market Intelligence
          </h3>
          {productName && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {productName}
              {category ? ` - ${category}` : ""}
            </p>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40">
        {summary}
      </p>
    </div>
  );
}
