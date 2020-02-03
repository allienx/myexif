const path = require('path')

const { exec } = require('./util/promises/child_process')
const { forEach } = require('./util/promises/forEach')
const { glob } = require('./util/promises/glob')

module.exports = {
  exif,
}

async function exif({ pattern, tag, setAllDates }) {
  const patterns = !Array.isArray(pattern) ? [pattern] : pattern

  let total = 0

  await forEach(patterns, async ptrn => {
    const files = await glob(ptrn)

    if (files.length === 0) {
      return
    }

    const { dir } = path.parse(ptrn)
    const missing = path.join(dir, 'missing')

    // Move files missing tag.
    await safeExec(
      [
        'exiftool -preserve',
        `'-Directory=${missing}'`,
        '-if',
        `'(not $${tag})'`,
        ptrn,
      ].join(' '),
    )

    if (setAllDates) {
      await safeExec(
        [
          'exiftool -preserve -overwrite_original',
          `-AllDates<${tag}`,
          ptrn,
        ].join(' '),
      )
    }

    // Rename files based on tag.
    await safeExec(
      [
        'exiftool -preserve',
        `'-FileName<${tag}'`,
        '-d',
        "'/Users/alin/Pictures/OrganizedPhotos/%Y/%m-%b/%Y-%m-%d_%H-%M-%S_%%f.%%e'",
        ptrn,
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
