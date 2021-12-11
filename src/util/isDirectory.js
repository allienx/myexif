import fs from 'fs'

export default function isDirectory(filePath) {
  const stats = fs.statSync(filePath)

  return stats.isDirectory()
}
