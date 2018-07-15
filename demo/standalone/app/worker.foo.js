const moment = require('moment')

module.exports = {
    queue: 'foo',
    version: 0,

    // how long to reserve a document for execution
    // (default: 5m) - see Postgres INTERVAL format
    // http://www.postgresqltutorial.com/postgresql-interval/
    lock: '1m',

    // how many parallel worker instances to run
    // (default: 1)
    concurrency: 1,

    // how many documents to fetch in advance
    // (default: 1)
    batch: 1,

    // delay in between of each document
    // (default: 0ms)
    delay: 1,

    // delay to apply if there are no documents to work out
    // you can choose a very long sleep time (hours) and trust
    // the push wake up system by enabling notifications for
    // this queue.
    sleep: 3600000, // 1h

    handler: async (doc, { worker }) => {
        console.log(`*** FOO WORKER *** ${worker.id} :: ${doc.subject}`)

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

        // the default action is to reschedule the document for further
        // execution 5 seconds in the future.
        return {
            action: 'reschedule',
            nextIteration: moment().add(10, 'seconds').format('YYYY-MM-DD HH:mm Z'),
            payload: {
                ...doc.payload,
                runs: (doc.payload.runs ||  0) + 1,
            },
        }
    }
}
