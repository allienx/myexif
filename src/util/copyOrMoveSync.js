import fse from 'fs-extra'

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
    ? fse.copySync(filename, newFilename, { preserveTimestamps: true })
    : fse.moveSync(filename, newFilename, {})
}
