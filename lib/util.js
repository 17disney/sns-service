var createSession = () => {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
}

exports.createSession = createSession

exports.to = (promise) => {
  return promise.then(data => {
     return [null, data];
  })
  .catch(err => [err]);
}
