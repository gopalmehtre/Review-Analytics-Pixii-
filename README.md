# Review Analytics

AI-powered Amazon review analysis tool. Extracts actionable insights — top buying factors, common complaints, sentiment breakdown, competitor analysis, and revenue estimates — from product reviews in seconds.

**Stack:** React · Node.js · Express  
**AI Engine:** Google Gemini (2.5 Flash / 2.0 Flash Lite) via OpenAI SDK  
**Scraping:** ScraperAPI (production) / Mock JSON (dev)

---

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
```

Add your API keys to `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SCRAPER_API_KEY=your_scraper_api_key_here
```

Start the server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Usage

1. Open `http://localhost:5173` in your browser
2. Paste an Amazon product URL (e.g., `amazon.in/dp/B01CCGW4OE`) and click **Analyze**
3. Or click **"try with mock data"** to test without API keys / bypass Amazon's bot detection
4. View results: Top Buying Factors, Top Complaints, Sentiment Chart, Purchase Criteria, and Competitor Table.

---

## API Keys

| Service    | Get Key From                              | Notes           |
| ---------- | ----------------------------------------- | ------------------- |
| Gemini AI  | https://aistudio.google.com/app/apikey    | Free tier rate limits apply (30 RPM for Flash Lite). The app includes auto-retry with exponential backoff. |
| ScraperAPI | https://www.scraperapi.com/               | Requires JS rendering (`render=true`) which consumes 10 credits per request.  |

---

## API Endpoint

```
GET /analyze?url=<amazon_url>&useMock=<true|false>
```

**Response:**

```json
{
  "top_buying_factors": ["Battery life", "Build quality", "Value for money", "Easy setup", "Portable"],
  "top_complaints": ["Broke quickly", "Poor packaging", "Misleading description", "Bad customer service", "Overpriced"],
  "sentiment": { "positive": 28, "negative": 14, "neutral": 8 },
  "market": {
    "product_name": "Sample Product",
    "product_category": "Sample Category",
    "market_summary": "Sample summary...",
    "estimated_monthly_revenue": "$10,000 - $20,000",
    "key_purchase_criteria": [
      {
        "criteria": "Battery",
        "importance": "High",
        "description": "Crucial for everyday use."
      }
    ],
    "competitors": [
      {
        "rank": 1,
        "name": "Competitor X",
        "estimated_monthly_revenue": "$15,000 - $25,000",
        "strengths": "Better brand recognition",
        "weakness": "Higher price",
        "threat_level": "High"
      }
    ]
  }
}
```

---

## Architecture

```
review-analytics/
├── server/
│   ├── index.js          ← Express server + /analyze route
│   ├── scraper.js        ← ScraperAPI handling (bypasses bot detection, tries multiple regex patterns)
│   ├── gemini.js         ← Gemini analysis via OpenAI SDK (sanitizes data, handles rate limits, generates market intel)
│   ├── aggregate.js      ← Merge chunk results into final JSON
│   ├── mockReviews.json  ← 50 fake reviews (dev fallback)
│   ├── .env              ← API keys (excluded from git)
│   └── utils/
│       └── chunk.js      ← Split reviews into groups of 20
│
└── client/
    ├── src/
    │   ├── App.jsx             ← Root component + state
    │   └── components/
    │       ├── UrlInput.jsx        ← URL input + Analyze button
    │       ├── ResultsPanel.jsx    ← Buying factors + complaints
    │       ├── SentimentChart.jsx  ← Recharts bar chart
    │       ├── CompetitorTable.jsx ← Competitor analysis & revenue estimates
    │       ├── PurchaseCriteria.jsx← Key purchase criteria badges
    │       ├── MarketSummary.jsx   ← AI-generated market position
    │       └── Spinner.jsx         ← Loading indicator
```

---

## Features & Robustness

1. **Market Intelligence AI Hack:** Instead of relying on long-running, timeout-prone scrapers to scrape 10,000 competitor reviews, the app leverages Gemini 2.5 Flash as a "Market Analyst". It synchronously deduces 9 top competitors, estimates monthly revenues, and extracts key purchase criteria based on the main listing's review profile. This keeps the app completely stateless, lightning-fast (15 seconds), and removes the need for a database.
2. **Smart Scraping:** Fetches the main product page (`/dp/ASIN`) to bypass login redirects on Amazon India.
3. **Fallback Mechanisms:** Try-catches AJAX endpoints and uses multiple regex patterns to extract reviews regardless of HTML structure changes.
4. **Data Sanitization:** Cleans HTML entities and excessive whitespace before sending to Gemini to prevent `400 Bad Request` errors.
5. **AI Rate-Limit Handling:** Integrates the OpenAI SDK to cycle through multiple Gemini models (`2.5-flash`, `2.0-flash-lite`) and uses exponential backoff to handle `429 Too Many Requests` gracefully.
