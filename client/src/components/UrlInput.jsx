export default function UrlInput({ url, setUrl, onAnalyze, onMockAnalyze, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading && url.trim()) {
      onAnalyze();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="https://www.amazon.com/dp/..."
            className="w-full px-5 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 
                     text-white placeholder-zinc-500 text-sm
                     focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300" />
        </div>
        <button
          onClick={onAnalyze}
          disabled={loading || !url.trim()}
          className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 
                   text-black font-semibold text-sm tracking-wide
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25
                   active:scale-[0.98] whitespace-nowrap"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="mt-3 text-center">
        <button
          onClick={onMockAnalyze}
          disabled={loading}
          className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors 
                   disabled:opacity-40 disabled:cursor-not-allowed underline underline-offset-2"
        >
          or try with mock data (no API keys needed)
        </button>
      </div>
    </div>
  );
}
