const env = require('./config/env')
const app = require('./app')

app.listen(env.PORT, () => {
  console.info(`[Scout AI] Server running on port ${env.PORT} (${env.NODE_ENV})`)
})
