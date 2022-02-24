import { mkdirSync, writeFileSync } from 'fs'
import envPaths from 'env-paths'
import glob from 'glob'
import { DateTime } from 'luxon'
import path from 'path'
import isDirectory from './util/isDirectory.js'
import organizeFiles from './organizeFiles.js'
import organizeLivePhotos from './organizeLivePhotos.js'

export default function organize({ dryRun, copy, dir, dest }) {
  const allDirectoryPaths = isDirectory(dir)
    ? [
        dir,
        ...glob.sync(path.join(dir, '**', '*')).filter((p) => {
          return isDirectory(p)
        }),
      ]
    : [dir]
  const processedFiles = []

  allDirectoryPaths.forEach((dirPath) => {
    const files = runOrganize({ dryRun, copy, dir: dirPath, dest })

    processedFiles.push(...files)
  })

  if (!dryRun) {
    writeLogFile(processedFiles)
  }

  return processedFiles
}

function runOrganize({ dryRun, copy, dir, dest }) {
  const processedLivePhotos = organizeLivePhotos({
    dryRun,
    copy,
    filenames: [dir],
    dest,
  })

  const processedFiles = organizeFiles({
    dryRun,
    copy,
    filenames: [dir],
    filenamesToSkip: processedLivePhotos.map((file) => file.originalFilepath),
    dest,
  })

  return [...processedLivePhotos, ...processedFiles]
}

function writeLogFile(files) {
  const dt = DateTime.now()
  const paths = envPaths('myexif')
  const logFilename = path.join(
    paths.log,
    `${dt.toFormat('yyyyMMdd-HHmmss')}-result.json`,
  )
  const logData = { createdAt: dt.toISO(), processedFiles: files }

  mkdirSync(paths.log, { recursive: true })
  writeFileSync(logFilename, JSON.stringify(logData, null, 2))

  console.log(`\nLogged results to ${logFilename}`)
}
