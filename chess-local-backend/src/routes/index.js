const express = require('express')
const pingRoute = require('./ping')
const analysisRoute = require('./analysis')
const coachRoute = require('./coach')

const router = express.Router()

router.use('/ping', pingRoute)
router.use('/analysis', analysisRoute)
router.use('/coach', coachRoute)

module.exports = router
