# Review Analytics

AI-powered Amazon review analysis tool. Extracts actionable insights — top buying factors, common complaints, and sentiment breakdown — from up to 100 product reviews in seconds.

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
4. View results: Top Buying Factors, Top Complaints, Sentiment Chart

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
  "sentiment": { "positive": 28, "negative": 14, "neutral": 8 }
}
```

---

## Architecture

```
review-analytics/
├── server/
│   ├── index.js          ← Express server + /analyze route
│   ├── scraper.js        ← ScraperAPI handling (bypasses bot detection, tries multiple regex patterns)
│   ├── gemini.js         ← Gemini analysis via OpenAI SDK (sanitizes data + auto-retry on 429)
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
    │       └── Spinner.jsx         ← Loading indicator
```

---

## Features & Robustness

1. **Smart Scraping:** Fetches the main product page (`/dp/ASIN`) to bypass login redirects on Amazon India.
2. **Fallback Mechanisms:** Try-catches AJAX endpoints and uses multiple regex patterns to extract reviews regardless of HTML structure changes.
3. **Data Sanitization:** Cleans HTML entities and excessive whitespace before sending to Gemini to prevent `400 Bad Request` errors.
4. **AI Rate-Limit Handling:** Integrates the OpenAI SDK to cycle through multiple Gemini models (`2.5-flash`, `2.0-flash-lite`) and uses exponential backoff to handle `429 Too Many Requests` gracefully.
