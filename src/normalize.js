import fs from 'fs'
import path from 'path'
import flowFp from 'lodash/fp/flow.js'
import kebabCaseFp from 'lodash/fp/kebabCase.js'
import toLowerFp from 'lodash/fp/toLower.js'
import { isFile } from './util/path.js'

export { normalize }

function normalize({ filenames, dryRun }) {
  filenames = Array.isArray(filenames) ? filenames : [filenames]

  filenames.forEach((filename) => {
    if (!isFile(filename)) {
      return
    }

    const { dir, name, ext } = path.parse(filename)

    const newName = transformName(name)
    const newExt = transformExtention(ext)
    const newFilename = path.join(dir, `${newName}${newExt}`)

    console.log(`${filename} -> ${newFilename}`)

    if (!dryRun) {
      fs.renameSync(filename, newFilename)
    }
  })

  return filenames.length
}

function transformName(name) {
  const transform = flowFp(toLowerFp, kebabCaseFp)

  return transform(name)
}

function transformExtention(ext) {
  const transform = flowFp(toLowerFp, toJpg)

  return transform(ext)
}

function toJpg(ext) {
  const jpgExtensions = ['.jpg', '.jpeg']

  if (jpgExtensions.includes(ext)) {
    return '.jpg'
  }

  return ext
}
