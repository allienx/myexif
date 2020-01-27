#!/usr/bin/env node

const path = require('path')

const { DateTime } = require('luxon')

const { mkdir, rename } = require('./util/promises/fs')
const getExiftoolValue = require('./util/getExiftoolValue')
const getLivePhotos = require('./util/getLivePhotos')

const args = process.argv.map(arg => arg)
args.shift()
args.shift()

const dir = args[0] || '.'

main()
  .catch(err => {
    console.log(err)
    console.log()
  })
  .finally(() => {
    console.log('✨  Done.')
  })

async function main() {
  const livePhotos = await getLivePhotos(dir)

  if (livePhotos.length > 0) {
    await mkdir(path.join(dir, 'live-photos'), { recursive: true })
    await mkdir(path.join(dir, 'live-photos', 'missing'), { recursive: true })
  }

  for (let i = 0; i < livePhotos.length; i++) {
    const livePhoto = livePhotos[i]

    // Move any incomplete photos to the missing folder.
    if (!livePhoto.video) {
      await rename(
        path.join(dir, livePhoto.photo),
        path.join(dir, 'live-photos', 'missing', livePhoto.photo),
      )

      continue
    }

    // Move the incomplete videos to the missing folder.
    if (!livePhoto.photo) {
      await rename(
        path.join(dir, livePhoto.video),
        path.join(dir, 'live-photos', 'missing', livePhoto.video),
      )

      continue
    }

    const { name: photoName, ext: photoExt } = path.parse(livePhoto.photo)
    const { ext: videoExt } = path.parse(livePhoto.video)

    const dateTimeOriginal = await getExiftoolValue(
      'DateTimeOriginal',
      dir + '/' + livePhoto.photo,
    )
    const dt = DateTime.fromFormat(dateTimeOriginal, 'yyyy:MM:dd HH:mm:ss')
    const fmt = dt.toFormat('yyyy-MM-dd_HH-mm-ss')

    // Give the live photo files the same name with their respective extensions.
    await rename(
      path.join(dir, livePhoto.photo),
      path.join(dir, 'live-photos', `${fmt}_${photoName}${photoExt}`),
    )

    await rename(
      path.join(dir, livePhoto.video),
      path.join(dir, 'live-photos', `${fmt}_${photoName}${videoExt}`),
    )
  }
}
