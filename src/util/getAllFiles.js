import glob from 'glob'
import isGlob from 'is-glob'
import path from 'path'
import isDirectory from './isDirectory.js'
import isFile from './isFile.js'

export default function getAllFiles(filePaths) {
  const filenames = []
  const paths =
    filePaths.length === 1 && isGlob(filePaths[0])
      ? glob.sync(filePaths[0])
      : filePaths

  paths.forEach((filePath) => {
    if (isDirectory(filePath)) {
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
