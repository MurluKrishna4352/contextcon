const { callClaude, parseJSON } = require('./claudeService')
const { SCORING_SYSTEM_PROMPT, buildScoringUserMessage } = require('../prompts/scoringPrompt')
const { UpstreamError } = require('../middleware/errorHandler')

/**
 * @param {Array} companies - Raw Crustdata company array
 * @param {string} vcIntent - VC intent string from filter step
 * @returns {Promise<Array>} Companies merged with scoutScore and badges
 */
async function scoreCompanies(companies, vcIntent) {
  if (!companies.length) return []

  // Cap at 15 companies to stay within token budget
  const batch = companies.slice(0, 15)
  const userMessage = buildScoringUserMessage(batch, vcIntent)

  let rawText
  try {
    rawText = await callClaude({
      systemPrompt: SCORING_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 4096,
      temperature: 0.2,
    })
  } catch (err) {
    throw err
  }

  let scores
  try {
    const parsed = parseJSON(rawText)
    // OpenAI json_object mode returns an object — extract the array from any top-level key
    scores = Array.isArray(parsed)
      ? parsed
      : parsed.companies || parsed.scores || parsed.results || parsed.data || Object.values(parsed)[0]
  } catch {
    throw new UpstreamError('AI response was malformed — please retry.', true)
  }

  if (!Array.isArray(scores)) {
    throw new UpstreamError('AI response was malformed — please retry.', true)
  }

  const scoreMap = {}
  for (const s of scores) {
    scoreMap[s.id] = s
  }

  return batch.map((company, idx) => {
    const scoring = scoreMap[company.id] || scores[idx] || {}
    return mergeCompanyWithScore(company, scoring)
  })
}

/**
 * @param {Object} company - Raw Crustdata company
 * @param {Object} scoring - Claude score object
 * @returns {Object} Normalized company object for frontend
 */
function mergeCompanyWithScore(company, scoring) {
  const logoUrls = company.logo_urls || {}
  const growth = company.employee_growth_percentages || {}

  const totalRaised = company.total_investment_usd || 0
  const fundingStage = inferFundingStage(totalRaised, company.last_funding_date)

  return {
    id: company.id || company.company_id,
    name: company.company_name || company.name || company.display_name || null,
    domain: company.company_domain,
    logoUrl: logoUrls['100x100'] || logoUrls['200x200'] || null,
    industry: company.industry || 'Unknown',
    location: {
      city: company.hq_city || null,
      country: company.hq_country || null,
    },
    foundedYear: company.founded_year || null,
    headcount: company.employee_count || 0,
    headcountRange: company.employee_count_range || null,
    headcountGrowth: {
      sixMonths: growth['6_month'] ?? growth.six_months ?? null,
      oneYear: growth['1_year'] ?? growth.one_year ?? null,
      twoYear: growth['2_year'] ?? growth.two_years ?? null,
    },
    totalRaised,
    fundingStage,
    linkedinUrl: company.linkedin_url || null,
    website: company.company_domain ? `https://${company.company_domain}` : null,
    scoutScore: {
      total: scoring.score ?? 0,
      headcountGrowth: scoring.dimensions?.headcountGrowth ?? 0,
      hiringVelocity: scoring.dimensions?.hiringVelocity ?? 0,
      fundingStageFit: scoring.dimensions?.fundingStageFit ?? 0,
      marketSignal: scoring.dimensions?.marketSignal ?? 0,
    },
    signalBadges: scoring.badges || [],
    headline: scoring.headline || '',
  }
}

function inferFundingStage(totalRaisedUsd, lastFundingDate) {
  if (!totalRaisedUsd || totalRaisedUsd === 0) return 'Pre-Seed'
  if (totalRaisedUsd < 1_000_000) return 'Pre-Seed'
  if (totalRaisedUsd < 5_000_000) return 'Seed'
  if (totalRaisedUsd < 20_000_000) return 'Series A'
  if (totalRaisedUsd < 60_000_000) return 'Series B'
  return 'Series B+'
}

module.exports = { scoreCompanies, mergeCompanyWithScore }
