class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

class RateLimitError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RateLimitError'
  }
}

class UpstreamError extends Error {
  constructor(message, retryable = true) {
    super(message)
    this.name = 'UpstreamError'
    this.retryable = retryable
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  console.error(`[ERROR] ${err.name}: ${err.message}`, err.stack)

  const statusMap = {
    ValidationError: 400,
    NotFoundError: 404,
    RateLimitError: 429,
    UpstreamError: 502,
  }

  const status = statusMap[err.name] || 500
  const retryable = err.retryable ?? (status >= 500)

  res.status(status).json({
    error: err.message || 'An unexpected error occurred',
    code: err.name || 'InternalError',
    retryable,
  })
}

module.exports = { errorHandler, ValidationError, NotFoundError, RateLimitError, UpstreamError }
