import { mkdirSync } from 'fs'
import path from 'path'
import getExifTags from './exif/getExifTags.js'
import parseExifDateString from './exif/parseExifDateString.js'
import copyOrMoveSync from './util/copyOrMoveSync.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

export default function organizeLivePhotos({ dryRun, copy, dir, dest }) {
  const processedFiles = []

  const livePhotos = getLivePhotos(dir)

  livePhotos
    .filter((livePhoto) => {
      return livePhoto.isComplete
    })
    .forEach((livePhoto) => {
      const { dateTimeOriginal, photoFilename, videoFilename } = livePhoto
      const date = parseExifDateString(dateTimeOriginal)

      const {
        hash: photoHash,
        dir: newDir,
        filename: newPhotoFilename,
      } = getNewFilename({
        filename: photoFilename,
        date,
        dest,
      })

      const { filename: newVideoFilename } = getNewFilename({
        filename: videoFilename,
        filenameHash: photoHash,
        date,
        dest,
      })

      const { sidecarFilename, newSidecarFilename } = getNewSidecarFilename({
        filename: photoFilename,
        newFilename: newPhotoFilename,
      })

      console.log(`${photoFilename.padEnd(70, '.')}${newPhotoFilename}`)
      console.log(`${videoFilename.padEnd(70, '.')}${newVideoFilename}`)

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

      if (newSidecarFilename) {
        console.log(`${sidecarFilename.padEnd(70, '.')}${newSidecarFilename}`)

        processedFiles.push({
          hasValidTimestamp: true,
          originalFilepath: sidecarFilename,
          newFilepath: newSidecarFilename,
        })
      }

      if (!dryRun) {
        mkdirSync(newDir, { recursive: true })

        copyOrMoveSync({
          copy,
          filename: photoFilename,
          newFilename: newPhotoFilename,
        })
        copyOrMoveSync({
          copy,
          filename: videoFilename,
          newFilename: newVideoFilename,
        })

        if (newSidecarFilename) {
          copyOrMoveSync({
            copy,
            filename: sidecarFilename,
            newFilename: newSidecarFilename,
          })
        }
      }
    })

  return processedFiles
}

function getLivePhotos(dir) {
  const exifTags = getExifTags({
    filenames: [`"${dir}"`],
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
