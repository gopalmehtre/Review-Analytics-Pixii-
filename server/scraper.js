const axios = require("axios");
require("dotenv").config();

/**
 * Normalize a URL to ensure it has the https:// protocol prefix.
 */
function normalizeUrl(url) {
  let normalized = url.trim();
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = "https://" + normalized;
  }
  if (normalized.match(/^https?:\/\/amazon\./i)) {
    normalized = normalized.replace(/^(https?:\/\/)(amazon\.)/i, "$1www.$2");
  }
  return normalized;
}

/**
 * Extract the ASIN from an Amazon URL.
 */
function extractAsin(url) {
  const match = url.match(/\/(?:dp|product-reviews|gp\/product)\/([A-Z0-9]{10})/i);
  if (!match) {
    throw new Error("Could not extract ASIN from URL. Make sure it's a valid Amazon product link containing /dp/XXXXXXXXXX.");
  }
  return match[1];
}

/**
 * Extract domain from URL (e.g. https://www.amazon.in)
 */
function extractDomain(url) {
  const match = url.match(/(https?:\/\/[^/]+)/);
  return match ? match[1] : "https://www.amazon.in";
}

/**
 * Scrape reviews from the main product page (doesn't require login).
 * Amazon India redirects /product-reviews/ to sign-in, so we scrape
 * from the product page itself which has reviews embedded.
 */
async function scrapeReviews(productUrl) {
  if (!process.env.SCRAPER_API_KEY) {
    throw new Error("SCRAPER_API_KEY is not set in .env");
  }

  const normalized = normalizeUrl(productUrl);
  const asin = extractAsin(normalized);
  const domain = extractDomain(normalized);

  // Strategy 1: Scrape from the main product page (public, no login needed)
  const productPageUrl = `${domain}/dp/${asin}`;
  console.log(`[Scraper] Strategy 1 — Fetching product page: ${productPageUrl}`);

  const apiUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(productPageUrl)}&render=true`;

  let html;
  try {
    const res = await axios.get(apiUrl, { timeout: 90000 });
    html = typeof res.data === "string" ? res.data : String(res.data);
    console.log(`[Scraper] Got HTML response: ${html.length} characters`);
  } catch (reqErr) {
    const status = reqErr.response ? reqErr.response.status : "unknown";
    console.error(`[Scraper] ScraperAPI returned HTTP ${status}`);
    throw new Error(
      `ScraperAPI request failed (HTTP ${status}). Check your API key and credits at https://dashboard.scraperapi.com`
    );
  }

  // Check for bot detection / captcha / sign-in pages
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : "";
  console.log(`[Scraper] Page title: "${pageTitle}"`);

  if (pageTitle.includes("Sign-In") || pageTitle.includes("Robot Check") || html.includes("captcha")) {
    console.warn("[Scraper] ⚠️ Amazon returned a sign-in/captcha page instead of the product");
    throw new Error(
      "Amazon blocked the request with a sign-in/captcha page. " +
      "ScraperAPI could not bypass it. Try again in a few minutes, or use mock data."
    );
  }

  // Try multiple patterns to extract reviews from the product page
  const allReviews = [];

  const patterns = [
    // Pattern 1: data-hook="review-body" (standard)
    /data-hook="review-body"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/g,
    // Pattern 2: review-text-content class
    /class="review-text-content"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/g,
    // Pattern 3: data-hook reviewText
    /data-hook="review-body"[^>]*>([\s\S]*?)<\/div>/g,
    // Pattern 4: reviewText class (older layout)
    /class="reviewText"[^>]*>([\s\S]*?)<\/div>/g,
    // Pattern 5: a-expander-content review text (Amazon India)
    /class="a-expander-content[^"]*"[^>]*>\s*<span[^>]*data-hook="review-body"[^>]*>([\s\S]*?)<\/span>/g,
    // Pattern 6: broader catch — any span inside a review container
    /class="[^"]*review[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]{20,500}?)<\/span>/g,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null && allReviews.length < 100) {
      const cleaned = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (cleaned.length > 15 && !allReviews.includes(cleaned)) {
        allReviews.push(cleaned);
      }
    }
    if (allReviews.length > 0) {
      console.log(`[Scraper] Matched with pattern: ${regex.source.substring(0, 50)}...`);
      break;
    }
  }

  console.log(`[Scraper] Found ${allReviews.length} reviews from product page`);

  // Strategy 2: If product page didn't have enough reviews, try the AJAX reviews endpoint
  if (allReviews.length < 5) {
    console.log("[Scraper] Strategy 2 — Trying AJAX reviews endpoint...");
    try {
      const ajaxUrl = `${domain}/hz/reviews-render/ajax/reviews/get/ref/cm_cr_getr_d_paging_btm_next_1`;
      const ajaxBody = `sortBy=recent&reviewerType=all_reviews&formatType=current_format&mediaType=all_contents&filterByStar=all_stars&filterByLanguage=all_languages&pageNumber=1&pageSize=10&asin=${asin}&scope=reviewsAjax1`;

      const ajaxApiUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(ajaxUrl)}&render=false`;

      const ajaxRes = await axios.post(ajaxApiUrl, ajaxBody, {
        timeout: 60000,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const ajaxHtml = typeof ajaxRes.data === "string" ? ajaxRes.data : String(ajaxRes.data);
      console.log(`[Scraper] AJAX response: ${ajaxHtml.length} characters`);

      // Same patterns on AJAX response
      for (const regex of patterns) {
        regex.lastIndex = 0; // Reset regex
        let match;
        while ((match = regex.exec(ajaxHtml)) !== null && allReviews.length < 100) {
          const cleaned = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          if (cleaned.length > 15 && !allReviews.includes(cleaned)) {
            allReviews.push(cleaned);
          }
        }
      }
      console.log(`[Scraper] After AJAX: total ${allReviews.length} reviews`);
    } catch (ajaxErr) {
      console.warn(`[Scraper] AJAX strategy failed: ${ajaxErr.message}`);
    }
  }

  if (allReviews.length === 0) {
    throw new Error(
      "No reviews could be extracted. Amazon may be blocking automated access. " +
      "Try using mock data instead (click 'or try with mock data')."
    );
  }

  console.log(`[Scraper] Total reviews scraped: ${allReviews.length}`);
  return allReviews.slice(0, 100);
}

module.exports = scrapeReviews;
