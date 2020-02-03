const path = require('path')

const { exec } = require('./util/promises/child_process')
const { forEach } = require('./util/promises/forEach')
const { glob } = require('./util/promises/glob')

module.exports = {
  exif,
}

async function exif({ dirs, tagName, setAllDates }) {
  if (!Array.isArray(dirs)) {
    dirs = [dirs]
  }

  let total = 0

  await forEach(dirs, async dir => {
    const files = await glob(dir)

    if (files.length === 0) {
      return
    }

    const missing = path.join(dir, 'missing')
    const pattern = path.join(dir, '*')

    // Move files missing tagName.
    await safeExec(
      [
        'exiftool -preserve',
        `'-Directory=${missing}'`,
        '-if',
        `'(not $${tagName})'`,
        pattern,
      ].join(' '),
    )

    if (setAllDates) {
      await safeExec(
        [
          'exiftool -preserve -overwrite_original',
          `-AllDates<${tagName}`,
          pattern,
        ].join(' '),
      )
    }

    // Rename files based on tagName.
    await safeExec(
      [
        'exiftool -preserve',
        `'-FileName<${tagName}'`,
        '-d',
        "'/Users/alin/Pictures/OrganizedPhotos/%Y/%m-%b/%Y-%m-%d_%H-%M-%S_%%f.%%e'",
        pattern,
      ].join(' '),
    )

    total += files.length
  })

  return total
}

async function safeExec(cmd) {
  try {
    return await exec(cmd)
  } catch (err) {
    return err
  }
}
