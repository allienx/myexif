const { renameSync } = require('fs')
const path = require('path')

const flow = require('lodash/fp/flow')
const kebabCase = require('lodash/fp/kebabCase')
const toLower = require('lodash/fp/toLower')

const { isFile } = require('./util/path')

module.exports = {
  normalize,
}

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
      renameSync(filename, newFilename)
    }
  })

  return filenames.length
}

function transformName(name) {
  const transform = flow(toLower, kebabCase)

  return transform(name)
}

function transformExtention(ext) {
  const transform = flow(toLower, jpg)

  return transform(ext)
}

function jpg(ext) {
  const JPG_EXT = ['.jpg', '.jpeg']

  if (JPG_EXT.includes(ext)) {
    return '.jpg'
  }

  return ext
}
