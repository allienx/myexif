import { DateTime } from 'luxon'
import exiftoolSync from './exif/exiftoolSync.js'
import getExifTagValue from './exif/getExifTagValue.js'

export default function setVideoDates({ filenames, dryRun, timezone }) {
  filenames.forEach((filename) => {
    const value = getExifTagValue(filename, 'QuickTime:CreateDate')

    const dt = DateTime.fromFormat(value, 'yyyy:MM:dd HH:mm:ss', {
      zone: 'Etc/UTC',
    })

    const dtInUtc = dt.setZone('Etc/UTC').toFormat('yyyy:MM:dd HH:mm:ss')
    const dtWithTimezone = dt
      .setZone(timezone)
      .toFormat('yyyy:MM:dd HH:mm:ssZZ')

    const commandArgs = [
      'exiftool',
      '-preserve',
      '-overwrite_original',
      `'-File:FileModifyDate=${dtWithTimezone}'`,
      `'-QuickTime:CreationDate=${dtWithTimezone}'`,
      `'-QuickTime:CreateDate=${dtInUtc}'`,
      `'-QuickTime:ModifyDate=${dtInUtc}'`,
      `'-QuickTime:TrackCreateDate=${dtInUtc}'`,
      `'-QuickTime:TrackModifyDate=${dtInUtc}'`,
      `'-QuickTime:MediaCreateDate=${dtInUtc}'`,
      `'-QuickTime:MediaModifyDate=${dtInUtc}'`,
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
