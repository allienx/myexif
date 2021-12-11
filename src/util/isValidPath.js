import fs from 'fs'

export default function isValidPath(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)

    return true
  } catch {
    return false
  }
}
