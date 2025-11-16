const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  const uptimeSeconds = process.uptime()
  res.json({
    status: 'ok',
    message: 'pong',
    uptimeSeconds,
    uptimeHuman: `${(uptimeSeconds / 60).toFixed(2)} minutos`,
    timestamp: new Date().toISOString()
  })
})

module.exports = router
