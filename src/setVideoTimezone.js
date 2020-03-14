const { DateTime } = require('luxon')

const { getExiftoolValue } = require('./util/getExiftoolValue')
const { exec } = require('./util/promises/child_process')
const { forEach } = require('./util/promises/forEach')
const { glob } = require('./util/promises/glob')

module.exports = {
  setVideoTimezone,
}

async function setVideoTimezone({
  pattern,
  useCreateDate,
  useFileModifyDate,
  timezone,
}) {
  const filenames = await glob(pattern)

  if (filenames.length === 0) {
    return 0
  }

  await forEach(filenames, async filename => {
    const { utc, fmt } = useFileModifyDate
      ? await parseFileModifyDate(filename, timezone)
      : await parseCreateDate(filename, useCreateDate, timezone)

    await exec(
      [
        'exiftool',
        '-preserve',
        '-overwrite_original',
        `'-File:FileModifyDate=${fmt}'`,
        `'-QuickTime:CreateDate=${utc}'`,
        `'-QuickTime:ModifyDate=${utc}'`,
        `'-QuickTime:TrackCreateDate=${utc}'`,
        `'-QuickTime:TrackModifyDate=${utc}'`,
        `'-QuickTime:MediaCreateDate=${utc}'`,
        `'-QuickTime:MediaModifyDate=${utc}'`,
        `'-QuickTime:CreationDate=${fmt}'`,
        filename,
      ].join(' '),
    )
  })

  return filenames.length
}

async function parseFileModifyDate(filename, destTz) {
  const createDate = await getExiftoolValue('File:FileModifyDate', filename)

  let dt = DateTime.fromFormat(createDate, 'yyyy:MM:dd HH:mm:ssZZ')

  return {
    utc: dt.setZone('utc').toFormat('yyyy:MM:dd HH:mm:ss'),
    fmt: dt.setZone(destTz).toFormat('yyyy:MM:dd HH:mm:ssZZ'),
  }
}

async function parseCreateDate(filename, sourceTz, destTz) {
  const createDate = await getExiftoolValue('QuickTime:CreateDate', filename)

  let dt = DateTime.fromFormat(createDate, 'yyyy:MM:dd HH:mm:ss', {
    zone: sourceTz,
  })

  return {
    utc: dt.setZone('utc').toFormat('yyyy:MM:dd HH:mm:ss'),
    fmt: dt.setZone(destTz).toFormat('yyyy:MM:dd HH:mm:ssZZ'),
  }
}
