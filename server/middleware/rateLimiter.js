const rateLimit = require('express-rate-limit')
const { RATE_LIMIT_SCOUT, RATE_LIMIT_COMPANY } = require('../config/env')

const scoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMIT_SCOUT,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', code: 'RateLimitError', retryable: true },
})

const companyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMIT_COMPANY,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', code: 'RateLimitError', retryable: true },
})

module.exports = { scoutLimiter, companyLimiter }
