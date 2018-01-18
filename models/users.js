const User = require('../lib/mongo').User

module.exports = {
  // 创建新用户
  create(user) {
    user.login_at = Date.now()
    return User.create(user).exec()
  },

  // 更新用户信息
  updateByOpenid(openid, data) {
    return User.update({ openid }, { $set: data }).exec()
  },

  // 登录
  login(data) {
    let { openid } = data
    let set = {
      login_at: Date.now()
    }
    return User.update({ openid }, { $set: set }).exec()
  },

  // 获取在线用户
  getOnline() {
    let start = Date.now() - 60000 * 3000 // 30分钟内活跃
    return User.find(
      { pos_at: { $gt: start } },
      {
        nickName: 1,
        coordinates: 1,
        avatarFile: 1,
        gender: 1,
        pos_at: 1,
        country: 1,
        _id: 0
      }
    ).exec()
  },

  // 通过 openid 获取用户信息
  getUserByOpenid(openid) {
    return User.findOne({ openid }, { openid: 0 })
      .addCreatedAt()
      .exec()
  },

  // 更新用户地理信息
  updataUserPos(data) {
    let { openid, coordinates } = data
    let set = {
      coordinates,
      pos_at: Date.now() // 位置更新时间
    }
    return User.update({ openid }, { $set: set }).exec()
  },

  // 获取附近的用户
  getNearUsers() {
    return User.find({}, { openid: 0 })
  }
}
