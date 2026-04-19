const express = require('express')
const router = express.Router()
const { validateCompanyDomain } = require('../middleware/validateRequest')
const { companyLimiter } = require('../middleware/rateLimiter')
const { memoCache } = require('../cache/lruCache')
const { callClaude, parseJSON } = require('../services/claudeService')
const { enrichCompany } = require('../services/crustdataService')
const { mergeCompanyWithScore } = require('../services/scoringService')
const { MEMO_SYSTEM_PROMPT, buildMemoUserMessage } = require('../prompts/memoPrompt')
const { UpstreamError } = require('../middleware/errorHandler')

router.get('/', companyLimiter, validateCompanyDomain, async (req, res, next) => {
  try {
    const { domain } = req.query
    const cacheKey = `memo:${domain}`

    const cached = memoCache.get(cacheKey)
    if (cached) {
      console.debug(`[Cache] HIT for key: ${cacheKey}`)
      return res.json(cached)
    }
    console.info(`[Cache] MISS for key: ${cacheKey}`)

    // Enrich company from Crustdata
    const enriched = await enrichCompany(domain)

    // Generate memo via Claude
    const memoRaw = await callClaude({
      systemPrompt: MEMO_SYSTEM_PROMPT,
      userMessage: buildMemoUserMessage(enriched, enriched),
      maxTokens: 1500,
      temperature: 0.3,
    })

    let memo
    try {
      memo = parseJSON(memoRaw)
    } catch {
      const retryRaw = await callClaude({
        systemPrompt: MEMO_SYSTEM_PROMPT + '\n\nReturn ONLY valid JSON. Nothing else.',
        userMessage: buildMemoUserMessage(enriched, enriched),
        maxTokens: 1500,
        temperature: 0.2,
      })
      try {
        memo = parseJSON(retryRaw)
      } catch {
        throw new UpstreamError('AI response was malformed — please retry.', true)
      }
    }

    // Validate required memo keys
    const requiredKeys = ['overview', 'thesis', 'hiring', 'funding', 'signals', 'redFlags', 'recommendation', 'recommendationRationale']
    for (const key of requiredKeys) {
      if (!memo[key]) memo[key] = '—'
    }

    const company = mergeCompanyWithScore(enriched, {})
    const result = { company, memo }

    memoCache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
