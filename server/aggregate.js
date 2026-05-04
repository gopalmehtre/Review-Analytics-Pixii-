function aggregate(results) {
  const factors = {};
  const complaints = {};
  let sentiment = { positive: 0, negative: 0, neutral: 0 };

  results.forEach((r) => {
    r.top_buying_factors.forEach((f) => {
      factors[f] = (factors[f] || 0) + 1;
    });
    r.top_complaints.forEach((c) => {
      complaints[c] = (complaints[c] || 0) + 1;
    });
    sentiment.positive += r.sentiment.positive;
    sentiment.negative += r.sentiment.negative;
    sentiment.neutral += r.sentiment.neutral;
  });

  // Sort by frequency and take top 5
  const top = (obj) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

  return {
    top_buying_factors: top(factors),
    top_complaints: top(complaints),
    sentiment,
  };
}

module.exports = aggregate;
