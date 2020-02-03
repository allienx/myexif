const path = require('path')

const { livePhotos } = require('./livePhotos')
const { exif } = require('./exif')
const { transformFilename } = require('./util/transformFilename')
const { exec } = require('./util/promises/child_process')
const { mv } = require('./util/promises/mv')
const { renameExt } = require('./util/promises/renameExt')
const { renameFile } = require('./util/promises/renameFile')
const { rm } = require('./util/promises/rm')

module.exports = {
  all,
}

async function all({ dir }) {
  // Remove any sidecar files.
  const aaeCount = await rm(path.join(dir, '*.aae'))
  log(`${aaeCount} sidecar (.aae) files removed.`)

  // Use consistent file permissions.
  await exec(['find', dir, '-type f -exec chmod 644 {} \\;'].join(' '))

  // Use consistent .jpg file extension.
  const jpegCount = await renameExt(path.join(dir, '*.{jpeg,JPEG,JPG}'), 'jpg')
  log(`${jpegCount} jpeg files renamed with jpg.`)

  // Rename all photo/video files lower, kebab case.
  const fileCount = await renameFile(path.join(dir, '*'), transformFilename)
  log(`${fileCount} files renamed consistently.`)

  // Move and rename live photos (with their videos).
  const newDir = path.join(dir, 'live')
  const liveCount = await livePhotos({ dir, newDir })
  await mv(path.join(newDir, '*.{jpg,heic}'), path.join(newDir, 'jpg'))
  await mv(path.join(newDir, '*.mov'), path.join(newDir, 'mov'))
  const livePhotoCount = await organizePhotos(path.join(newDir, 'jpg', '*'))
  const liveVideoCount = await organizeVideos(path.join(newDir, 'mov', '*'))
  log(`${liveCount} live photos organized.`)
  log(`   ${livePhotoCount} live pictures organized.`)
  log(`   ${liveVideoCount} live videos organized.`)

  // Handle .jpg files.
  const jpgCount = await mv(path.join(dir, '*.jpg'), path.join(dir, 'jpg'))
  await organizePhotos(path.join(dir, 'jpg', '*'))
  log(`${jpgCount} jpg files organized.`)

  // Handle .heic files.
  const heicCount = await mv(path.join(dir, '*.heic'), path.join(dir, 'heic'))
  await organizePhotos(path.join(dir, 'heic', '*'))
  log(`${heicCount} heic files organized.`)

  // Handle .png files.
  const pngCount = await mv(path.join(dir, '*.png'), path.join(dir, 'png'))
  await organizePng(path.join(dir, 'png', '*'))
  log(`${pngCount} png files organized.`)

  // Handle .mov files.
  const movCount = await mv(path.join(dir, '*.mov'), path.join(dir, 'mov'))
  await organizeVideos(path.join(dir, 'mov', '*'))
  log(`${movCount} mov files organized.`)

  // Handle .mp4 files.
  const mp4Count = await mv(path.join(dir, '*.mp4'), path.join(dir, 'mp4'))
  await organizeVideos(path.join(dir, 'mp4', '*'))
  log(`${mp4Count} mp4 files organized.`)
}

async function organizePhotos(pattern) {
  return await exif({
    pattern,
    tag: 'EXIF:DateTimeOriginal',
  })
}

async function organizePng(pattern) {
  return await exif({
    pattern,
    tag: 'XMP:DateCreated',
    setAllDates: true,
  })
}

async function organizeVideos(pattern) {
  return await exif({
    pattern,
    tag: 'QuickTime:CreationDate',
  })
}

function log(str) {
  console.log(str)
}
