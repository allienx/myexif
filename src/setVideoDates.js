const { DateTime } = require('luxon')

const { getExiftoolValue } = require('./util/getExiftoolValue')
const { exec } = require('./util/promises/child_process')
const { forEach } = require('./util/promises/forEach')
const { glob } = require('./util/promises/glob')

module.exports = {
  setVideoDates,
}

async function setVideoDates({ pattern, timezone }) {
  if (!timezone) {
    throw new Error('Missing timezone...')
  }

  const files = await glob(pattern)

  if (files.length === 0) {
    return 0
  }

  await forEach(files, async file => {
    const createDate = await getExiftoolValue('QuickTime:CreateDate', file)

    const dt = DateTime.fromFormat(createDate, 'yyyy:MM:dd HH:mm:ss', {
      zone: 'utc',
    })

    const utcFormat = dt.toFormat('yyyy:MM:dd HH:mm:ss')
    const zoneFormat = dt.setZone(timezone).toFormat('yyyy:MM:dd HH:mm:ssZZ')

    await exec(
      [
        'exiftool',
        '-preserve',
        '-overwrite_original',
        `'-File:FileModifyDate=${zoneFormat}'`,
        `'-QuickTime:CreateDate=${utcFormat}'`,
        `'-QuickTime:ModifyDate=${utcFormat}'`,
        `'-QuickTime:TrackCreateDate=${utcFormat}'`,
        `'-QuickTime:TrackModifyDate=${utcFormat}'`,
        `'-QuickTime:MediaCreateDate=${utcFormat}'`,
        `'-QuickTime:MediaModifyDate=${utcFormat}'`,
        `'-QuickTime:CreationDate=${zoneFormat}'`,
        file,
      ].join(' '),
    )
  })

  return files.length
}
