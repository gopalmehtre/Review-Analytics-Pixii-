const express = require("express");
const cors = require("cors");
const scrape = require("./scraper");
const chunkArr = require("./utils/chunk");
const analyze = require("./gemini");
const aggregate = require("./aggregate");
const mockData = require("./mockReviews.json");

const app = express();
app.use(cors());

app.get("/analyze", async (req, res) => {
  try {
    const { url, useMock } = req.query;

    // Toggle: use mock data in dev, real scraper in prod
    const reviews =
      useMock === "true" ? mockData : await scrape(url);

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({ error: "No reviews found." });
    }

    const chunks = chunkArr(reviews, 20);

    // Cap at 5 chunks to avoid slow API responses
    const limitedChunks = chunks.slice(0, 5);

    const results = [];
    for (const chunk of limitedChunks) {
      const data = await analyze(chunk);
      results.push(data);
    }

    res.json(aggregate(results));
  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
