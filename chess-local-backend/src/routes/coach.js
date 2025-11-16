const express = require('express')
const { coach } = require('../services/coachService')
const { validateCoachPayload } = require('../utils/validation')

const router = express.Router()

router.post('/', (req, res, next) => {
  try {
    const validation = validateCoachPayload(req.body)
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        errors: validation.errors
      })
    }

    const insights = coach(req.body)
    res.json({
      status: 'ok',
      insights,
      receivedAt: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
