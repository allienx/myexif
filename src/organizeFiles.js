import { mkdirSync } from 'fs'
import path from 'path'
import getExifTags from './exif/getExifTags.js'
import parseExifDateString from './exif/parseExifDateString.js'
import copyOrMoveSync from './util/copyOrMoveSync.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

const EXIF_TAGS = [
  'FileModifyDate',
  'DateTimeOriginal',
  'DateCreated',
  'CreationDate',
]

export default function organizeFiles({ dryRun, copy, filenames, dest }) {
  const processedFiles = []

  getExifTags({ filenames, tags: EXIF_TAGS }).forEach((obj) => {
    const filename = obj['SourceFile']
    const { ext } = path.parse(filename)

    const tag = getTag(ext)
    const dateStr = tag ? obj[tag] : null
    const fileModifyDateStr = obj['FileModifyDate']

    const date = parseExifDateString(dateStr || fileModifyDateStr)
    const hasValidTimestamp = !!dateStr

    const files = copyFile({
      dryRun,
      copy,
      hasValidTimestamp,
      filename,
      date,
      dest,
    })

    processedFiles.push(...files)
  })

  return processedFiles
}

function getTag(ext) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
    case '.heic':
    case '.gif':
      return 'DateTimeOriginal'

    case '.png':
      return 'DateCreated'

    case '.mov':
    case '.mp4':
      return 'CreationDate'

    default:
      return null
  }
}

function copyFile({ dryRun, copy, hasValidTimestamp, filename, date, dest }) {
  const processedFiles = []

  const { dir: newDir, filename: newFilename } = getNewFilename({
    filename,
    date,
    dest,
  })
  const { sidecarFilename, newSidecarFilename } = getNewSidecarFilename({
    filename,
    newFilename,
  })

  console.log(`${filename.padEnd(70, '.')}${newFilename}`)

  processedFiles.push({
    hasValidTimestamp,
    originalFilepath: filename,
    newFilepath: newFilename,
  })

  if (newSidecarFilename) {
    console.log(`${sidecarFilename.padEnd(70, '.')} -> ${newSidecarFilename}`)

    processedFiles.push({
      hasValidTimestamp,
      originalFilepath: sidecarFilename,
      newFilepath: newSidecarFilename,
    })
  }

  if (!dryRun) {
    mkdirSync(newDir, { recursive: true })

    copyOrMoveSync({
      copy,
      filename,
      newFilename,
    })

    if (newSidecarFilename) {
      copyOrMoveSync({
        copy,
        filename: sidecarFilename,
        newFilename: newSidecarFilename,
      })
    }
  }

  return processedFiles
}
