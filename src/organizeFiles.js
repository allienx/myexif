import { mkdirSync } from 'fs'
import path from 'path'
import getExifTags from './exif/getExifTags.js'
import copyOrMoveSync from './util/copyOrMoveSync.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

const EXIF_TAGS = [
  'FileModifyDate',
  'DateTimeOriginal',
  'DateCreated',
  'CreationDate',
]

export default function organizeFiles({
  dryRun,
  copy,
  filenames,
  filenamesToSkip,
  dest,
}) {
  const processedFiles = []

  getExifTags({ filenames, tags: EXIF_TAGS }).forEach((obj) => {
    const filename = path.normalize(obj['SourceFile'])
    const { ext } = path.parse(filename)

    // Skip any file paths included in the blacklist or
    // any sidecar files (they get moved along with its corresponding source file).
    if (filenamesToSkip.includes(filename) || ext.toLowerCase() === '.aae') {
      return
    }

    const tag = getTag(ext)
    const dateStr = tag ? obj[tag] : null
    const fileModifyDateStr = obj['FileModifyDate']

    const hasValidTimestamp = !!dateStr
    const exifDateStr = dateStr || fileModifyDateStr

    const files = copyFile({
      dryRun,
      copy,
      hasValidTimestamp,
      filename,
      exifDateStr,
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

function copyFile({
  dryRun,
  copy,
  hasValidTimestamp,
  filename,
  exifDateStr,
  dest,
}) {
  const processedFiles = []

  let { dir: newDir, filename: newFilename } = getNewFilename({
    filename,
    exifDateStr,
    dest,
  })

  let { sidecarFilename, newSidecarFilename } = getNewSidecarFilename({
    filename,
    newFilename,
  })

  filename = path.normalize(filename)
  newFilename = path.normalize(newFilename)
  sidecarFilename = sidecarFilename ? path.normalize(sidecarFilename) : null
  newSidecarFilename = newSidecarFilename
    ? path.normalize(newSidecarFilename || '')
    : null

  processedFiles.push({
    hasValidTimestamp,
    originalFilepath: filename,
    newFilepath: newFilename,
  })

  if (!dryRun) {
    mkdirSync(newDir, { recursive: true })
  }

  copyOrMoveSync({
    dryRun,
    copy,
    filename,
    newFilename,
  })

  if (newSidecarFilename) {
    processedFiles.push({
      hasValidTimestamp,
      originalFilepath: sidecarFilename,
      newFilepath: newSidecarFilename,
    })

    copyOrMoveSync({
      dryRun,
      copy,
      filename: sidecarFilename,
      newFilename: newSidecarFilename,
    })
  }

  return processedFiles
}
