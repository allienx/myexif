import flowFp from 'lodash/fp/flow.js'
import kebabCaseFp from 'lodash/fp/kebabCase.js'
import toLowerFp from 'lodash/fp/toLower.js'
import { DateTime } from 'luxon'
import path from 'path'

export default function getNewFilename({ filename, date, dest }) {
  const newDir = getDirectory({ dest, date })
  const newFilename = getFilename({ filename, date })

  return {
    dir: newDir,
    filename: path.join(newDir, newFilename),
  }
}

function getDirectory({ dest, date }) {
  const dt = DateTime.fromJSDate(date)
  const year = dt.toFormat('yyyy')
  const month = dt.toFormat('MM-MMM')

  return path.join(dest, year, month)
}

function getFilename({ filename, date }) {
  const dt = DateTime.fromJSDate(date)
  const dateStr = dt.toFormat('yyyy-MM-dd')
  const timeStr = dt.toFormat('HH-mm-ss')

  const { name, ext } = path.parse(filename)
  const newName = transformName(name)
  const newExt = transformExtention(ext)

  return `${dateStr}_${timeStr}_${newName}${newExt}`
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
