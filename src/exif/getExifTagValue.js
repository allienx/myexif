import exiftoolSync from 'src/exif/exiftoolSync.js'

export default function getExifTagValue(filename, tag) {
  const commandArgs = ['exiftool', '-T', `-${tag}`, `"${filename}"`]
  const command = commandArgs.join(' ')

  return exiftoolSync(command)
}
