const SCORING_SYSTEM_PROMPT = `You are a VC investment scoring engine. Given a list of companies from Crustdata and the analyst's original vc_intent, score each company 0-100 across 4 dimensions:

Scoring dimensions:
- headcountGrowth (max 30 pts): Based on employee_growth_percentages. 30%+ YoY = full points. Scale linearly.
- hiringVelocity (max 25 pts): Based on job_openings_count and engineering ratio. Active engineering hiring = strong signal.
- fundingStageFit (max 25 pts): Companies with <$10M raised and recent funding = high score. Series B+ = lower score.
- marketSignal (max 20 pts): Based on news_articles recency, web traffic trend, general momentum.

For each company also generate:
- 2-4 signal badges (strings) from: "Hiring Fast", "High Growth", "Recent Funding", "Exec Hire", "Pre-Seed", "Seed Stage", "Series A", "Series B+", "Early Stage", "Scaling Fast", "Strong Signal"
- A one-line headline string (max 15 words) summarizing the investment signal

Return ONLY a valid JSON object with a "companies" key containing the array. No markdown, no explanation.

Example output format:
{
  "companies": [
    {
      "id": "company_id_from_input",
      "score": 78,
      "dimensions": {
        "headcountGrowth": 24,
        "hiringVelocity": 20,
        "fundingStageFit": 22,
        "marketSignal": 12
      },
      "badges": ["High Growth", "Hiring Fast", "Seed Stage"],
      "headline": "Fastest-growing B2B SaaS in the Bangalore ecosystem"
    }
  ]
}`

function buildScoringUserMessage(companies, vcIntent) {
  const truncated = companies.map(c => ({
    id: c.id,
    name: c.company_name,
    headcount: c.employee_count,
    headcountGrowth: c.employee_growth_percentages,
    totalRaised: c.total_investment_usd,
    lastFundingDate: c.last_funding_date,
    industry: c.industry,
    jobOpeningsCount: c.job_openings_count || 0,
    description: (c.long_description || c.short_description || '').substring(0, 200),
  }))

  return `VC intent: "${vcIntent}"\n\nCompanies to score:\n${JSON.stringify(truncated, null, 2)}`
}

module.exports = { SCORING_SYSTEM_PROMPT, buildScoringUserMessage }
