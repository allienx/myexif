import getAllFiles from './util/getAllFiles.js'
import organizeFiles from './organizeFiles.js'
import organizeLivePhotos from './organizeLivePhotos.js'

export default function organize({ dryRun, dir, dest }) {
  // Get all file paths before any files are moved.
  const initialFilenames = getAllFiles([dir])

  const processedLivePhotos = organizeLivePhotos({ dryRun, dir, dest })

  // Exclude live photo files that were already processed.
  const filenames = initialFilenames.filter((filename) => {
    return !processedLivePhotos.find(
      (file) => file.originalFilepath === filename,
    )
  })

  const processedFiles = organizeFiles({ dryRun, filenames, dest })

  return [...processedLivePhotos, ...processedFiles]
}
