const { LRUCache } = require('lru-cache')
const { CACHE_TTL_SCOUT, CACHE_TTL_MEMO, CACHE_MAX_SIZE } = require('../config/env')

const scoutCache = new LRUCache({
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL_SCOUT,
})

const memoCache = new LRUCache({
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL_MEMO,
})

function normalizeQuery(query) {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

module.exports = { scoutCache, memoCache, normalizeQuery }
