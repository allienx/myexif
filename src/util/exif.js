const { execSync } = require('child_process')

module.exports = {
  getExifTagValue,
}

function getExifTagValue(filename, tag) {
  const commandArgs = ['exiftool', '-T', `-${tag}`, `"${filename}"`]
  const command = commandArgs.join(' ')

  const stdout = execSync(command, { encoding: 'utf8' })

  return stdout.trim()
}
