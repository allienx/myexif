import path from 'path'
import { exists } from './path.js'

export default function getNewSidecarFilename({ filename, newFilename }) {
  const { dir, name } = path.parse(filename)
  const sidecarFilename = path.join(dir, `${name}.aae`)

  if (!exists(sidecarFilename)) {
    return {}
  }

  const { dir: newDir, name: newName } = path.parse(newFilename)
  const newSidecarFilename = path.join(newDir, `${newName}.aae`)

  return {
    sidecarFilename,
    newSidecarFilename,
  }
}
