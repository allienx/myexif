const path = require('path')

const { exec } = require('./promises/child_process')

module.exports = getLivePhotos

async function getLivePhotos(dir) {
  const cmdArgs = [
    'exiftool',
    '-T',
    '-FileName',
    '-ContentIdentifier',
    path.join(dir),
  ]

  const { stdout } = await exec(cmdArgs.join(' '))

  const livePhotos = {}

  stdout.split('\n').forEach(line => {
    if (!line) {
      return
    }

    const [filename, contentIdentifier] = line.split('\t')

    if (contentIdentifier === '-') {
      return
    }

    if (!livePhotos.hasOwnProperty(contentIdentifier)) {
      livePhotos[contentIdentifier] = { contentIdentifier }
    }

    if (filename.includes('.mov')) {
      livePhotos[contentIdentifier].video = filename
    } else {
      // Allow .jpeg and .heic for photo file extensions.
      livePhotos[contentIdentifier].photo = filename
    }
  })

  return Object.values(livePhotos)
}
