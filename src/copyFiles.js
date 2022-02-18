import { execSync } from 'child_process'
import fs from 'fs'
import groupBy from 'lodash/groupBy.js'
import path from 'path'
import getExifTags from './exif/getExifTags.js'
import parseExifDateString from './exif/parseExifDateString.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

const NO_TAG = 'no_tag'

export default function copyFiles({ dryRun, filenames, dest }) {
  const filesGroupedByTag = groupBy(filenames, (filename) => {
    const { ext } = path.parse(filename)

    return getTag(ext)
  })

  Object.entries(filesGroupedByTag).forEach(([exifTag, files]) => {
    if (exifTag === NO_TAG) {
      console.log('\n🚧 Files found with no timestamp')
      console.log(files)
      console.log()

      return
    }

    getExifTags({ filenames: files, tags: [exifTag] }).forEach((obj) => {
      const tag = exifTag.split(':')[1]
      const dateStr = obj[tag]
      const filename = obj['SourceFile']
      const { ext } = path.parse(filename)

      if (!dateStr) {
        console.log('\n🚧 File found with no timestamp')
        console.log(filename)
        console.log()

        return
      }

      if (ext === '.png') {
        setAllDates({ dryRun, filename, tag })
      }

      const date = parseExifDateString(dateStr)

      copyFile({ filename, date, dryRun, dest })
    })
  })

  return filenames
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
    execSync(command)
  }
}

function copyFile({ dryRun, filename, date, dest }) {
  const { dir: newDir, filename: newFilename } = getNewFilename({
    filename,
    date,
    dest,
  })
  const { sidecarFilename, newSidecarFilename } = getNewSidecarFilename({
    filename,
    newFilename,
  })

  console.log(`${filename} -> ${newFilename}`)

  if (newSidecarFilename) {
    console.log(`${sidecarFilename} -> ${newSidecarFilename}`)
  }

  if (!dryRun) {
    fs.mkdirSync(newDir, { recursive: true })

    fs.copyFileSync(filename, newFilename)

    if (newSidecarFilename) {
      fs.copyFileSync(sidecarFilename, newSidecarFilename)
    }
  }
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
