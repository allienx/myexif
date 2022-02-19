import fs from 'fs'
import groupBy from 'lodash/groupBy.js'
import path from 'path'
import exiftoolSync from './exif/exiftoolSync.js'
import getExifTags from './exif/getExifTags.js'
import parseExifDateString from './exif/parseExifDateString.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

const NO_TAG = 'no_tag'

export default function organizeFiles({ dryRun, filenames, dest }) {
  const processedFiles = []

  const filesGroupedByTag = groupBy(filenames, (filename) => {
    const { ext } = path.parse(filename)

    return getTag(ext)
  })

  Object.entries(filesGroupedByTag).forEach(([exifTag, files]) => {
    if (exifTag === NO_TAG) {
      console.log('\n🚧 Unknown files encountered')
      console.log(files)
      console.log()

      return
    }

    getExifTags({
      filenames: files,
      tags: [exifTag, 'FileModifyDate'],
    }).forEach((obj) => {
      const tag = exifTag.split(':')[1]
      const dateStr = obj[tag]
      const fileModifyDateStr = obj['FileModifyDate']
      const filename = obj['SourceFile']
      const { ext } = path.parse(filename)

      if (ext === '.png') {
        setAllDates({ dryRun, filename, tag })
      }

      const date = parseExifDateString(dateStr || fileModifyDateStr)
      const hasValidTimestamp = !!dateStr

      const files = copyFile({
        dryRun,
        hasValidTimestamp,
        filename,
        date,
        dest,
      })

      processedFiles.push(...files)
    })
  })

  return processedFiles
}

function getTag(ext) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
    case '.heic':
      return 'EXIF:DateTimeOriginal'

    case '.png':
      return 'XMP:DateCreated'

    case '.mov':
    case '.mp4':
      return 'QuickTime:CreationDate'

    case '.gif':
      return 'XMP:DateTimeOriginal'

    default:
      return NO_TAG
  }
}

function setAllDates({ dryRun, filename, tag }) {
  const commandArgs = [
    'exiftool',
    '-preserve',
    '-overwrite_original',
    `"-AllDates<${tag}"`,
    `"${filename}"`,
  ]
  const command = commandArgs.join(' ')

  console.log(command)

  if (!dryRun) {
    exiftoolSync(command)
  }
}

function copyFile({ dryRun, hasValidTimestamp, filename, date, dest }) {
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
    fs.mkdirSync(newDir, { recursive: true })

    fs.copyFileSync(filename, newFilename)

    if (newSidecarFilename) {
      fs.copyFileSync(sidecarFilename, newSidecarFilename)
    }
  }

  return processedFiles
}
