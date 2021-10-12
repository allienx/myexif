import fs from 'fs'
import { isFile } from './util/path.js'

export { setPermissions }

function setPermissions({ filenames, dryRun, mode }) {
  filenames.forEach((filename) => {
    if (!isFile(filename)) {
      return
    }

    console.log(`chmod ${mode} ${filename}`)

    if (!dryRun) {
      fs.chmodSync(filename, mode)
    }
  })

  return filenames.length
}
