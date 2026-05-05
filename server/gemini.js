const OpenAI = require("openai");
require("dotenv").config();

// Use Gemini via OpenAI-compatible endpoint (same API key works)
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

/**
 * Clean review text: strip HTML entities, excessive whitespace, and non-printable chars.
 */
function sanitizeReviews(reviews) {
  return reviews
    .map((r) =>
      r
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#\d+;/g, "")
        .replace(/[^\x20-\x7E\n]/g, " ") // Keep only ASCII printable + newlines
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((r) => r.length > 10); // Drop empty/tiny fragments
}

/**
 * Helper: call Gemini with model fallback + retry logic.
 * Reused by both analyzeChunk and analyzeMarket.
 */
async function callGemini(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${retries}...`);

      const models = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
      let response = null;
      let lastModelErr = null;

      for (const model of models) {
        try {
          console.log(`[Gemini]   Trying model: ${model}`);
          response = await openai.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
          });
          console.log(`[Gemini]   Model ${model} responded!`);
          break;
        } catch (modelErr) {
          const s = modelErr.status || "unknown";
          console.warn(`[Gemini]   Model ${model} -> HTTP ${s}`);
          lastModelErr = modelErr;
          continue;
        }
      }

      if (!response) throw lastModelErr;

      const raw = response.choices[0].message.content;
      const clean = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch (err) {
      const status = err.status || err.response?.status || "unknown";
      const errorBody = err.error || err.response?.data || {};
      const errorMsg =
        errorBody.message || errorBody.error?.message || err.message;
      console.warn(
        `[Gemini] Attempt ${attempt} failed (HTTP ${status}): ${errorMsg}`
      );

      if ((status === 429 || status === 400) && attempt < retries) {
        const waitMs = status === 429 ? attempt * 15000 : 5000;
        console.log(`[Gemini] Waiting ${waitMs / 1000}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (attempt === retries) {
        if (status === 429) {
          throw new Error(
            "Gemini API rate limit exceeded after all retries. Wait 1 minute and try again, or try with mock data."
          );
        }
        throw new Error(`Gemini API failed (HTTP ${status}): ${errorMsg}`);
      }
    }
  }
}

/**
 * Analyze a chunk of reviews for sentiment, buying factors, and complaints.
 */
async function analyzeChunk(reviews) {
  const cleanReviews = sanitizeReviews(reviews);
  console.log(
    `[Gemini] Sanitized ${reviews.length} reviews -> ${cleanReviews.length} valid`
  );

  if (cleanReviews.length === 0) {
    return {
      top_buying_factors: [],
      top_complaints: [],
      sentiment: { positive: 0, negative: 0, neutral: 0 },
    };
  }

  const prompt = `You are a product analyst. Analyze these ${cleanReviews.length} customer reviews.
Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "top_buying_factors": ["factor1", "factor2"],
  "top_complaints": ["complaint1", "complaint2"],
  "sentiment": { "positive": 0, "negative": 0, "neutral": 0 }
}

Rules:
- top_buying_factors: the most common reasons people liked or bought the product
- top_complaints: the most common complaints or issues
- sentiment: count how many reviews are positive, negative, or neutral
- Counts must add up to ${cleanReviews.length}

Reviews:
${cleanReviews.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;

  return callGemini(prompt);
}

/**
 * Perform a competitor & market analysis based on the product reviews
 * and the aggregated sentiment data. Uses Gemini as a market intelligence engine.
 */
async function analyzeMarket(reviews, aggregatedData, productUrl) {
  const cleanReviews = sanitizeReviews(reviews);
  const sampleReviews = cleanReviews.slice(0, 20);

  const prompt = `You are a senior Amazon marketplace analyst with deep knowledge of e-commerce economics.

I am analyzing an Amazon product. Here is the data I have:
- Product URL: ${productUrl || "Unknown"}
- Number of reviews analyzed: ${cleanReviews.length}
- Top buying factors customers mention: ${JSON.stringify(aggregatedData.top_buying_factors)}
- Top complaints: ${JSON.stringify(aggregatedData.top_complaints)}
- Sentiment: ${JSON.stringify(aggregatedData.sentiment)}

Sample reviews from this product:
${sampleReviews.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Based on this product and its reviews, perform a full market analysis.

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "product_name": "Best guess at the product name from the reviews",
  "product_category": "The product category/niche",
  "estimated_monthly_revenue": "$X,XXX - $XX,XXX",
  "key_purchase_criteria": [
    {
      "criteria": "Name of criteria",
      "importance": "High/Medium/Low",
      "description": "Brief explanation of why this matters to buyers"
    }
  ],
  "competitors": [
    {
      "rank": 1,
      "name": "Competitor brand + product name",
      "estimated_monthly_revenue": "$X,XXX - $XX,XXX",
      "strengths": "Key strength vs your product",
      "weakness": "Key weakness vs your product",
      "threat_level": "High/Medium/Low"
    }
  ],
  "market_summary": "2-3 sentence summary of the competitive landscape and your product's position"
}

Rules:
- key_purchase_criteria: List exactly 6 criteria that matter most to buyers in this niche, ordered by importance
- competitors: List exactly 9 competitor products that compete in the same category on Amazon India
- For revenue estimates, use realistic ranges based on typical Amazon India sales volumes for this category
- Be specific with competitor names — use real brands and products that exist on Amazon India
- threat_level should reflect how directly they compete with this product`;

  console.log("[Market] Starting competitor & market analysis...");
  const result = await callGemini(prompt);
  console.log("[Market] Market analysis complete!");
  return result;
}

module.exports = { analyzeChunk, analyzeMarket };
