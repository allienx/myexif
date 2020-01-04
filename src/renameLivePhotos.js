#!/usr/bin/env node

const path = require('path')

const first = require('lodash/first')
const { DateTime } = require('luxon')

const { mkdir, rename } = require('./util/promises/fs')
const getExiftoolValue = require('./util/getExiftoolValue')
const getLivePhotos = require('./util/getLivePhotos')

const args = process.argv.map(arg => arg)
args.shift()
args.shift()

const dir = first(args) || '.'

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
  }

  for (let i = 0; i < livePhotos.length; i++) {
    const livePhoto = livePhotos[i]

    const dateTimeOriginal = await getExiftoolValue(
      'DateTimeOriginal',
      dir + '/' + livePhoto.photo,
    )

    const dt = DateTime.fromFormat(dateTimeOriginal, 'yyyy:MM:dd HH:mm:ss')
    const fmt = dt.toFormat('yyyy-MM-dd_HH-mm-ss')

    await rename(
      path.join(dir, livePhoto.photo),
      path.join(dir, 'live-photos', `${fmt}_${livePhoto.photo}`),
    )

    await rename(
      path.join(dir, livePhoto.video),
      path.join(dir, 'live-photos', `${fmt}_${livePhoto.video}`),
    )
  }
}
