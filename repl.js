#!/usr/bin/env node

import repl from 'repl'

import lodash from 'lodash'
import * as luxon from 'luxon'

import copyFiles from './src/copyFiles.js'
import copyLivePhotos from './src/copyLivePhotos.js'
import setVideoDates from './src/setVideoDates.js'
import updateTimezone from './src/updateTimezone.js'

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

Object.defineProperty(r.context, 'program', {
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
