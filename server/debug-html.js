/**
 * Debug script: Fetches the Amazon reviews page via ScraperAPI
 * and saves the HTML + prints snippets around "review-body" or "review-text"
 * so we can see the actual HTML structure.
 */
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const productUrl = "https://www.amazon.in/product-reviews/B01CCGW4OE/?reviewerType=all_reviews&pageNumber=1";

async function debug() {
  console.log("[Debug] Fetching:", productUrl);

  const apiUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(productUrl)}&render=true`;

  const res = await axios.get(apiUrl, { timeout: 90000 });
  const html = res.data;

  // Save full HTML to file for inspection
  fs.writeFileSync("debug-output.html", html);
  console.log(`[Debug] Saved ${html.length} chars to debug-output.html`);

  // Search for common review-related patterns in the HTML
  const searchTerms = [
    "review-body",
    "review-text",
    "reviewText",
    "review-text-content",
    "a-section review",
    "cr-review-list",
    "review-data",
    "reviewContent",
  ];

  console.log("\n=== Pattern Search Results ===");
  for (const term of searchTerms) {
    const idx = html.indexOf(term);
    if (idx !== -1) {
      const snippet = html.substring(Math.max(0, idx - 100), idx + 300);
      console.log(`\n✅ Found "${term}" at index ${idx}:`);
      console.log("---SNIPPET START---");
      console.log(snippet);
      console.log("---SNIPPET END---\n");
    } else {
      console.log(`❌ "${term}" — NOT FOUND`);
    }
  }

  // Also check for any data-hook attributes
  const dataHookMatches = html.match(/data-hook="[^"]*review[^"]*"/g);
  if (dataHookMatches) {
    console.log("\n=== All data-hook attributes containing 'review' ===");
    const unique = [...new Set(dataHookMatches)];
    unique.forEach((m) => console.log("  ", m));
  } else {
    console.log("\n❌ No data-hook attributes containing 'review' found");
  }
}

debug().catch((err) => console.error("[Debug] Error:", err.message));
