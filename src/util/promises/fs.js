const fs = require('fs')
const util = require('util')

module.exports = {
  chmod: util.promisify(fs.chmod),
  mkdir: util.promisify(fs.mkdir),
  rename: util.promisify(fs.rename),
  stat: util.promisify(fs.stat),
  unlink: util.promisify(fs.unlink),
}
