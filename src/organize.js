const { execSync } = require('child_process')
const { mkdirSync, renameSync } = require('fs')
const path = require('path')

const { getExifTagValue, parseExifDate } = require('./util/exif')
const { getNewFilename } = require('./util/filename')

module.exports = {
  organize,
}

function organize({ filenames, dryRun, dest }) {
  filenames.forEach(filename => {
    const { ext } = path.parse(filename)

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
  }
}

function setAllDates({ filename, dryRun, tag }) {
  const commandArgs = [
    'exiftool',
    '-preserve',
    '-overwrite_original',
    `-AllDates<${tag}`,
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

  console.log(`${filename} -> ${newFilename}`)

  if (!dryRun) {
    mkdirSync(newDir, { recursive: true })

    renameSync(filename, newFilename)
  }
}
