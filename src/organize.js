import { mkdirSync, writeFileSync } from 'fs'
import envPaths from 'env-paths'
import { DateTime } from 'luxon'
import path from 'path'
import getAllFiles from './util/getAllFiles.js'
import organizeFiles from './organizeFiles.js'
import organizeLivePhotos from './organizeLivePhotos.js'

export default function organize({ dryRun, copy, filenames, dest }) {
  // Get all file paths before any files are moved.
  const initialFilenames = getAllFiles(filenames)

  const processedLivePhotos = organizeLivePhotos({
    dryRun,
    copy,
    filenames,
    dest,
  })

  // Exclude live photo files that were already processed.
  const nonLivePhotoFilenames = initialFilenames.filter((filename) => {
    return !processedLivePhotos.find(
      (file) => file.originalFilepath === filename,
    )
  })

  const processedFiles = organizeFiles({
    dryRun,
    copy,
    filenames: nonLivePhotoFilenames,
    dest,
  })

  const files = [...processedLivePhotos, ...processedFiles]

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

  return files
}
