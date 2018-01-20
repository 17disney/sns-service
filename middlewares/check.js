const SessionModel = require('../models/session')
const UserModel = require('../models/users')

const { to } = require('../lib/util')

module.exports = {
  async checkLogin(req, res, next) {
    let { session_key } = req.query
    if (!session_key) {
      session_key = req.fields.session_key
    }
    if (!session_key) {
      return res.retErr('未登录')
    }
    let [err, data] = await to(SessionModel.get(session_key))
    if (err || !data) return res.retErr('登录已失效')

    let { userid } = data
    req.fields.userid = userid
    next()
  },
  async getUserinfo(req, res, next) {
    let { userid } = req.fields
    ;[err, data] = await to(UserModel.getUserById(userid))
    if (err) throw new Error(err)
    if (!data) throw new Error('没有此用户')

    req.userinfo = data
    next()
  }

}
