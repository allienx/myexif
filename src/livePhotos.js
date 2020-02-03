const path = require('path')

const { DateTime } = require('luxon')

const { getExiftoolValue } = require('./util/getExiftoolValue')
const { getLivePhotos } = require('./util/getLivePhotos')
const { forEach } = require('./util/promises/forEach')
const { mkdir, rename } = require('./util/promises/fs')

module.exports = {
  livePhotos,
}

async function livePhotos({ dir, exif }) {
  const livePhotos = await getLivePhotos(dir)

  if (livePhotos.length === 0) {
    return 0
  }

  if (!exif) {
    livePhotos.forEach(livePhoto => {
      console.log(livePhoto)
    })

    return livePhotos.length
  }

  // Organize and rename the live photos by EXIF data.
  await forEach(livePhotos, async livePhoto => {
    if (!livePhoto.photo || !livePhoto.video) {
      await moveMissingLivePhoto(dir, livePhoto)

      return
    }

    const { name: photoName, ext: photoExt } = path.parse(livePhoto.photo)
    const { ext: videoExt } = path.parse(livePhoto.video)

    const dateTimeOriginal = await getExiftoolValue(
      'DateTimeOriginal',
      path.join(dir, livePhoto.photo),
    )
    const dt = DateTime.fromFormat(dateTimeOriginal, 'yyyy:MM:dd HH:mm:ss')
    const year = dt.toFormat('yyyy')
    const month = dt.toFormat('MM-MMM')
    const timestamp = dt.toFormat('yyyy-MM-dd_HH-mm-ss')

    const dest = path.join('/Users/alin/Pictures/OrganizedPhotos', year, month)
    await mkdir(dest, { recursive: true })

    // Rename the photo file by timestamp.
    await rename(
      path.join(dir, livePhoto.photo),
      path.join(dest, `${timestamp}_${photoName}${photoExt}`),
    )

    // Use the same timestamp to rename the video file.
    await rename(
      path.join(dir, livePhoto.video),
      path.join(dest, `${timestamp}_${photoName}${videoExt}`),
    )
  })

  return livePhotos.length
}

async function moveMissingLivePhoto(dir, livePhoto) {
  const missingDir = path.join(dir, 'live', 'missing')

  await mkdir(missingDir, { recursive: true })

  if (livePhoto.photo) {
    await rename(
      path.join(dir, livePhoto.photo),
      path.join(missingDir, livePhoto.photo),
    )
  }

  if (livePhoto.video) {
    await rename(
      path.join(dir, livePhoto.video),
      path.join(missingDir, livePhoto.video),
    )
  }
}
