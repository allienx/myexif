const { forEach } = require('./forEach')
const { unlink } = require('./fs')
const { glob } = require('./glob')

module.exports = {
  rm,
}

async function rm(pattern) {
  const files = await glob(pattern)

  if (files.length === 0) {
    return 0
  }

  await forEach(files, async file => {
    await unlink(file)
  })

  return files.length
}
