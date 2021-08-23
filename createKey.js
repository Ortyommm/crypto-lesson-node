const crypto = require('crypto')
const fs = require('fs')

const key = crypto.randomBytes(16).toString('hex')
const algorithm = 'aes256'

fs.writeFileSync(`${__dirname}/key.json`, JSON.stringify({ key, algorithm }))