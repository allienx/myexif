const path = require('path')

const { forEach } = require('./forEach')
const { rename } = require('./fs')
const { glob } = require('./glob')

module.exports = {
  renameExt,
}

async function renameExt(pattern, ext) {
  const files = await glob(pattern)

  if (!ext) {
    throw new Error(`Missing new file extension...`)
  }

  if (files.length === 0) {
    return 0
  }

  await forEach(files, async file => {
    const { dir, name } = path.parse(file)

    await rename(file, path.join(dir, `${name}.${ext}`))
  })

  return files.length
}
