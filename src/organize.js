const { execSync } = require('child_process')
const { mkdirSync, renameSync } = require('fs')
const path = require('path')

const { DateTime } = require('luxon')

const { getExifTagValue } = require('./util/exif')

module.exports = {
  organize,
}

function organize({ dryRun, filenames, dest }) {
  filenames.forEach(filename => {
    const { ext } = path.parse(filename)

    const tag = getTag(ext)

    if (!tag) {
      console.log(`Unsupported file type: ${filename}`)
      return
    }

    const value = getExifTagValue(tag, filename)

    if (value === '-') {
      return
    }

    if (ext === '.png') {
      setAllDates({ filename, dryRun, tag })
    }

    moveFile({ filename, value, dryRun, dest })
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

function moveFile({ filename, value, dryRun, dest }) {
  const dt = parseTagValue(value)
  const year = dt.toFormat('yyyy')
  const month = dt.toFormat('MM-MMM')
  const date = dt.toFormat('yyyy-MM-dd')
  const time = dt.toFormat('HH-mm-ss')

  const { ext, name } = path.parse(filename)

  const newFilename = path.join(
    dest,
    year,
    month,
    `${date}_${time}_${name}${ext}`,
  )

  console.log(`${filename} -> ${newFilename}`)

  if (!dryRun) {
    mkdirSync(path.join(dest, year, month), { recursive: true })

    renameSync(filename, newFilename)
  }
}

function parseTagValue(value) {
  let dt = DateTime.fromFormat(value, 'yyyy:MM:dd HH:mm:ssZZ')

  if (!dt.isValid) {
    dt = DateTime.fromFormat(value, 'yyyy:MM:dd HH:mm:ss')
  }

  return dt
}
