const fs = require('fs')
const util = require('util')

module.exports = {
  mkdir: util.promisify(fs.mkdir),
  rename: util.promisify(fs.rename),
  unlink: util.promisify(fs.unlink),
}
