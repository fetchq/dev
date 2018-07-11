
// Setup winston log level
const winston = require('winston')
const config = require('@marcopeg/utils/lib/config')
winston.level = process.env.LOG_LEVEL || 'verbose'

const env = require('./src/services/env')
const fetchq = require('./src/services/fetchq')
const server = require('./src/services/server')

const boot = async () => {
    try {
        winston.verbose('[boot] init services...')
        await env.init()
        await fetchq.init({
            logLevel: winston.level,
        })
        await server.init()

        winston.verbose('[boot] start services...')
        await fetchq.start()
        await server.start({
            port: config.get('SERVER_PORT'),
        })

        winston.verbose('[boot] completed!')
    } catch (err) {
        winston.error('[boot] Oooh snap!')
        winston.error(`[boot] ${err.message}`)
        winston.debug(err)
    }
}

boot()
