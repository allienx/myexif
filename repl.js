#!/usr/bin/env node

const repl = require('repl')

const lodash = require('lodash')
const { DateTime } = require('luxon')

const { normalize } = require('./src/normalize')
const { organize } = require('./src/organize')
const { setPermissions } = require('./src/setPermissions')
const { setVideoDates } = require('./src/setVideoDates')
const { updateTimezone } = require('./src/updateTimezone')
const { getExifTagValue } = require('./src/util/exif')
const { getLivePhotos } = require('./src/util/getLivePhotos')
const { isFile } = require('./src/util/isFile')

console.log(`Custom REPL initialized - ${new Date()}\n`)

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

Object.defineProperty(r.context, 'scripts', {
  configurable: false,
  enumerable: true,
  value: {
    normalize,
    organize,
    setPermissions,
    setVideoDates,
    updateTimezone,
  },
})

Object.defineProperty(r.context, 'utils', {
  configurable: false,
  enumerable: true,
  value: {
    getExifTagValue,
    getLivePhotos,
    isFile,
  },
})
