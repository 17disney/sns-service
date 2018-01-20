module.exports = app => {
  app.use('/posts', require('./posts'))
  app.use('/user', require('./user'))
  app.use('/comments', require('./comments'))
  app.use('/position', require('./position'))
  app.use('/dynams', require('./dynams'))
  app.use('/upload', require('./upload'))
  app.use('/notice', require('./notice'))
  app.use('/topic', require('./topic'))
  app.use('/park', require('./park'))

  // 404 page
  app.use((req, res, err) => {
    if (!res.headersSent) {
      res.json({ err: '404' })
    }
  })
}
