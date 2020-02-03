const path = require('path')

const { forEach } = require('./forEach')
const { mkdir, rename } = require('./fs')
const { glob } = require('./glob')

module.exports = {
  mv,
}

async function mv(pattern, dest) {
  const files = await glob(pattern)

  if (files.length === 0) {
    return 0
  }

  await mkdir(dest, { recursive: true })

  await forEach(files, async file => {
    const { ext, name } = path.parse(file)

    await rename(file, path.join(dest, `${name}${ext}`))
  })

  return files.length
}
