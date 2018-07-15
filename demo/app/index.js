
const config = require('@marcopeg/utils/lib/config')

// Connected as Docker volume by `docker-compose.yml`
// (will become an npm module)
const fetchq = require('../../../node-client')

const boot = async () => {
    
    /**
     * Setup the client
     */
    const client = fetchq({
        // set maintenance daemon properties
        maintenance: {
            limit: 3,       // how many jobs to run in one single server call?
            delay: 250,     // how long to wait in between of successfull executions?
            sleep: 2500,    // how long to wait if there is no further maintenance planned?
        },

        // register all the workers you want to run
        workers: [
            require('./worker.foo'),
            require('./worker.faa'),
        ],
    })

    /**
     * Connect to the Database
     */
    try {
        await client.start()
    } catch (err) {
        client.logger.verbose(`FetchQ could not connect to Postgres - ${err.message}`)
        return
    }



    /**
     * Auto initialization test
     * (you normally initialize Fetchq only once and you do it manually)
     */
    
    try {
        const info = await client.info()
        client.logger.verbose(`FetchQ v${info.version} is ready to start`)
    } catch (err) {
        client.logger.verbose(`FetchQ needs to be initialized - ${err.message}`)
        await client.init()
        await client.pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    }



    /**
     * FOO Queue
     * ---------
     * Foo queue handles a small volume of incoming documents, we hence
     * enable the push notifications for this queue and in the worker
     * we will be able to implement long (long, very long) polling to 
     * the queue with a push "wake up" mechanism that will kick in as soon
     * a new document becomes "pending".
     */
    try {
        await client.queue.create('foo')
        await client.queue.enableNotifications('foo', true)

        // push a single document
        await client.doc.push('foo', {
            subject: 'a1',
            payload: {
                runs: 0,
                myData: true,
            },
            // version: 0,
            // nextIteration: moment().add(1, 'second').format('YYYY-MM-DD HH:mm Z')
        })

        // push multiple documents in a bulk operation
        await client.queue.enableNotifications('foo', false)
        await client.doc.pushMany('foo', {
            // version: 0,
            // nextIteration: moment().add(1, 'second').format('YYYY-MM-DD HH:mm Z'),
            // each doc has: 0=subjec, 1=priority, 2=payload
            docs: [
                ['a2', 1, {}],
                ['a3', 2, {}],
                ['a4', 3, {}],
                ['a5', 4, {}],
                ['a6', 5, {}],
            ]
        })
        await client.queue.enableNotifications('foo', true)
        await client.queue.wakeUp('foo')
    } catch (err) {
        client.logger.error(`FetchQ - FOO population: ${err.message}`)
    }



    /**
     * FAA Queue
    //  * ---------
     * faa does not have notifications enabled and rely only on the
     * sleep timeout mechanism for checking new documents
     */
    try {
        await client.queue.create('faa')

        // append a huge number of documents
        // (append operation does not work in bulk!)
        client.logger.verbose('>>>>> START TO POPULATE FAA')
        for (let i = 0; i < 5000; i++) {
            client.logger.verbose('>>>> Insert:', (i + 1) * 1000)
            const ps = []
            for (let j = 0; j < 1000; j++) {
                const p = client.doc.append('faa', { payload: { i } })
                ps.push(p)
            }
            await Promise.all(ps)
        }
        client.logger.verbose('<<<<<< FAA POPULATION IS COMPLETE')

        // forcefully wake up the queue after inserting all the docs
        await client.queue.wakeUp('faa')
    } catch (err) {
        client.logger.error(`FetchQ - FAA population: ${err.message}`)
    }

}

boot()
