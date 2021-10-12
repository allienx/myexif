#!/usr/bin/env node

const repl = require('repl')

const lodash = require('lodash')
const { DateTime } = require('luxon')

const { moveFiles } = require('./src/moveFiles')
const { moveLivePhotos } = require('./src/moveLivePhotos')
const { setPermissions } = require('./src/setPermissions')
const { setVideoDates } = require('./src/setVideoDates')
const { updateTimezone } = require('./src/updateTimezone')
const exifUtils = require('./src/util/exif')
import getNewFilename from './src/util/getNewFilename.js'
import getNewSidecarFilename from './src/util/getNewSidecarFilename.js'
const pathUtils = require('./src/util/path')

console.log(new Date().toString())
console.log(`\n=== Custom REPL initialized ===\n`)

const r = repl.start('🔥 > ')

// Auto-imports
// Define values on the REPL context to make them globally available

Object.defineProperty(r.context, 'lodash', {
  configurable: false,
  enumerable: true,
  value: lodash,
})

Object.defineProperty(r.context, 'DateTime', {
  configurable: false,
  enumerable: true,
  value: DateTime,
})

Object.defineProperty(r.context, 'actions', {
  configurable: false,
  enumerable: true,
  value: {
    livePhotos: moveLivePhotos,
    normalize,
    organize: moveFiles,
    setPermissions,
    setVideoDates,
    updateTimezone,
  },
})

Object.defineProperty(r.context, 'utils', {
  configurable: false,
  enumerable: true,
  value: {
    exif: exifUtils,
    getNewFilename,
    getNewSidecarFilename,
    path: pathUtils,
  },
})
