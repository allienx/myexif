import fs from 'fs'

export default function isFile(filePath) {
  const stats = fs.statSync(filePath)

  return stats.isFile()
}
