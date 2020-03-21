const { chmodSync } = require('fs')

const { isFile } = require('./util/isFile')

module.exports = {
  setPermissions,
}

function setPermissions({ dryRun, filenames, mode }) {
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
