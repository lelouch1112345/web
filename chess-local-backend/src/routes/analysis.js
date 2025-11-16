const express = require('express')
const { getAnalysis } = require('../services/analysisService')

const router = express.Router()

router.get('/', (req, res, next) => {
  try {
    const analysis = getAnalysis()
    res.json({
      generatedAt: new Date().toISOString(),
      count: analysis.length,
      items: analysis
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
