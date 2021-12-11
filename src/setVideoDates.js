import { execSync } from 'child_process'
import { DateTime } from 'luxon'
import getExifTagValue from './exif/getExifTagValue'

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
      execSync(command)
    }
  })

  return filenames.length
}
