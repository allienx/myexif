const { execSync } = require('child_process')

module.exports = {
  getExiftoolValue,
}

function getExiftoolValue(tag, filename) {
  const commandArgs = ['exiftool', '-T', `-${tag}`, `"${filename}"`]
  const command = commandArgs.join(' ')

  const stdout = execSync(command, { encoding: 'utf8' })

  return stdout.trim()
}
