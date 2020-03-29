const path = require('path')

const { DateTime } = require('luxon')

module.exports = {
  getNewFilename,
}

function getNewFilename({ filename, date, dest }) {
  const newDir = getDirectory({ dest, date })
  const newFilename = getFilename({ filename, date })

  return {
    dir: newDir,
    filename: path.join(newDir, newFilename),
  }
}

function getDirectory({ dest, date }) {
  const dt = DateTime.fromJSDate(date)
  const year = dt.toFormat('yyyy')
  const month = dt.toFormat('MM-MMM')

  return path.join(dest, year, month)
}

function getFilename({ filename, date }) {
  const dt = DateTime.fromJSDate(date)
  const calendarDate = dt.toFormat('yyyy-MM-dd')
  const time = dt.toFormat('HH-mm-ss')

  const { name, ext } = path.parse(filename)

  return `${calendarDate}_${time}_${name}${ext}`
}
