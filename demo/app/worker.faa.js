const moment = require('moment')

module.exports = {
    queue: 'faa',
    version: 0,

    // how long to reserve a document for execution
    // (default: 5m) - see Postgres INTERVAL format
    // http://www.postgresqltutorial.com/postgresql-interval/
    lock: '1m',

    // how many parallel worker instances to run
    // (default: 1)
    concurrency: 8,

    // how many documents to fetch in advance
    // (default: 1)
    batch: 100,

    // delay in between of each document
    // (default: 0ms)
    delay: 250,

    // delay to apply if there are no documents to work out
    // you can choose a very long sleep time (hours) and trust
    // the push wake up system by enabling notifications for
    // this queue.
    sleep: 1000 * 60, // 1 minute

    // worker function - what to do with the document
    handler: async (doc, { worker }) => {
        console.log(`*** FAA WORKER *** ${worker.id} :: ${doc.subject}`)
        return { action: 'complete' }
    }
}
