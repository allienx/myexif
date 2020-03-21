const { execSync } = require('child_process')

module.exports = {
  getLivePhotos,
}

async function getLivePhotos(dir) {
  const commandArgs = [
    'exiftool',
    '-T',
    '-FileName',
    '-ContentIdentifier',
    `"${dir}"`,
  ]
  const command = commandArgs.join(' ')

  const stdout = execSync(command, { encoding: 'utf8' })

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
