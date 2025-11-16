const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const routes = require('./routes')
const logger = require('./utils/logger')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({
    name: 'chess-local-backend',
    version: '1.0.0',
    endpoints: ['/api/ping', '/api/analysis', '/api/coach']
  })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message })
  res.status(err.status || 500).json({
    message: 'Ocurrió un error inesperado',
    detail: err.message
  })
})

module.exports = app
