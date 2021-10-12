import fs from 'fs'

export { exists, isFile }

function exists(filename) {
  try {
    fs.accessSync(filename, fs.constants.F_OK)

    return true
  } catch {
    return false
  }
}

function isFile(filename) {
  const stats = fs.statSync(filename)

  return stats.isFile()
}
