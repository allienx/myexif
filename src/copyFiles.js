import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getExifTagValue, parseExifDate } from './util/exif.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

export default function copyFiles({ dryRun, filenames, dest }) {
  filenames.forEach((filename) => {
    const { ext } = path.parse(filename)

    // Skip sidecar files because they'll be moved with their main file.
    if (['.aae'].includes(ext)) {
      return
    }

    const tag = getTag(ext)

    if (!tag) {
      console.log(`Unsupported file type: ${filename}`)
      return
    }

    const dateStr = getExifTagValue(filename, tag)

    if (dateStr === '-') {
      return
    }

    if (ext === '.png') {
      setAllDates({ filename, dryRun, tag })
    }

    const date = parseExifDate(dateStr)

    copyFile({ filename, date, dryRun, dest })
  })

  return filenames.length
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
    case '.heic':
      return 'EXIF:DateTimeOriginal'

    case '.png':
      return 'XMP:DateCreated'

    case '.mov':
    case '.mp4':
      return 'QuickTime:CreationDate'

    case '.gif':
      return 'XMP:DateTimeOriginal'
  }
}
