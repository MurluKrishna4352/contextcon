const env = require('./config/env')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const { errorHandler } = require('./middleware/errorHandler')

const healthRouter = require('./routes/health')
const scoutRouter = require('./routes/scout')
const companyRouter = require('./routes/company')

const app = express()

app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true)
    // In production, allow the configured origin and any vercel.app preview URLs
    if (env.NODE_ENV === 'production') {
      if (
        origin === env.CLIENT_ORIGIN ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    }
    // In development, allow all origins
    callback(null, true)
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRouter)
app.use('/api/scout', scoutRouter)
app.use('/api/company', companyRouter)

app.use(errorHandler)

module.exports = app
