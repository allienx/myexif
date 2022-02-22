import { DateTime } from 'luxon'

export default function parseExifDateString(dateStr) {
  let dt = DateTime.fromFormat(dateStr, 'yyyy:MM:dd HH:mm:ssZZ', {
    setZone: true,
  })

  if (!dt.isValid) {
    dt = DateTime.fromFormat(dateStr, 'yyyy:MM:dd HH:mm:ss')
  }

  return dt
}
