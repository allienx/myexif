const path = require('path')

const { DateTime } = require('luxon')

const { getExiftoolValue } = require('./util/getExiftoolValue')
const { getLivePhotos } = require('./util/getLivePhotos')
const { forEach } = require('./util/promises/forEach')
const { mkdir, rename } = require('./util/promises/fs')

module.exports = {
  livePhotos,
}

async function livePhotos({ dir, newDir }) {
  const livePhotos = await getLivePhotos(dir)

  if (livePhotos.length === 0) {
    return 0
  }

  await mkdir(newDir, { recursive: true })

  await forEach(livePhotos, async livePhoto => {
    if (!livePhoto.photo || !livePhoto.video) {
      await missingLivePhoto(dir, newDir, livePhoto)

      return
    }

    const { name: photoName, ext: photoExt } = path.parse(livePhoto.photo)
    const { ext: videoExt } = path.parse(livePhoto.video)

    const dateTimeOriginal = await getExiftoolValue(
      'DateTimeOriginal',
      path.join(dir, livePhoto.photo),
    )
    const dt = DateTime.fromFormat(dateTimeOriginal, 'yyyy:MM:dd HH:mm:ss')
    const fmt = dt.toFormat('yyyy-MM-dd_HH-mm-ss')

    // Give the live photo files the same name with their respective extensions.
    await rename(
      path.join(dir, livePhoto.photo),
      path.join(newDir, `${fmt}_${photoName}${photoExt}`),
    )
    await rename(
      path.join(dir, livePhoto.video),
      path.join(newDir, `${fmt}_${photoName}${videoExt}`),
    )
  })

  return livePhotos.length
}

async function missingLivePhoto(dir, newDir, livePhoto) {
  await mkdir(path.join(newDir, 'missing'), { recursive: true })

  if (livePhoto.photo) {
    await rename(
      path.join(dir, livePhoto.photo),
      path.join(newDir, 'missing', livePhoto.photo),
    )
  }

  if (livePhoto.video) {
    await rename(
      path.join(dir, livePhoto.video),
      path.join(newDir, 'missing', livePhoto.video),
    )
  }
}
