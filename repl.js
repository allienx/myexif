#!/usr/bin/env node

const repl = require('repl')

const lodash = require('lodash')
const luxon = require('luxon')

const copyFiles = require('./src/copyFiles')
const copyLivePhotos = require('./src/copyLivePhotos')
const setVideoDates = require('./src/setVideoDates')
const updateTimezone = require('./src/updateTimezone')

import exiftoolSync from './src/exif/exiftoolSync.js'
import getExifTags from './src/exif/getExifTags.js'
import getExifTagValue from './src/exif/getExifTagValue.js'
import parseExifDateString from './src/exif/parseExifDateString.js'

import getAllFiles from './src/util/getAllFiles.js'
import getNewFilename from './src/util/getNewFilename.js'
import getNewSidecarFilename from './src/util/getNewSidecarFilename.js'
import isDirectory from './src/util/isDirectory.js'
import isFile from './src/util/isFile.js'
import isValidPath from './src/util/isValidPath.js'

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

Object.defineProperty(r.context, 'luxon', {
  configurable: false,
  enumerable: true,
  value: luxon,
})

Object.defineProperty(r.context, 'actions', {
  configurable: false,
  enumerable: true,
  value: {
    copyFiles,
    copyLivePhotos,
    setVideoDates,
    updateTimezone,
  },
})

Object.defineProperty(r.context, 'exif', {
  configurable: false,
  enumerable: true,
  value: {
    exiftoolSync,
    getExifTags,
    getExifTagValue,
    parseExifDateString,
  },
})

Object.defineProperty(r.context, 'utils', {
  configurable: false,
  enumerable: true,
  value: {
    getAllFiles,
    getNewFilename,
    getNewSidecarFilename,
    isDirectory,
    isFile,
    isValidPath,
  },
})
