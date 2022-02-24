#!/usr/bin/env node

import program from 'commander'
import organize from './src/organize.js'
import setVideoDates from './src/setVideoDates.js'
import updateTimezone from './src/updateTimezone.js'

program
  .name('myexif')
  .version('0.0.6')
  .description(
    'Scripts to help organize photos and videos by their EXIF metadata.',
  )

program
  .command('organize <dir>')
  .description(
    'Organizes all photo and video files based on their EXIF tag values.',
  )
  .option(
    '--dry-run',
    'log exiftool commands without performing any actions',
    false,
  )
  .option('--copy', 'copy the files instead of move', false)
  .requiredOption(
    '-d, --dest <dir>',
    'the destination directory to move the files into',
  )
  .action((dir, options) => {
    const { dryRun, copy, dest } = options

    if (dryRun) {
      console.log('🧪 DRY RUN\n')
    }

    const processedFiles = organize({ dryRun, copy, dir, dest })

    console.log(
      dryRun
        ? `\n${processedFiles.length} files seen in dry run.`
        : `\n${processedFiles.length} files updated.`,
    )
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
  .option(
    '-e, --tag <tag>',
    'the exiftool tag to read the date from',
    'CreateDate',
  )
  .requiredOption(
    '-t, --timezone <timezone>',
    'set the QuickTime:CreationDate EXIF tag relative to this timezone',
  )
  .action((filenames, options) => {
    const { dryRun, tag, timezone } = options

    if (dryRun) {
      console.log('🧪 DRY RUN\n')
    }

    const count = setVideoDates({ dryRun, filenames, tag, timezone })

    console.log(
      dryRun
        ? `\n${count} files seen in dry run.`
        : `\n${count} files updated.`,
    )
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

    if (dryRun) {
      console.log('🧪 DRY RUN\n')
    }

    const count = updateTimezone({
      filenames,
      dryRun,
      tag,
      srcTimezone,
      newTimezone,
    })

    console.log(
      dryRun
        ? `\n${count} files seen in dry run.`
        : `\n${count} files updated.`,
    )
  })

const start = Date.now()

program.parse(process.argv)

const end = Date.now()
const seconds = (end - start) / 1000
const rounded = seconds.toFixed(2)

console.log(`\n✨  Done in ${rounded}s.`)
