function tranverse(obj) {
  if (typeof obj !== 'object') {
    return
  }
  Object.keys(obj).forEach(key => {})
}

export default {
  tranverse,
}
