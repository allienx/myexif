import { mkdirSync } from 'fs'
import path from 'path'
import getExifTags from './exif/getExifTags.js'
import copyOrMoveSync from './util/copyOrMoveSync.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

export default function organizeLivePhotos({ dryRun, copy, filenames, dest }) {
  const processedFiles = []

  const livePhotos = getLivePhotos(filenames)

  livePhotos
    .filter((livePhoto) => {
      return livePhoto.isComplete
    })
    .forEach((livePhoto) => {
      let { dateTimeOriginal, photoFilename, videoFilename } = livePhoto

      let {
        hash: photoHash,
        dir: newDir,
        filename: newPhotoFilename,
      } = getNewFilename({
        filename: photoFilename,
        exifDateStr: dateTimeOriginal,
        dest,
      })

      let { filename: newVideoFilename } = getNewFilename({
        filename: videoFilename,
        filenameHash: photoHash,
        exifDateStr: dateTimeOriginal,
        dest,
      })

      let { sidecarFilename, newSidecarFilename } = getNewSidecarFilename({
        filename: photoFilename,
        newFilename: newPhotoFilename,
      })

      photoFilename = path.normalize(photoFilename)
      newPhotoFilename = path.normalize(newPhotoFilename)
      videoFilename = path.normalize(videoFilename)
      newVideoFilename = path.normalize(newVideoFilename)
      sidecarFilename = sidecarFilename ? path.normalize(sidecarFilename) : null
      newSidecarFilename = newSidecarFilename
        ? path.normalize(newSidecarFilename || '')
        : null

      processedFiles.push(
        {
          hasValidTimestamp: true,
          originalFilepath: photoFilename,
          newFilepath: newPhotoFilename,
        },
        {
          hasValidTimestamp: true,
          originalFilepath: videoFilename,
          newFilepath: newVideoFilename,
        },
      )

      if (!dryRun) {
        mkdirSync(newDir, { recursive: true })
      }

      copyOrMoveSync({
        dryRun,
        copy,
        filename: photoFilename,
        newFilename: newPhotoFilename,
      })
      copyOrMoveSync({
        dryRun,
        copy,
        filename: videoFilename,
        newFilename: newVideoFilename,
      })

      if (newSidecarFilename) {
        processedFiles.push({
          hasValidTimestamp: true,
          originalFilepath: sidecarFilename,
          newFilepath: newSidecarFilename,
        })

        copyOrMoveSync({
          dryRun,
          copy,
          filename: sidecarFilename,
          newFilename: newSidecarFilename,
        })
      }
    })

  return processedFiles
}

function getLivePhotos(filenames) {
  const exifTags = getExifTags({
    filenames,
    tags: [
      'EXIF:DateTimeOriginal',
      'MakerNotes:MediaGroupUUID',
      'QuickTime:ContentIdentifier',
    ],
  })

  const livePhotos = {}

  exifTags.forEach((exifTag) => {
    const { SourceFile, DateTimeOriginal, MediaGroupUUID, ContentIdentifier } =
      exifTag
    const uuid = MediaGroupUUID || ContentIdentifier

    if (!uuid) {
      return
    }

    const { ext } = path.parse(SourceFile)
    let livePhoto = livePhotos[uuid]

    if (!livePhoto) {
      livePhoto = { contentIdentifier: uuid }
      livePhotos[uuid] = livePhoto
    }

    if (ext.toLowerCase() === '.mov') {
      livePhoto.videoFilename = SourceFile
    } else {
      livePhoto.photoFilename = SourceFile
      livePhoto.dateTimeOriginal = DateTimeOriginal
    }
  })

  return Object.values(livePhotos).map((livePhoto) => {
    const {
      contentIdentifier,
      dateTimeOriginal,
      photoFilename,
      videoFilename,
    } = livePhoto

    return {
      isComplete: !!photoFilename && !!dateTimeOriginal && !!videoFilename,
      contentIdentifier,
      dateTimeOriginal,
      photoFilename,
      videoFilename,
    }
  })
}
