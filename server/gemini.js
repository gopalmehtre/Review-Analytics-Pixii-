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
  return reviews.map((r) =>
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
  ).filter((r) => r.length > 10); // Drop empty/tiny fragments
}

async function analyzeChunk(reviews, retries = 3) {
  const cleanReviews = sanitizeReviews(reviews);
  console.log(`[Gemini] Sanitized ${reviews.length} reviews → ${cleanReviews.length} valid`);

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

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${retries} — sending ${cleanReviews.length} reviews...`);

      // Try multiple models — each has separate rate limits
      const models = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
      let response = null;
      let lastModelErr = null;

      for (const model of models) {
        try {
          console.log(`[Gemini]   Trying model: ${model}`);
          response = await openai.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
          });
          console.log(`[Gemini]   Model ${model} responded!`);
          break; // success — exit model loop
        } catch (modelErr) {
          const s = modelErr.status || "unknown";
          console.warn(`[Gemini]   Model ${model} -> HTTP ${s}`);
          lastModelErr = modelErr;
          continue; // always try the next model
        }
      }

      if (!response) throw lastModelErr; // all models failed

      const raw = response.choices[0].message.content;
      console.log("[Gemini] Got response, parsing JSON...");

      // Strip markdown fences before parsing
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      console.log("[Gemini]  Success!");
      return parsed;
    } catch (err) {
      const status = err.status || err.response?.status || "unknown";
      // Try to extract detailed error message
      const errorBody = err.error || err.response?.data || {};
      const errorMsg = errorBody.message || errorBody.error?.message || err.message;
      console.warn(`[Gemini] Attempt ${attempt} failed (HTTP ${status}): ${errorMsg}`);

      if (status === 429 && attempt < retries) {
        const waitMs = attempt * 15000;
        console.log(`[Gemini] Rate limited. Waiting ${waitMs / 1000}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (status === 400 && attempt < retries) {
        // 400 can be transient — wait a bit and retry
        console.log(`[Gemini] Bad request. Waiting 5s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      if (attempt === retries) {
        if (status === 429) {
          throw new Error(
            "Gemini API rate limit exceeded after all retries. " +
            "Wait 1 minute and try again, or try with mock data."
          );
        }
        if (status === 403) {
          throw new Error(
            "Gemini API key is invalid or disabled. Get a new key at https://aistudio.google.com/apikey"
          );
        }
        throw new Error(`Gemini API failed (HTTP ${status}): ${errorMsg}`);
      }
    }
  }
}

module.exports = analyzeChunk;
