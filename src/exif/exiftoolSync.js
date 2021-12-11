import { execSync } from 'child_process'

export default function exiftoolSync(command) {
  const stdout = execSync(command, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'], // prevent exiftool logs to console
  })

  return stdout.trim()
}
