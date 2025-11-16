const { isFenValid, isPgnValid } = require('../utils/validation')

const plans = [
  {
    id: 'kingSafety',
    description: 'Refuerza la seguridad del rey antes de lanzar un ataque.',
    test: ({ fen }) => fen.includes(' w ') && fen.includes('k'),
    tips: ['Considera enrocarte o traer más piezas a la defensa.', 'Ubica torres en columnas abiertas.']
  },
  {
    id: 'spaceAdvantage',
    description: 'Convierte tu ventaja de espacio en rupturas concretas.',
    test: ({ pgn }) => /e4 e5/.test(pgn),
    tips: ['Avanza peones con respaldo de piezas.', 'Evita cambiar piezas sin necesidad.']
  },
  {
    id: 'counterPlay',
    description: 'Busca contrajuego inmediato en el flanco opuesto.',
    test: ({ question }) => /defender|ataque/i.test(question),
    tips: ['Identifica debilidades en el rey rival.', 'Usa movimientos intermedios para ganar tiempos.']
  }
]

function buildAnswer ({ question, fen, pgn }) {
  const matchedPlans = plans.filter(plan => {
    try {
      return plan.test({ question, fen, pgn })
    } catch (error) {
      return false
    }
  })

  const selected = matchedPlans.length > 0 ? matchedPlans : plans.slice(0, 1)

  const answer = selected
    .map(plan => `• ${plan.description}`)
    .join('\n')

  const tips = selected.flatMap(plan => plan.tips).slice(0, 4)

  return {
    answer,
    tips,
    followUp: `Pregunta recibida: "${question.trim()}". Usa la FEN ${fen} para reproducir la posición y revisa el PGN para el contexto.`
  }
}

function coach (payload) {
  if (!isFenValid(payload.fen) || !isPgnValid(payload.pgn)) {
    throw new Error('Los datos recibidos no son válidos para el análisis.')
  }

  return buildAnswer(payload)
}

module.exports = {
  coach
}
