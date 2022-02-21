import { DateTime } from 'luxon'
import exiftoolSync from './exif/exiftoolSync.js'
import getExifTags from './exif/getExifTags.js'

export default function setVideoDates({ dryRun, filenames, tag, timezone }) {
  getExifTags({ filenames, tags: [tag] }).forEach((obj) => {
    const filename = obj['SourceFile']
    const dateStr = obj[tag]

    if (!dateStr) {
      console.log(`${filename} has no value for exiftool tag ${tag}...`)

      return
    }

    let dt = DateTime.fromFormat(dateStr, 'yyyy:MM:dd HH:mm:ssZZ')

    if (!dt.isValid) {
      dt = DateTime.fromFormat(dateStr, 'yyyy:MM:dd HH:mm:ss', {
        zone: 'Etc/UTC',
      })
    }

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
