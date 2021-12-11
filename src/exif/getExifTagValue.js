import exiftoolSync from './exiftoolSync.js'

export default function getExifTagValue(filename, tag) {
  const commandArgs = ['exiftool', '-T', `-${tag}`, `"${filename}"`]
  const command = commandArgs.join(' ')

  return exiftoolSync(command)
}
