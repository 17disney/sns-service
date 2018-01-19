const Session = require('../lib/mongo').Session
module.exports = {
  // 设置 Session
  set(session) {
    return Session.create(session).exec()
  },
  // 获取 Session
  get(key) {
    return Session.findOne({ key })
      .addCreatedAt()
      .exec()
  }
}
