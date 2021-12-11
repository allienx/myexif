import glob from 'glob'
import path from 'path'
import isDirectory from './isDirectory.js'
import isFile from './isFile.js'

export default function getAllFiles(filePaths) {
  const filenames = []

  filePaths.forEach((filePath) => {
    if (isFile(filePath)) {
      filenames.push(filePath)
    } else if (isDirectory(filePath)) {
      const paths = glob.sync(path.join(filePath, '**', '*')).filter((p) => {
        return isFile(p)
      })

      filenames.push(...paths)
    }
  })

  return filenames
}
