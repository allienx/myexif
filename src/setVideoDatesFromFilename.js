#!/usr/bin/env node

const path = require('path')

const first = require('lodash/first')
const last = require('lodash/last')
const { DateTime } = require('luxon')

const { exec } = require('./util/promises/child_process')
const { readdir } = require('./util/promises/fs')

const args = process.argv.map(arg => arg)
args.shift()
args.shift()

const zone = args[0]
const dir = last(args) || '.'

main()
  .catch(err => {
    console.log(err)
    console.log()
  })
  .finally(() => {
    console.log('✨  Done.')
  })

async function main() {
  const files = await readdir(dir, { withFileTypes: true })

  for (let i = 0; i < files.length; i++) {
    const dirent = files[i]

    if (!dirent.isFile() || dirent.name.startsWith('.')) {
      return
    }

    const matches = dirent.name.match(/\d\d\d\d-\d\d-\d\d-\d\d-\d\d-\d\d/g)
    const match = first(matches)

    if (!match) {
      return
    }

    const [year, month, day, hour, minute, second] = match.split('-')

    const dt = DateTime.fromObject({
      year,
      month,
      day,
      hour,
      minute,
      second,
      zone,
    })

    const utcFormat = dt.toUTC().toFormat('yyyy:MM:dd HH:mm:ss')
    const zoneFormat = dt.toFormat('yyyy:MM:dd HH:mm:ssZZ')

    const cmdArgs = [
      'exiftool',
      '-preserve',
      `'-File:FileModifyDate=${zoneFormat}'`,
      `'-QuickTime:CreateDate=${utcFormat}'`,
      `'-QuickTime:ModifyDate=${utcFormat}'`,
      `'-QuickTime:TrackCreateDate=${utcFormat}'`,
      `'-QuickTime:TrackModifyDate=${utcFormat}'`,
      `'-QuickTime:MediaCreateDate=${utcFormat}'`,
      `'-QuickTime:MediaModifyDate=${utcFormat}'`,
      `'-QuickTime:CreationDate=${zoneFormat}'`,
      path.join(dir, dirent.name),
    ]

    const { stdout } = await exec(cmdArgs.join(' '))

    console.log(stdout.trim())
  }
}
