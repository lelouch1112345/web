const request = require('supertest')
const app = require('../src/app')

describe('chess-local-backend API', () => {
  it('responds to /api/ping', async () => {
    const response = await request(app).get('/api/ping')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', 'ok')
    expect(response.body).toHaveProperty('uptimeSeconds')
  })

  it('returns analysis payload', async () => {
    const response = await request(app).get('/api/analysis')
    expect(response.status).toBe(200)
    expect(response.body.count).toBeGreaterThan(0)
    expect(Array.isArray(response.body.items)).toBe(true)
  })

  it('validates coach payloads', async () => {
    const invalid = await request(app).post('/api/coach').send({})
    expect(invalid.status).toBe(400)

    const response = await request(app)
      .post('/api/coach')
      .send({
        question: '¿Cómo aprovecho mi ventaja?',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        pgn: '1. e4 e5 2. Nf3 Nc6'
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('insights')
    expect(response.body.insights).toHaveProperty('answer')
  })
})
