import { useState } from "react";
import axios from "axios";
import UrlInput from "./components/UrlInput";
import ResultsPanel from "./components/ResultsPanel";
import SentimentChart from "./components/SentimentChart";
import Spinner from "./components/Spinner";
import MarketSummary from "./components/MarketSummary";
import PurchaseCriteria from "./components/PurchaseCriteria";
import CompetitorTable from "./components/CompetitorTable";

export default function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (useMock = false) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const endpoint = useMock
        ? `${baseUrl}/analyze?useMock=true`
        : `${baseUrl}/analyze?url=${encodeURIComponent(url)}&useMock=false`;
      const res = await axios.get(endpoint);
      setData(res.data);
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        "Analysis failed. Check your API keys and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
            Review
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {" "}Analytics
            </span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Paste an Amazon product URL and get AI-powered insights — top buying factors,
            common complaints, sentiment breakdown, competitor analysis, and revenue estimates.
          </p>
        </header>

        {/* Input */}
        <UrlInput
          url={url}
          setUrl={setUrl}
          onAnalyze={() => analyze(false)}
          onMockAnalyze={() => analyze(true)}
          loading={loading}
        />

        {/* Loading */}
        {loading && <Spinner />}

        {/* Error */}
        {error && (
          <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="mt-12 space-y-8 animate-fade-in">
            {/* Row 1: Buying Factors + Complaints */}
            <ResultsPanel
              factors={data.top_buying_factors}
              complaints={data.top_complaints}
            />

            {/* Row 2: Sentiment Chart */}
            <SentimentChart data={data.sentiment} />

            {/* Row 3: Market Intelligence (if available) */}
            {data.market && (
              <>
                <MarketSummary
                  productName={data.market.product_name}
                  category={data.market.product_category}
                  summary={data.market.market_summary}
                />

                <PurchaseCriteria
                  criteria={data.market.key_purchase_criteria}
                />

                <CompetitorTable
                  competitors={data.market.competitors}
                  productRevenue={data.market.estimated_monthly_revenue}
                />
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-zinc-600 text-xs">
          Assesment for Pixii.ai.
        </footer>
      </div>
    </div>
  );
}
