const { chmodSync } = require('fs')

const { isFile } = require('./util/path')

module.exports = {
  setPermissions,
}

function setPermissions({ filenames, dryRun, mode }) {
  filenames.forEach(filename => {
    if (!isFile(filename)) {
      return
    }

    console.log(`chmod ${mode} ${filename}`)

    if (!dryRun) {
      chmodSync(filename, mode)
    }
  })

  return filenames.length
}
