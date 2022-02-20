import glob from 'glob'
import isGlob from 'is-glob'
import path from 'path'
import isDirectory from './isDirectory.js'
import isFile from './isFile.js'

export default function getAllFiles(filePaths) {
  const filenames = []

  filePaths.forEach((filePath) => {
    if (isGlob(filePath)) {
      const paths = glob.sync(filePath).filter((p) => {
        return isFile(p)
      })

      filenames.push(...paths)
    } else if (isDirectory(filePath)) {
      const paths = glob.sync(path.join(filePath, '**', '*')).filter((p) => {
        return isFile(p)
      })

      filenames.push(...paths)
    } else if (isFile(filePath)) {
      filenames.push(filePath)
    }
  })

  return filenames
}
