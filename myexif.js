#!/usr/bin/env node

const program = require('commander')

const { all } = require('./src/all')
const { exif } = require('./src/exif')
const { livePhotos } = require('./src/livePhotos')
const { setPermissions } = require('./src/setPermissions')
const { setVideoTimezone } = require('./src/setVideoTimezone')

program
  .version('0.0.1')
  .description('Scripts to help organize photos by their EXIF metadata.')

program
  .command('all <dir>')
  .description('Organize all photos and videos in <dir>.')
  .action(async dir => {
    await all({ dir })
  })

program
  .command('exif <pattern> <tag>')
  .description('Re-organize matching files by the specified tag.')
  .action(async (pattern, tag) => {
    const count = await exif({ pattern, tag })

    console.log(`${count} files organized.`)
  })

program
  .command('live-photos <dir>')
  .description('prints each live photo pair to the console')
  .option(
    '--exif',
    'Organizes the files by the photo timestamp instead.',
    false,
  )
  .action(async (dir, opts) => {
    const { exif } = opts

    const count = await livePhotos({ dir, exif })

    if (!exif) {
      console.log()
    }

    console.log(`${count} live photos found.`)
  })

program
  .command('set-permissions <pattern>')
  .description('Set permissions (chmod) for the matching files.')
  .action(async pattern => {
    const count = await setPermissions({ pattern })

    console.log(`${count} files updated.`)
  })

program
  .command('set-video-timezone <pattern>')
  .option('--use-create-date <tzname>', 'Base dates off CreateDate', 'utc')
  .option('--use-file-modify-date', 'Base dates off FileModifyDate', false)
  .option('-t, --timezone <name>', 'Set dates relative to timezone', 'local')
  .description('Set video dates relative to the specified timezone.')
  .action(async (pattern, opts) => {
    const { useCreateDate, useFileModifyDate, timezone } = opts

    const count = await setVideoTimezone({
      pattern,
      useCreateDate,
      useFileModifyDate,
      timezone,
    })

    console.log(`${count} videos updated.`)
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
