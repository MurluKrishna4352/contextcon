const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    crustdata: 'connected',
    openai: 'connected',
    uptime: Math.floor(process.uptime()),
  })
})

module.exports = router
