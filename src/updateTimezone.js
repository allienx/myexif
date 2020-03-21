const { execSync } = require('child_process')

const { DateTime } = require('luxon')

const { getExifTagValue } = require('./util/exif')

module.exports = {
  updateTimezone,
}

function updateTimezone({ dryRun, filenames, tag, srcTimezone, newTimezone }) {
  const fmt = 'yyyy:MM:dd HH:mm:ss'

  filenames.forEach(filename => {
    const value = getExifTagValue(tag, filename)

    const dt = DateTime.fromFormat(value, fmt, {
      zone: srcTimezone,
    })

    const dtInNewTimezone = dt.setZone(newTimezone).toFormat(fmt)

    const commandArgs = [
      'exiftool',
      '-preserve',
      '-overwrite_original',
      `'-${tag}=${dtInNewTimezone}'`,
      `"${filename}"`,
    ]
    const command = commandArgs.join(' ')

    console.log(command)

    if (!dryRun) {
      execSync(command)
    }
  })

  return filenames.length
}
