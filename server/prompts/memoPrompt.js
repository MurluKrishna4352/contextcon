const MEMO_SYSTEM_PROMPT = `You are a senior VC analyst writing an investment signal memo. Given enriched company data including job openings and news articles, write a structured JSON memo.

Return ONLY a valid JSON object with exactly these 8 keys:
- overview: 2 sentences describing the company, HQ, team size, business model
- thesis: 2-3 sentences explaining why this company is interesting RIGHT NOW based on live signals
- hiring: Analysis of open roles by function, engineering/sales/ops ratio, and what the hiring pattern signals
- funding: Total raised, last round date, investor names if available, burn rate estimate
- signals: Headcount growth data (6M/1Y/2Y), web traffic trend, notable news mentions
- redFlags: Honest cautionary notes about risks, over-hiring, stale funding, or weak signals
- recommendation: Exactly one of: "Reach out now" | "Monitor for 30 days" | "Pass at this stage"
- recommendationRationale: 1 sentence explaining the recommendation

Return ONLY valid JSON. No markdown, no explanation, no preamble.`

function buildMemoUserMessage(company, enrichment) {
  const jobOpenings = (enrichment.job_openings || []).slice(0, 20).map(j => ({
    title: j.title,
    department: j.department,
    location: j.location,
  }))

  const newsArticles = (enrichment.news_articles || []).slice(0, 10).map(n => ({
    headline: n.title || n.headline,
    date: n.published_date || n.date,
  }))

  const payload = {
    name: company.company_name,
    domain: company.company_domain,
    industry: company.industry,
    location: `${company.hq_city || ''}, ${company.hq_country || ''}`.trim().replace(/^,\s*/, ''),
    foundedYear: company.founded_year,
    headcount: company.employee_count,
    headcountGrowth: company.employee_growth_percentages,
    totalRaised: company.total_investment_usd,
    lastFundingDate: company.last_funding_date,
    description: (company.long_description || company.short_description || '').substring(0, 400),
    jobOpenings,
    newsArticles,
  }

  return `Company data:\n${JSON.stringify(payload, null, 2)}`
}

module.exports = { MEMO_SYSTEM_PROMPT, buildMemoUserMessage }
