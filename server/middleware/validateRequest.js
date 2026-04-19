const { ValidationError } = require('./errorHandler')

function validateScoutQuery(req, res, next) {
  const { query } = req.body
  if (!query || typeof query !== 'string') {
    return next(new ValidationError('Please enter a query between 3 and 300 characters.'))
  }
  const trimmed = query.trim()
  if (trimmed.length < 3 || trimmed.length > 300) {
    return next(new ValidationError('Please enter a query between 3 and 300 characters.'))
  }
  req.body.query = trimmed
  next()
}

function validateCompanyDomain(req, res, next) {
  const { domain } = req.query
  if (!domain || typeof domain !== 'string' || !domain.includes('.')) {
    return next(new ValidationError('A valid company domain is required (e.g. ?domain=acme.com).'))
  }
  if (domain.includes('/') || domain.includes('\\')) {
    return next(new ValidationError('Invalid domain format.'))
  }
  next()
}

module.exports = { validateScoutQuery, validateCompanyDomain }
