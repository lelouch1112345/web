const fs = require('fs')
const path = require('path')
const logger = require('../utils/logger')

let cachedAnalysis = null

function loadFromDisk () {
  const filePath = path.join(__dirname, '..', 'data', 'analysis.json')
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

function getAnalysis () {
  if (!cachedAnalysis) {
    try {
      cachedAnalysis = loadFromDisk()
      logger.info('Analysis dataset loaded', { entries: cachedAnalysis.length })
    } catch (error) {
      logger.error('Unable to read analysis data, falling back to mock', { error: error.message })
      cachedAnalysis = [
        {
          id: 'fallback',
          opening: 'Mock Game',
          pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
          evaluation: 0,
          bestLine: '4. O-O Nf6 5. Re1',
          mistakes: [],
          recommendations: ['Dataset no disponible, usando valores por defecto.']
        }
      ]
    }
  }

  return cachedAnalysis
}

module.exports = {
  getAnalysis
}
