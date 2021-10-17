import { execSync } from 'child_process'
import { DateTime } from 'luxon'
import { getExifTagValue } from './util/exif.js'

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
      execSync(command)
    }
  })

  return filenames.length
}
