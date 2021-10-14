import fs from 'fs'

export { exists, isDirectory, isFile }

function exists(filename) {
  try {
    fs.accessSync(filename, fs.constants.F_OK)

    return true
  } catch {
    return false
  }
}

function isDirectory(filePath) {
  const stats = fs.statSync(filePath)

  return stats.isDirectory()
}

function isFile(filePath) {
  const stats = fs.statSync(filePath)

  return stats.isFile()
}
