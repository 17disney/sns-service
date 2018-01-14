module.exports = function (app) {
  app.use('/posts', require('./posts'))
  app.use('/park', require('./park'))
  app.use('/user', require('./user'))
  app.use('/position', require('./position'))

  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.json({err: '404'})
    }
  })
}
