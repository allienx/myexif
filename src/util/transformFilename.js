module.exports = {
  transformFilename,
}

function sanitize(str) {
  return str.replace(/[\$\(\)\?\*\|\<\>\:\"]/g, '')
}

// Replace any whitespace and underscores with dashes.
function dashes(str) {
  return str.replace(/[\s_]/g, '-').replace(/-{2,}/g, '-')
}

function lowerCase(str) {
  return str.toLowerCase()
}

function transformFilename(name) {
  const transformers = [sanitize, dashes, lowerCase]

  return transformers.reduce((str, transform) => transform(str), name)
}
