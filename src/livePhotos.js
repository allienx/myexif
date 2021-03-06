const { mkdirSync, renameSync } = require('fs')
const path = require('path')

const { getExifTags, parseExifDate } = require('./util/exif')
const { getNewFilename, getNewSidecarFilename } = require('./util/filename')

module.exports = {
  livePhotos,
}

function livePhotos({ dir, dryRun, dest }) {
  const photos = getLivePhotos(dir)

  photos.forEach((livePhoto) => {
    if (!livePhoto.isComplete) {
      return
    }

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
      mkdirSync(newDir, { recursive: true })

      renameSync(photoFilename, newPhotoFilename)
      renameSync(videoFilename, newVideoFilename)

      if (newSidecarFilename) {
        renameSync(sidecarFilename, newSidecarFilename)
      }
    }
  })

  return photos.length
}

function getLivePhotos(dir) {
  const exifTags = getExifTags({
    filenames: [`"${dir}"`],
    tags: ['DateTimeOriginal', 'ContentIdentifier'],
  })

  const livePhotos = {}

  exifTags.forEach((exifTag) => {
    const { SourceFile, DateTimeOriginal, ContentIdentifier } = exifTag

    if (!ContentIdentifier) {
      return
    }

    const { ext } = path.parse(SourceFile)
    let livePhoto = livePhotos[ContentIdentifier]

    if (!livePhoto) {
      livePhoto = { contentIdentifier: ContentIdentifier }
      livePhotos[ContentIdentifier] = livePhoto
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
