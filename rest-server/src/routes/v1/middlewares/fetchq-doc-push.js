
const winston = require('winston')

const fetchqDocPush = () => async (req, res, next) => {
    try {
        let info = null
        if (req.body.docs) {
            info = await req.fetchq.doc.pushMany(req.params.name, req.body)
        } else {
            info = await req.fetchq.doc.push(req.params.name, req.body)
        }
        // console.log(info)
        res.send(info)
    } catch (err) {
        winston.verbose(`post://api/v1/q/${req.params.name} - ${err.message}`)
        winston.debug(err)
        next(err)
    }
}

module.exports = {
    fetchqDocPush,
}
