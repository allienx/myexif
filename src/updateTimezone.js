import { DateTime } from 'luxon'
import exiftoolSync from './exif/exiftoolSync.js'
import getExifTagValue from './exif/getExifTagValue.js'

export default function updateTimezone({
  filenames,
  dryRun,
  tag,
  srcTimezone,
  newTimezone,
}) {
  const fmt = 'yyyy:MM:dd HH:mm:ss'

  filenames.forEach((filename) => {
    const value = getExifTagValue(filename, tag)

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
      exiftoolSync(command)
    }
  })

  return filenames.length
}
