import fs from 'fs'
import path from 'path'
import { getExifTags, parseExifDate } from './util/exif.js'
import getNewFilename from './util/getNewFilename.js'
import getNewSidecarFilename from './util/getNewSidecarFilename.js'

export { moveLivePhotos }

function moveLivePhotos({ dryRun, dir, dest }) {
  let count = 0
  const photos = getLivePhotos(dir)

  photos
    .filter((livePhoto) => {
      return livePhoto.isComplete
    })
    .forEach((livePhoto) => {
      count += 1

      const { dateTimeOriginal, photoFilename, videoFilename } = livePhoto
      const date = parseExifDate(dateTimeOriginal)

      const { dir: newDir, filename: newPhotoFilename } = getNewFilename({
        filename: photoFilename,
        date,
        dest,
      })

      const { filename: newVideoFilename } = getNewFilename({
        filename: videoFilename,
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

        fs.renameSync(photoFilename, newPhotoFilename)
        fs.renameSync(videoFilename, newVideoFilename)

        if (newSidecarFilename) {
          fs.renameSync(sidecarFilename, newSidecarFilename)
        }
      }
    })

  return count
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
