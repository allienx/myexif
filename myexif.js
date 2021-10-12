#!/usr/bin/env node

import path from 'path'
import program from 'commander'
import glob from 'glob'
import { livePhotos } from './src/livePhotos.js'
import { normalize } from './src/normalize.js'
import { organize } from './src/organize.js'
import { setPermissions } from './src/setPermissions.js'
import { setVideoDates } from './src/setVideoDates.js'
import { updateTimezone } from './src/updateTimezone.js'

program
  .name('myexif')
  .version('0.0.6')
  .description(
    'Scripts to help organize photos and videos by their EXIF metadata.',
  )

program
  .command('run-all <dir> <dest>')
  .description(
    'Organizes all photos and videos in <dir> by their date and time into <dest>.',
  )
  .option('--dry-run', 'log results without performing any actions', false)
  .action((dir, dest, options) => {
    const { dryRun } = options

    let filenames = glob.sync(path.join(dir, '*'))

    let count = normalize({ filenames, dryRun })
    console.log(`${count} files updated.\n`)

    // Re-glob to get normalized filenames.
    filenames = glob.sync(path.join(dir, '*'))

    count = setPermissions({ filenames, dryRun, mode: '644' })
    console.log(`${count} files updated.\n`)

    count = livePhotos({ dir, dryRun, dest })
    console.log(`${count} live photos updated.\n`)

    // Re-glob to pick up changes made by livePhotos.
    filenames = glob.sync(path.join(dir, '*'))

    count = organize({ filenames, dryRun, dest })
    console.log(`${count} files updated.`)
  })

program
  .command('live-photos <dir>')
  .description(
    'Find live photo-video pairs and organize them based on their EXIF tag values.',
  )
  .option(
    '--dry-run',
    'log live photo-video pairs without performing any actions',
    false,
  )
  .requiredOption(
    '-d, --dest <dir>',
    'the destination directory to move the files into',
  )
  .action((dir, options) => {
    const { dryRun, dest } = options

    const count = livePhotos({ dir, dryRun, dest })

    console.log(`\n${count} live photos updated.`)
  })

program
  .command('normalize <filenames...>')
  .description(
    'Normalize filenames using lowercase and dashes. Uses consistent .jpg extension.',
  )
  .option('--dry-run', 'log new file names without performing actions', false)
  .action((filenames, options) => {
    const { dryRun } = options

    const count = normalize({ filenames, dryRun })

    console.log(`\n${count} files updated.`)
  })

program
  .command('organize <filenames...>')
  .description('Organize filenames based on their EXIF tag values.')
  .option(
    '--dry-run',
    'log exiftool commands without performing any actions',
    false,
  )
  .requiredOption(
    '-d, --dest <dir>',
    'the destination directory to move the files into',
  )
  .action((filenames, options) => {
    const { dryRun, dest } = options

    const count = organize({ filenames, dryRun, dest })

    console.log(`\n${count} files updated.`)
  })

program
  .command('set-permissions <filenames...>')
  .description('Set permissions (chmod) for the matching files.')
  .option('--dry-run', 'log new permissions without performing actions', false)
  .option('-m, --mode <mode>', 'new permissions as octal string', '644')
  .action((filenames, options) => {
    const { dryRun, mode } = options

    const count = setPermissions({ filenames, dryRun, mode })

    console.log(`\n${count} files updated.`)
  })

program
  .command('set-video-dates <filenames...>')
  .description(
    'Set values for video dates based on the QuickTime:CreateDate EXIF tag (assumed to be UTC).',
  )
  .option(
    '--dry-run',
    'log exiftool commands without performing any actions',
    false,
  )
  .requiredOption(
    '-t, --timezone <timezone>',
    'set the QuickTime:CreationDate EXIF tag relative to this timezone',
  )
  .action((filenames, options) => {
    const { dryRun, timezone } = options

    const count = setVideoDates({ filenames, dryRun, timezone })

    console.log(`\n${count} files updated.`)
  })

program
  .command('update-timezone <filenames...>')
  .description(
    'Updates the timezone of the specified EXIF tag for all filenames.',
  )
  .option(
    '--dry-run',
    'log exiftool commands without performing any actions',
    false,
  )
  .option(
    '-t, --tag <tag>',
    'name of the EXIF tag to update',
    'QuickTime:CreateDate',
  )
  .option(
    '-s, --src-timezone <timezone>',
    'parse the EXIF tag value relative to this timezone',
    'Etc/UTC',
  )
  .requiredOption(
    '-n, --new-timezone <timezone>',
    'set the EXIF tag value relative to this timezone',
  )
  .action((filenames, options) => {
    const { dryRun, tag, srcTimezone, newTimezone } = options

    const count = updateTimezone({
      filenames,
      dryRun,
      tag,
      srcTimezone,
      newTimezone,
    })

    console.log(`\n${count} files updated.`)
  })

const start = Date.now()

program.parse(process.argv)

const end = Date.now()
const seconds = (end - start) / 1000
const rounded = seconds.toFixed(2)

console.log(`\n✨  Done in ${rounded}s.`)
