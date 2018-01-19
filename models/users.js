const User = require('../lib/mongo').User

module.exports = {
  // 创建新用户
  create(user) {
    user.loginAt = Date.now()
    user.createAt = Date.now()
    user.pv = 0
    return User.create(user).exec()
  },

  // 增加个人主页浏览量
  incPv(userid) {
    return User.update({ userid }, { $inc: { pv: 1 } }).exec()
  },

  // Openid 更新用户信息
  updateByOpenid(openid, $set) {
    return User.update({ openid }, { $set }).exec()
  },

  // Openid 更新用户信息
  updateByid(userid, $set) {
    return User.update({ userid }, { $set }).exec()
  },

  // openid 登录
  loginByOpenid(openid) {
    let set = {
      loginAt: Date.now() //登录时间
    }
    return User.update({ openid }, { $set: set }).exec()
  },

  // openid 获取用户信息
  getUserByOpenid(openid) {
    return User.findOne({ openid }, { openid: 0, _id: 0 }).exec()
  },

  // id 获取用户信息
  getUserById(userid) {
    return User.findOne({ userid }, { openid: 0, _id: 0 }).exec()
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
        country: 1
      }
    ).exec()
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
