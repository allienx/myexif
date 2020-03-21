#!/usr/bin/env node

const program = require('commander')

const { normalize } = require('./src/normalize')
const { organize } = require('./src/organize')
const { setPermissions } = require('./src/setPermissions')
const { setVideoDates } = require('./src/setVideoDates')
const { updateTimezone } = require('./src/updateTimezone')

program
  .version('0.0.1')
  .description('Scripts to help organize photos by their EXIF metadata.')

program
  .command('normalize <filenames...>')
  .description(
    'Normalize filenames using lowercase and dashes. Uses consistent .jpg extension.',
  )
  .option('--dry-run', 'log new file names without performing actions', false)
  .action(async (filenames, opts) => {
    const { dryRun } = opts

    const count = normalize({ dryRun, filenames })

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
  .action(async (filenames, opts) => {
    const { dryRun, dest } = opts

    const count = organize({ dryRun, filenames, dest })

    console.log(`\n${count} files updated.`)
  })

program
  .command('set-permissions <filenames...>')
  .description('Set permissions (chmod) for the matching files.')
  .option('--dry-run', 'log new permissions without performing actions', false)
  .option('-m, --mode <mode>', 'new permissions as octal string', '644')
  .action(async (filenames, opts) => {
    const { dryRun, mode } = opts

    const count = setPermissions({ dryRun, filenames, mode })

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
  .action(async (filenames, opts) => {
    const { dryRun, timezone } = opts

    const count = setVideoDates({
      dryRun,
      filenames,
      timezone,
    })

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
  .action(async (filenames, opts) => {
    const { dryRun, tag, srcTimezone, newTimezone } = opts

    const count = updateTimezone({
      dryRun,
      filenames,
      tag,
      srcTimezone,
      newTimezone,
    })

    console.log(`\n${count} files updated.`)
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
