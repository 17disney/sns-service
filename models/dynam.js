const Dynam = require('../lib/mongo').Dynam
const ObjectId = require('mongodb').ObjectID
const moment = require('moment')
const date = moment().format('YYYYMMDD')

module.exports = {
  // 访问他人空间
  vist(user, vistid) {
    let { userid, nickName, avatarUrl } = user
    let data = {
      type: 'vist',
      nickName,
      avatarUrl,
      userid,
      vistid,
      date,
      notice: true,
      display: true
    }
    return Dynam.create(data).exec()
  },

  // 删除当天重复访问空间通知
  reVist(user, vistid) {
    let { userid } = user
    let find = {
      userid,
      vistid,
      date,
      notice: true
    }
    let $set = {
      notice: false,
      display: false
    }
    return Dynam.update(find, { $set }, false, true).exec()
  },

  // 查看空间访问人数
  loadVist(vistid) {
    let find = {
      type: 'vist',
      vistid,
      display: true
    }
    return Dynam.find(find, {
      display: 0,
      notice: 0,
      type: 0,
      vistid: 0,
    })
      .addCreatedAt()
      .exec()
  },

  // 已查看动态
  read(id) {
    let data = {
      userid,
      vistid,
      createAt: Date.now(),
      notice: true
    }
    return Dynam.update({ openid }, { $set }).exec()
  }
}
