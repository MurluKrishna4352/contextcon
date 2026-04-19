const axios = require('axios')
const { CRUSTDATA_API_KEY } = require('../config/env')
const { UpstreamError, ValidationError, NotFoundError } = require('../middleware/errorHandler')

const crustdata = axios.create({
  baseURL: 'https://api.crustdata.com',
  timeout: 15000,
  headers: {
    Authorization: `Token ${CRUSTDATA_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

const VALID_FILTER_TYPES = new Set([
  'COMPANY_HEADCOUNT', 'ANNUAL_REVENUE', 'REGION', 'INDUSTRY', 'ACCOUNT_ACTIVITIES',
])

// Industry normalization — maps GPT output to confirmed-valid Crustdata values
const INDUSTRY_MAP = {
  // Tech / Software catch-alls
  'technology': 'Technology, Information and Internet',
  'tech': 'Technology, Information and Internet',
  'saas': 'Technology, Information and Internet',
  'b2b saas': 'Technology, Information and Internet',
  'software': 'Technology, Information and Internet',
  'software as a service': 'Technology, Information and Internet',
  'cloud software': 'Technology, Information and Internet',
  'enterprise software': 'Technology, Information and Internet',
  'computer software': 'Technology, Information and Internet',
  'information technology and services': 'IT Services and IT Consulting',
  'information technology': 'IT Services and IT Consulting',
  'it services': 'IT Services and IT Consulting',
  'artificial intelligence': 'Technology, Information and Internet',
  'ai': 'Technology, Information and Internet',
  'machine learning': 'Technology, Information and Internet',
  'ml': 'Technology, Information and Internet',
  'cloud computing': 'Technology, Information and Internet',
  'internet': 'Technology, Information and Internet',
  'cybersecurity': 'Computer and Network Security',
  'security': 'Computer and Network Security',
  'network security': 'Computer and Network Security',
  'data analytics': 'Data Infrastructure and Analytics',
  'analytics': 'Data Infrastructure and Analytics',
  'big data': 'Data Infrastructure and Analytics',
  'e-commerce': 'Internet Marketplace Platforms',
  'ecommerce': 'Internet Marketplace Platforms',
  'marketplace': 'Internet Marketplace Platforms',
  // Finance
  'fintech': 'Financial Services',
  'financial technology': 'Financial Services',
  'banking technology': 'Financial Services',
  'payments': 'Financial Services',
  'insurtech': 'Financial Services',
  // Health
  'healthtech': 'Biotechnology',
  'medtech': 'Biotechnology',
  'health technology': 'Biotechnology',
  'health care': 'Biotechnology',
  'healthcare': 'Biotechnology',
  'hospital & health care': 'Biotechnology',
  // Education
  'edtech': 'E-Learning',
  'education technology': 'E-Learning',
  // Climate
  'cleantech': 'Renewables & Environment',
  'climate tech': 'Renewables & Environment',
  'greentech': 'Renewables & Environment',
  'climate': 'Renewables & Environment',
  // Other
  'proptech': 'Real Estate',
  'legaltech': 'Legal Services',
  'hrtech': 'Human Resources',
  'agritech': 'Renewables & Environment',
  'agtech': 'Renewables & Environment',
  'marketing and advertising': 'Information Services',
  'market research': 'Information Services',
}

// City → country normalization for REGION filter
const CITY_TO_COUNTRY = {
  'bangalore': 'India', 'bengaluru': 'India', 'mumbai': 'India', 'delhi': 'India',
  'new delhi': 'India', 'hyderabad': 'India', 'chennai': 'India', 'pune': 'India',
  'new york': 'United States', 'san francisco': 'United States', 'austin': 'United States',
  'seattle': 'United States', 'boston': 'United States', 'chicago': 'United States',
  'los angeles': 'United States', 'new york city': 'United States', 'nyc': 'United States',
  'london': 'United Kingdom', 'manchester': 'United Kingdom', 'berlin': 'Germany',
  'munich': 'Germany', 'paris': 'France', 'amsterdam': 'Netherlands',
  'stockholm': 'Sweden', 'toronto': 'Canada', 'vancouver': 'Canada',
  'beijing': 'China', 'shanghai': 'China', 'shenzhen': 'China',
  'tokyo': 'Japan', 'osaka': 'Japan', 'seoul': 'South Korea',
  'sydney': 'Australia', 'melbourne': 'Australia',
  'dubai': 'United Arab Emirates', 'abu dhabi': 'United Arab Emirates',
  'nairobi': 'Kenya', 'lagos': 'Nigeria', 'accra': 'Ghana',
  'são paulo': 'Brazil', 'sao paulo': 'Brazil', 'buenos aires': 'Argentina',
  'mexico city': 'Mexico', 'bogota': 'Colombia',
  'tel aviv': 'Israel', 'jakarta': 'Indonesia', 'ho chi minh city': 'Vietnam',
  'kuala lumpur': 'Malaysia', 'bangkok': 'Thailand', 'manila': 'Philippines',
}

function normalizeIndustryValue(val) {
  const lower = val.toLowerCase().trim()
  return INDUSTRY_MAP[lower] || val
}

function normalizeRegionValue(val) {
  const lower = val.toLowerCase().trim()
  return CITY_TO_COUNTRY[lower] || val
}

function sanitizeFilters(filters) {
  if (!Array.isArray(filters)) return []
  return filters
    .filter(f => f && f.filter_type && VALID_FILTER_TYPES.has(f.filter_type))
    .map(f => {
      const values = (Array.isArray(f.value) ? f.value : [f.value]).filter(Boolean)
      let normalized = values
      if (f.filter_type === 'INDUSTRY') {
        normalized = values.map(normalizeIndustryValue)
      } else if (f.filter_type === 'REGION') {
        normalized = values.map(normalizeRegionValue)
      } else if (f.filter_type === 'COMPANY_HEADCOUNT') {
        // Fix common GPT mistake: "501-1000" → "501-1,000"
        normalized = values.map(v => v === '501-1000' ? '501-1,000' : v)
      }
      return { filter_type: f.filter_type, type: f.type || 'in', value: normalized }
    })
    .filter(f => f.value.length > 0)
}

// Progressively relax filters if Crustdata rejects — never send empty filter array
function relaxFilters(filters) {
  // Drop ACCOUNT_ACTIVITIES first (most restrictive), then COMPANY_HEADCOUNT
  const withoutActivities = filters.filter(f => f.filter_type !== 'ACCOUNT_ACTIVITIES')
  if (withoutActivities.length < filters.length && withoutActivities.length > 0) {
    return withoutActivities
  }
  const withoutHeadcount = filters.filter(
    f => f.filter_type !== 'ACCOUNT_ACTIVITIES' && f.filter_type !== 'COMPANY_HEADCOUNT'
  )
  if (withoutHeadcount.length > 0) return withoutHeadcount
  return null
}

async function postSearch(filters) {
  const body = { filters, page: 1 }
  console.info('[Crustdata] Sending filters:', JSON.stringify(body))
  const response = await crustdata.post('/screener/company/search', body)
  return response.data
}

/**
 * @param {Array} rawFilters - Filter array from OpenAI
 * @returns {Promise<Array>} Array of company objects
 */
async function searchCompanies(rawFilters) {
  const start = Date.now()
  let filters = sanitizeFilters(rawFilters)

  if (filters.length === 0) {
    throw new ValidationError('Query was too ambiguous — try adding a sector, stage, or region.')
  }

  const attemptSearch = async (filtersToTry) => {
    try {
      const data = await postSearch(filtersToTry)
      const elapsed = Date.now() - start
      const companies = data.companies || data || []
      const arr = Array.isArray(companies) ? companies : []
      console.info(`[Crustdata] POST /screener/company/search — 200 in ${elapsed}ms, count: ${arr.length}`)
      if (arr.length > 0) console.info('[Crustdata] Sample company keys:', Object.keys(arr[0]).join(', '))
      return arr
    } catch (err) {
      const status = err.response?.status
      const errBody = err.response?.data
      const elapsed = Date.now() - start
      console.error(`[Crustdata] POST /screener/company/search — ${status || 'ERR'} in ${elapsed}ms`)
      console.error('[Crustdata] Error body:', JSON.stringify(errBody))
      console.error('[Crustdata] Filters sent:', JSON.stringify(filtersToTry))

      if (status === 400) {
        return null // signal to retry with relaxed filters
      }
      if (status === 401) {
        throw new UpstreamError('Data connection error — invalid API key.', false)
      }
      if (status === 402) {
        console.error('[Crustdata] FATAL: Insufficient credits —', errBody?.error)
        throw new UpstreamError('Crustdata credits exhausted. Please top up your account.', false)
      }
      if (status === 429) {
        await new Promise(r => setTimeout(r, 3000))
        const retry = await crustdata.post('/screener/company/search', { filters: filtersToTry, page: 1 })
        return Array.isArray(retry.data.companies || retry.data) ? (retry.data.companies || retry.data) : []
      }
      throw new UpstreamError('Data service is temporarily unavailable. Please retry.', true)
    }
  }

  // First attempt
  let result = await attemptSearch(filters)
  if (result !== null) return result

  // Retry with relaxed filters
  const relaxed = relaxFilters(filters)
  if (relaxed) {
    console.info('[Crustdata] Retrying with relaxed filters:', JSON.stringify(relaxed))
    result = await attemptSearch(relaxed)
    if (result !== null) return result
  }

  throw new ValidationError('Query was too ambiguous — try adding a sector, stage, or region.')
}

/**
 * @param {string} domain - Company domain e.g. "acme.com"
 * @returns {Promise<Object>} Enriched company object with job_openings, news_articles
 */
async function enrichCompany(domain) {
  const start = Date.now()
  try {
    const response = await crustdata.get('/screener/company', {
      params: {
        company_domain: domain,
        fields: 'job_openings,news_articles',
      },
    })

    const elapsed = Date.now() - start
    console.info(`[Crustdata] GET /screener/company — 200 in ${elapsed}ms, domain: ${domain}`)

    const data = response.data
    const company = Array.isArray(data) ? data[0] : data
    if (!company) throw new NotFoundError('Company not found in our database — try a different domain.')
    return company
  } catch (err) {
    if (err.name === 'NotFoundError') throw err

    const elapsed = Date.now() - start
    const status = err.response?.status
    console.error(`[Crustdata] GET /screener/company — ${status || 'ERR'} in ${elapsed}ms`)
    console.error('[Crustdata] Error body:', JSON.stringify(err.response?.data))

    if (status === 404) throw new NotFoundError('Company not found in our database — try a different domain.')
    if (status === 401) throw new UpstreamError('Data connection error. Please contact support.', false)
    if (status === 429) {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const retry = await crustdata.get('/screener/company', {
          params: { company_domain: domain, fields: 'job_openings,news_articles' },
        })
        const retryCompany = Array.isArray(retry.data) ? retry.data[0] : retry.data
        if (!retryCompany) throw new NotFoundError('Company not found in our database.')
        return retryCompany
      } catch (retryErr) {
        if (retryErr.name === 'NotFoundError') throw retryErr
        throw new UpstreamError('Rate-limited — please try again in a few seconds.', true)
      }
    }

    throw new UpstreamError('Data service is temporarily unavailable. Please retry.', true)
  }
}

module.exports = { searchCompanies, enrichCompany }
