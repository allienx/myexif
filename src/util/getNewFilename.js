import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import flowFp from 'lodash/fp/flow.js'
import toLowerFp from 'lodash/fp/toLower.js'
import { DateTime } from 'luxon'
import path from 'path'

export default function getNewFilename({ filename, filenameHash, date, dest }) {
  const hash = filenameHash || getFilenameHash(filename)

  const newDir = getDirectory({ dest, date })
  const newFilename = getFilename({ filename, filenameHash: hash, date })

  return {
    hash,
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

function getFilename({ filename, filenameHash, date }) {
  const dt = DateTime.fromJSDate(date)
  const dateStr = dt.toFormat('yyyyMMdd')
  const timeStr = dt.toFormat('HHmmss')

  const { ext } = path.parse(filename)
  const hash = filenameHash || getFilenameHash(filename)
  const normalizedExtension = getNormalizedExtension(ext)

  return `${dateStr}-${timeStr}-${hash}${normalizedExtension}`
}

function getFilenameHash(name) {
  const buffer = readFileSync(name)

  return createHash('md5').update(buffer).digest('hex').slice(0, 8)
}

function getNormalizedExtension(ext) {
  const normalize = flowFp(toLowerFp, toJpg)

  return normalize(ext)
}

function toJpg(ext) {
  const jpgExtensions = ['.jpg', '.jpeg']

  if (jpgExtensions.includes(ext)) {
    return '.jpg'
  }

  return ext
}
