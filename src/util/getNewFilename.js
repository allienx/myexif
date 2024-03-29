import { createHash } from 'crypto'
import flowFp from 'lodash/fp/flow.js'
import toLowerFp from 'lodash/fp/toLower.js'
import path from 'path'
import { readChunkSync } from 'read-chunk'
import parseExifDateString from '../exif/parseExifDateString.js'

export default function getNewFilename({
  filename,
  filenameHash,
  exifDateStr,
  dest,
}) {
  const hash = filenameHash || getFilenameHash(filename)

  const newDir = getDirectory({ dest, exifDateStr })
  const newFilename = getFilename({ filename, filenameHash: hash, exifDateStr })

  return {
    hash,
    dir: newDir,
    filename: path.join(newDir, newFilename),
  }
}

function getDirectory({ dest, exifDateStr }) {
  const dt = parseExifDateString(exifDateStr)
  const year = dt.toFormat('yyyy')
  const month = dt.toFormat('MM-MMM')

  return path.join(dest, year, month)
}

function getFilename({ filename, filenameHash, exifDateStr }) {
  const dt = parseExifDateString(exifDateStr)
  const dateStr = dt.toFormat('yyyyMMdd')
  const timeStr = dt.toFormat('HHmmss')

  const { ext } = path.parse(filename)
  const hash = filenameHash || getFilenameHash(filename)
  const normalizedExtension = getNormalizedExtension(ext)

  return `${dateStr}-${timeStr}-${hash}${normalizedExtension}`
}

function getFilenameHash(name) {
  // Read 1MB of the file (avoids file too large errors).
  const buffer = readChunkSync(name, { length: 1048576 })

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
