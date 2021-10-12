import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getExifTagValue, parseExifDate } from './util/exif.js'
import { getNewFilename, getNewSidecarFilename } from './util/filename.js'

export { organize }

function organize({ filenames, dryRun, dest }) {
  filenames.forEach((filename) => {
    const { ext } = path.parse(filename)

    // Skip sidecar files because they're moved with their main file.
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
    moveFile({ filename, date, dryRun, dest })
  })

  return filenames.length
}

function getTag(ext) {
  switch (ext) {
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

function setAllDates({ filename, dryRun, tag }) {
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

function moveFile({ filename, date, dryRun, dest }) {
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

    fs.renameSync(filename, newFilename)

    if (newSidecarFilename) {
      fs.renameSync(sidecarFilename, newSidecarFilename)
    }
  }
}
