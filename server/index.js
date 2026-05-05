const express = require("express");
const cors = require("cors");
const scrape = require("./scraper");
const chunkArr = require("./utils/chunk");
const { analyzeChunk, analyzeMarket } = require("./gemini");
const aggregate = require("./aggregate");
const mockData = require("./mockReviews.json");

const app = express();
app.use(cors());

app.get("/analyze", async (req, res) => {
  try {
    const { url, useMock } = req.query;

    // Toggle: use mock data in dev, real scraper in prod
    const reviews = useMock === "true" ? mockData : await scrape(url);

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({ error: "No reviews found." });
    }

    console.log(`[Server] Analyzing ${reviews.length} reviews...`);

    // Step 1: Chunk reviews and analyze sentiment/factors/complaints
    const chunks = chunkArr(reviews, 20);
    const limitedChunks = chunks.slice(0, 5); // Cap at 5 chunks

    const results = [];
    for (const chunk of limitedChunks) {
      const data = await analyzeChunk(chunk);
      results.push(data);
    }

    const aggregated = aggregate(results);
    console.log("[Server] Review analysis complete. Starting market analysis...");

    // Step 2: Run competitor & market analysis using the aggregated data
    let marketData = null;
    try {
      marketData = await analyzeMarket(reviews, aggregated, url || "mock product");
    } catch (marketErr) {
      console.warn("[Server] Market analysis failed (non-fatal):", marketErr.message);
      // Market analysis is optional — if it fails, we still return review data
    }

    // Merge review analysis + market analysis into one response
    const response = {
      ...aggregated,
      market: marketData || null,
    };

    console.log("[Server] Full analysis complete!");
    res.json(response);
  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
