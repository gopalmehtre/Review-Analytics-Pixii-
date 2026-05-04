// Quick script to search the debug HTML for review-related content
const fs = require("fs");
const html = fs.readFileSync("debug-output.html", "utf-8");

// Count occurrences of "review"
const reviewCount = (html.match(/review/gi) || []).length;
console.log(`Total "review" occurrences: ${reviewCount}`);

// Find unique patterns around "review"
const contexts = [];
const regex = /(.{0,80}review.{0,80})/gi;
let match;
while ((match = regex.exec(html)) !== null && contexts.length < 20) {
  const snippet = match[1].replace(/\s+/g, " ").trim();
  if (!contexts.some(c => c === snippet)) {
    contexts.push(snippet);
  }
}
console.log(`\n=== First 20 unique snippets containing "review" ===\n`);
contexts.forEach((s, i) => console.log(`${i + 1}. ${s}\n`));

// Check if it's a captcha/bot page
if (html.includes("captcha") || html.includes("CAPTCHA")) {
  console.log("\n⚠️  CAPTCHA DETECTED — Amazon is blocking the scraper!");
}
if (html.includes("robot") || html.includes("automated")) {
  console.log("\n⚠️  BOT DETECTION page detected!");
}
if (html.includes("To discuss automated access")) {
  console.log("\n⚠️  Amazon anti-bot page detected!");
}

// Check page title
const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
if (titleMatch) {
  console.log(`\nPage title: "${titleMatch[1].trim()}"`);
}
