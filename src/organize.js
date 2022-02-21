import { mkdirSync, writeFileSync } from 'fs'
import envPaths from 'env-paths'
import { DateTime } from 'luxon'
import path from 'path'
import organizeFiles from './organizeFiles.js'
import organizeLivePhotos from './organizeLivePhotos.js'

export default function organize({ dryRun, copy, filenames, dest }) {
  const processedLivePhotos = organizeLivePhotos({
    dryRun,
    copy,
    filenames,
    dest,
  })

  const processedFiles = organizeFiles({
    dryRun,
    copy,
    filenames,
    filenamesToSkip: processedLivePhotos.map((file) => file.originalFilepath),
    dest,
  })

  const files = [...processedLivePhotos, ...processedFiles]

  if (!dryRun) {
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

  return files
}
