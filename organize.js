#!/usr/bin/env node

const program = require('commander')

const { all } = require('./src/all')
const { exif } = require('./src/exif')
const { livePhotos } = require('./src/livePhotos')

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
  .command('exif <dir> <tag>')
  .description('re-organize matching files by the specified tag')
  .action(async (dir, tag) => {
    await exif({ dirs: [dir], tagName: tag })
  })

program
  .command('live-photos <dir>')
  .description('move live photos (and their videos) into a live-photos/ dir')
  .action(async dir => {
    await livePhotos({ dir })
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
