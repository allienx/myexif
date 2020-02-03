#!/usr/bin/env node

const program = require('commander')

const { all } = require('./src/all')
const { exif } = require('./src/exif')
const { livePhotos } = require('./src/livePhotos')
const { setVideoDates } = require('./src/setVideoDates')

program
  .version('0.0.1')
  .description('Scripts to help organize photos by their EXIF metadata.')

program
  .command('all <dir>')
  .description('organize all photos and videos in <dir>')
  .action(async dir => {
    await all({ dir })
  })

program
  .command('exif <pattern> <tag>')
  .description('re-organize matching files by the specified tag')
  .action(async (pattern, tag) => {
    await exif({ pattern, tag })
  })

program
  .command('live-photos <dir>')
  .description('move live photos (and their videos) into a live-photos/ dir')
  .action(async dir => {
    await livePhotos({ dir })
  })

program
  .command('set-video-dates <dir> <timezone>')
  .description('set video dates relative to the specified timezone')
  .action(async (pattern, timezone) => {
    await setVideoDates({ pattern, timezone })
  })

const start = Date.now()

program
  .parseAsync(process.argv)
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    const end = Date.now()
    const seconds = (end - start) / 1000
    const rounded = seconds.toFixed(2)

    console.log(`\n✨  Done in ${rounded}s.`)
  })
