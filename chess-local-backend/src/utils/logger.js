const levels = ['info', 'warn', 'error', 'debug']

function formatMessage (level, message, meta) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString()
  }

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta
  }

  return JSON.stringify(payload)
}

function log (level, message, meta = undefined) {
  if (!levels.includes(level)) {
    throw new Error(`Unsupported log level: ${level}`)
  }

  const formatted = formatMessage(level, message, meta)

  if (level === 'error') {
    console.error(formatted)
  } else if (level === 'warn') {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => log('debug', message, meta)
}
