import { copyFileSync, renameSync } from 'fs'

export default function copyOrMoveSync({ copy, filename, newFilename }) {
  return copy
    ? copyFileSync(filename, newFilename)
    : renameSync(filename, newFilename)
}
