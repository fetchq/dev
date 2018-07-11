const moment = require('moment')

module.exports = {
    queue: 'foo',
    handler: async (doc, { worker }) => {
        console.log(`${worker.id} :: ${doc.subject}`)

        if (doc.subject === 'a2') {
            return {
                action: 'reject',
                message: 'I do not like a2',
                details: {
                    foo: 123
                },
                refId: 'xxx',
            }
        }

        if (doc.subject === 'a3') {
            return {
                action: 'kill',
                payload: {
                    ...doc.payload,
                    killed: true,
                },
            }
        }

        if (doc.subject === 'a4') {
            return {
                action: 'complete',
                payload: {
                    ...doc.payload,
                    completed: true,
                },
            }
        }

        if (doc.subject === 'a5') {
            return {
                action: 'drop',
            }
        }

        if (doc.subject === 'a6') {
            return {
                action: 'XXX-NOT-IMPLEMENTED-XXX',
            }
        }

        return {
            action: 'reschedule',
            nextIteration: moment().format('YYYY-MM-DD HH:mm Z'),
            payload: {
                ...doc.payload,
                runs: (doc.payload.runs ||  0) + 1,
            },
        }
    }
}
