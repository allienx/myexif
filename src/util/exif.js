const { execSync } = require('child_process')

const { DateTime } = require('luxon')

module.exports = {
  getExifTagValue,
  getExifTags,
  parseExifDate,
}

function getExifTagValue(filename, tag) {
  const commandArgs = ['exiftool', '-T', `-${tag}`, `"${filename}"`]
  const command = commandArgs.join(' ')

  return _exiftool(command)
}

function getExifTags({ filenames, tags }) {
  const commandArgs = [
    'exiftool',
    '-json',
    tags.map(tag => `-${tag}`).join(' '),
    filenames.join(' '),
  ]
  const command = commandArgs.join(' ')
  const stdout = _exiftool(command)

  return JSON.parse(stdout)
}

function parseExifDate(dateStr) {
  let dt = DateTime.fromFormat(dateStr, 'yyyy:MM:dd HH:mm:ssZZ')

  if (!dt.isValid) {
    dt = DateTime.fromFormat(dateStr, 'yyyy:MM:dd HH:mm:ss')
  }

  return dt.toJSDate()
}

function _exiftool(command) {
  const stdout = execSync(command, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'], // prevent exiftool logs to console
  })

  return stdout.trim()
}
