import { copyFileSync, renameSync } from 'fs'

export default function copyOrMoveSync({
  dryRun,
  copy,
  filename,
  newFilename,
}) {
  if (newFilename === filename) {
    return
  }

  console.log(`${filename.padEnd(70, '.')}${newFilename}`)

  if (dryRun) {
    return
  }

  return copy
    ? copyFileSync(filename, newFilename)
    : renameSync(filename, newFilename)
}
