require('dotenv').config()

const REQUIRED = ['OPENAI_API_KEY', 'CRUSTDATA_API_KEY']

for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required env var: ${key}`)
    process.exit(1)
  }
}

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CRUSTDATA_API_KEY: process.env.CRUSTDATA_API_KEY,
  CACHE_TTL_SCOUT: parseInt(process.env.CACHE_TTL_SCOUT || '300000'),
  CACHE_TTL_MEMO: parseInt(process.env.CACHE_TTL_MEMO || '900000'),
  CACHE_MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || '100'),
  RATE_LIMIT_SCOUT: parseInt(process.env.RATE_LIMIT_SCOUT || '20'),
  RATE_LIMIT_COMPANY: parseInt(process.env.RATE_LIMIT_COMPANY || '10'),
}
