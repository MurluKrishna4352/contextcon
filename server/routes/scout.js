const express = require('express')
const router = express.Router()
const { validateScoutQuery } = require('../middleware/validateRequest')
const { scoutLimiter } = require('../middleware/rateLimiter')
const { scoutCache, normalizeQuery } = require('../cache/lruCache')
const { callClaude, parseJSON } = require('../services/claudeService')
const { searchCompanies } = require('../services/crustdataService')
const { scoreCompanies } = require('../services/scoringService')
const { FILTER_SYSTEM_PROMPT, buildFilterUserMessage } = require('../prompts/filterPrompt')
const { UpstreamError } = require('../middleware/errorHandler')

router.post('/', scoutLimiter, validateScoutQuery, async (req, res, next) => {
  try {
    const { query } = req.body
    const cacheKey = `scout:${normalizeQuery(query)}`

    const cached = scoutCache.get(cacheKey)
    if (cached) {
      console.debug(`[Cache] HIT for key: ${cacheKey}`)
      return res.json(cached)
    }
    console.info(`[Cache] MISS for key: ${cacheKey}`)

    // Step A: NL → Crustdata filters via Claude
    const filterRaw = await callClaude({
      systemPrompt: FILTER_SYSTEM_PROMPT,
      userMessage: buildFilterUserMessage(query),
      maxTokens: 512,
      temperature: 0.1,
    })

    let filterResult
    try {
      filterResult = parseJSON(filterRaw)
    } catch {
      const retryRaw = await callClaude({
        systemPrompt: FILTER_SYSTEM_PROMPT + '\n\nReturn ONLY valid JSON. Nothing else.',
        userMessage: buildFilterUserMessage(query),
        maxTokens: 512,
        temperature: 0.1,
      })
      try {
        filterResult = parseJSON(retryRaw)
      } catch {
        throw new UpstreamError('AI response was malformed — please retry.', true)
      }
    }

    const { filters, vc_intent: vcIntent } = filterResult
    console.info('[Scout] Generated filters:', JSON.stringify(filterResult))

    // Step B: Fetch companies from Crustdata
    const rawCompanies = await searchCompanies(filters)

    if (!rawCompanies.length) {
      const result = { companies: [], interpretedFilters: filterResult, totalCount: 0 }
      scoutCache.set(cacheKey, result)
      return res.json(result)
    }

    // Step C: Score and rank companies via Claude
    const scoredCompanies = await scoreCompanies(rawCompanies, vcIntent || query)
    scoredCompanies.sort((a, b) => b.scoutScore.total - a.scoutScore.total)

    const result = {
      companies: scoredCompanies,
      interpretedFilters: filterResult,
      totalCount: scoredCompanies.length,
    }

    scoutCache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
