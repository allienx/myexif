import fs from 'fs'
import path from 'path'
import getExifTags from './exif/getExifTags.js'
import parseExifDateString from './exif/parseExifDateString.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

export default function copyLivePhotos({ dryRun, dir, dest }) {
  const processedFilenames = []

  const livePhotos = getLivePhotos(dir)

  livePhotos
    .map((livePhoto) => {
      processedFilenames.push(livePhoto.photoFilename, livePhoto.videoFilename)

      return livePhoto
    })
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

      console.log(`${photoFilename} -> ${newPhotoFilename}`)
      console.log(`${videoFilename} -> ${newVideoFilename}`)

      if (newSidecarFilename) {
        console.log(`${sidecarFilename} -> ${newSidecarFilename}`)
      }

      if (!dryRun) {
        fs.mkdirSync(newDir, { recursive: true })

        fs.copyFileSync(photoFilename, newPhotoFilename)
        fs.copyFileSync(videoFilename, newVideoFilename)

        if (newSidecarFilename) {
          fs.copyFileSync(sidecarFilename, newSidecarFilename)
        }
      }
    })

  return processedFilenames
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
