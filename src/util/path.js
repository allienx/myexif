const { accessSync, constants, statSync } = require('fs')

module.exports = {
  exists,
  isFile,
}

function exists(filename) {
  try {
    accessSync(filename, constants.F_OK)

    return true
  } catch {
    return false
  }
}

function isFile(filename) {
  const stats = statSync(filename)

  return stats.isFile()
}
