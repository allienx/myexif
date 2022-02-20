import exiftoolSync from './exiftoolSync.js'

export default function setAllPngDates({ filename, tag }) {
  const commandArgs = [
    'exiftool',
    '-preserve',
    '-overwrite_original',
    `"-AllDates<${tag}"`,
    `"${filename}"`,
  ]
  const command = commandArgs.join(' ')

  exiftoolSync(command)
}
