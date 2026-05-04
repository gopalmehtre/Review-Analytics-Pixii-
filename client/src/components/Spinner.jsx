export default function Spinner() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm text-zinc-400">Analyzing reviews with Gemini AI...</p>
        <p className="text-xs text-zinc-600 mt-1">This may take 10–30 seconds</p>
      </div>
    </div>
  );
}
