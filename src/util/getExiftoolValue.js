const { exec } = require('./promises/child_process')

module.exports = {
  getExiftoolValue,
}

async function getExiftoolValue(tag, path) {
  const cmdArgs = ['exiftool', '-T', `-${tag}`, path]

  const { stdout } = await exec(cmdArgs.join(' '))

  return stdout.trim()
}
