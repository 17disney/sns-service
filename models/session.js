const Session = require('../lib/mongo').Session
const { createSession } = require('../lib/util')
module.exports = {
  // 设置 Session
  set(data) {
    let { openid, session_key } = data
    let key = createSession()
    let session = {
      key,
      openid,
      session_key
    }
    Session.create(session).exec()
    return key
  },
  // 获取 Session
  get(key) {
    return Session.findOne({ key })
      .addCreatedAt()
      .exec()
  }
}
