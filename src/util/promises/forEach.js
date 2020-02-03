module.exports = {
  forEach,
}

async function forEach(arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]

    await cb(item)
  }
}
