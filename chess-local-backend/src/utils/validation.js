const fenPattern = /^(?:[pnbrqkPNBRQK1-8]+\/){7}[pnbrqkPNBRQK1-8]+ [wb] (?:K?Q?k?q?|-) (?:-|[a-h][36]) \d+ \d+$/
const pgnPattern = /\b\d+\.(?:\s*[PNBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:\+|#)?)+/i

function isFenValid (fen) {
  return typeof fen === 'string' && fenPattern.test(fen.trim())
}

function isPgnValid (pgn) {
  return typeof pgn === 'string' && pgnPattern.test(pgn)
}

function validateCoachPayload (payload = {}) {
  const errors = []

  if (!payload.question || payload.question.trim().length < 5) {
    errors.push('La pregunta debe tener al menos 5 caracteres.')
  }

  if (!isFenValid(payload.fen || '')) {
    errors.push('FEN inválido o con formato incorrecto.')
  }

  if (!isPgnValid(payload.pgn || '')) {
    errors.push('PGN inválido, debe incluir jugadas numeradas.')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

module.exports = {
  isFenValid,
  isPgnValid,
  validateCoachPayload
}
