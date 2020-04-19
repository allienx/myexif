#!/usr/bin/env node

const path = require('path')

const program = require('commander')
const glob = require('glob')

const packageJson = require('./package.json')
const { livePhotos } = require('./src/livePhotos')
const { normalize } = require('./src/normalize')
const { organize } = require('./src/organize')
const { setPermissions } = require('./src/setPermissions')

program
  .name('myexif-run-all')
  .version(packageJson.version)
  .description(
    'Composes myexif scripts to organize photos and videos by their date and time metadata.',
  )

program
  .command('exe <dir>', { isDefault: true })
  .description(
    'Organizes all photos and videos in <dir> by their date and time metadata into dest <dir>.',
  )
  .option('--dry-run', 'log results without performing any actions', false)
  .requiredOption(
    '-d, --dest <dir>',
    'the destination directory to move the files into',
  )
  .action((dir, opts) => {
    const { dryRun, dest } = opts

    let filenames = glob.sync(path.join(dir, '*'))

    let count = normalize({ filenames, dryRun })
    console.log(`${count} files updated.\n`)

    // Re-glob to get normalized filenames.
    filenames = glob.sync(path.join(dir, '*'))

    count = setPermissions({ filenames, dryRun, mode: '644' })
    console.log(`${count} files updated.\n`)

    count = livePhotos({ dir, dryRun, dest })
    console.log(`${count} live photos updated.\n`)

    count = organize({ filenames, dryRun, dest })
    console.log(`${count} files updated.`)
  })

const start = Date.now()

program.parse(process.argv)

const end = Date.now()
const seconds = (end - start) / 1000
const rounded = seconds.toFixed(2)

console.log(`\n✨  Done in ${rounded}s.`)
