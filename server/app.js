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
  origin: env.NODE_ENV === 'production' ? env.CLIENT_ORIGIN : '*',
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
