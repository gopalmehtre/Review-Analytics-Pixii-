export default function ResultsPanel({ factors, complaints }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Buying Factors */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-sm">
            &#x2191;
          </span>
          <h3 className="font-display text-lg font-semibold text-white">
            Top Buying Factors
          </h3>
        </div>
        <ul className="space-y-3">
          {factors.map((f, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <span className="mt-0.5 w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-zinc-300 leading-relaxed group-hover:text-white transition-colors">
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Complaints */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 text-sm">
            &#x2193;
          </span>
          <h3 className="font-display text-lg font-semibold text-white">
            Top Complaints
          </h3>
        </div>
        <ul className="space-y-3">
          {complaints.map((c, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <span className="mt-0.5 w-5 h-5 rounded-md bg-red-500/10 text-red-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-zinc-300 leading-relaxed group-hover:text-white transition-colors">
                {c}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
