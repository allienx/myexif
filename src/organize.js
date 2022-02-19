import getAllFiles from './util/getAllFiles.js'
import organizeFiles from './organizeFiles.js'
import organizeLivePhotos from './organizeLivePhotos.js'

export default function organize({ dryRun, copy, dir, dest }) {
  // Get all file paths before any files are moved.
  const initialFilenames = getAllFiles([dir])

  const processedLivePhotos = organizeLivePhotos({ dryRun, copy, dir, dest })

  // Exclude live photo files that were already processed.
  const filenames = initialFilenames.filter((filename) => {
    return !processedLivePhotos.find(
      (file) => file.originalFilepath === filename,
    )
  })

  const processedFiles = organizeFiles({ dryRun, copy, filenames, dest })

  return [...processedLivePhotos, ...processedFiles]
}
