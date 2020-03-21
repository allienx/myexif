const { statSync } = require('fs')

module.exports = {
  isFile,
}

function isFile(filename) {
  const stats = statSync(filename)

  return stats.isFile()
}
