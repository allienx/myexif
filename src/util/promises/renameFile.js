const path = require('path')

const { forEach } = require('./forEach')
const { rename } = require('./fs')
const { glob } = require('./glob')

module.exports = {
  renameFile,
}

async function renameFile(pattern, transform) {
  const files = await glob(pattern)

  if (!transform) {
    throw new Error(`Missing transform function...`)
  }

  if (files.length === 0) {
    return 0
  }

  await forEach(files, async file => {
    const { dir, ext, name } = path.parse(file)
    const newName = transform(name)

    await rename(file, path.join(dir, `${newName}${ext}`))
  })

  return files.length
}
