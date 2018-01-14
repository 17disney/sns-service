const SessionModel = require('../models/session')

module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    let { session_key } = req.query

    if (!session_key) {
      session_key = req.fields.session_key
    }

    if (!session_key) {
      return res.retErr('未登录')
    }

    SessionModel.get(session_key).then(result => {
      req.fields.openid = result.openid
      next()
    })
  }
}
