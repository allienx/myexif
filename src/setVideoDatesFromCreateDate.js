#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const last = require('lodash/last')
const { DateTime } = require('luxon')

const { execProcess } = require('./util/execProcess')

const args = process.argv.map(arg => arg)
args.shift()
args.shift()

const zone = args[0]
const dir = last(args) || '.'

fs.readdir(dir, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  files.forEach(async dirent => {
    if (!dirent.isFile() || dirent.name.startsWith('.')) {
      return
    }

    const createDate = await getCreateDate(path.join(dir, dirent.name))
    const dt = DateTime.fromFormat(createDate, 'yyyy:MM:dd HH:mm:ss', {
      zone: 'utc',
    })

    const utcFormat = dt.toFormat('yyyy:MM:dd HH:mm:ss')
    const zoneFormat = dt.setZone(zone).toFormat('yyyy:MM:dd HH:mm:ssZZ')

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

    const { stdout } = await execProcess(cmdArgs.join(' '))

    console.log(stdout.trim())
  })
})

async function getCreateDate(path) {
  const cmdArgs = ['exiftool', '-CreateDate', path]

  const { stdout } = await execProcess(cmdArgs.join(' '))
  const parts = stdout.trim().split(':')
  parts.splice(0, 1)

  return parts.join(':').trim()
}
