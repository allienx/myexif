import exiftoolSync from './exiftoolSync.js'

export default function getExifTags({ filenames, tags }) {
  const commandArgs = [
    'exiftool',
    '-json',
    tags.map((t) => `-${t}`).join(' '),
    filenames.map((fn) => fn).join(' '),
  ]
  const command = commandArgs.join(' ')
  const stdout = exiftoolSync(command)

  try {
    return JSON.parse(stdout)
  } catch (err) {
    return []
  }
}
