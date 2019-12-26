const { exec } = require('child_process')

module.exports = { execProcess }

function execProcess(cmd, opt) {
  return new Promise((resolve, reject) => {
    exec(cmd, opt, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }

      resolve({ stdout, stderr })
    })
  })
}
