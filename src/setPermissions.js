const { forEach } = require('./util/promises/forEach')
const { chmod, stat } = require('./util/promises/fs')
const { glob } = require('./util/promises/glob')

module.exports = {
  setPermissions,
}

async function setPermissions({ pattern }) {
  const filenames = await glob(pattern)

  if (filenames.length === 0) {
    return 0
  }

  await forEach(filenames, async filename => {
    const stats = await stat(filename)

    if (stats.isFile()) {
      await chmod(filename, 0o644)
    }
  })

  return filenames.length
}
