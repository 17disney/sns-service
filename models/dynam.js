const Dynam = require('../lib/mongo').Dynam
const ObjectId = require('mongodb').ObjectID
const moment = require('moment')
const date = moment().format('YYYYMMDD')
const { removeProperty } = require('../lib/util')
module.exports = {
  /*
   type: 对象类型
   op: 操作类型
  */
  vist(user, vistid, type, op, targid) {
    let { userid, nickName, avatarFile } = user
    let data = {
      type,
      op,
      userid,
      vistid,
      targid,
      nickName,
      avatarFile,
      date,
      notice: true,
      display: true
    }
    removeProperty(data)
    return Dynam.create(data).exec()
  },

  // 删除重复
  reVist(user, vistid, type, op, targid) {
    let { userid } = user
    let find = {
      type,
      op,
      userid,
      vistid,
      targid,
      display: true
    }
    // 删除当天重复访问
    if (op === 'pv') {
      find.date = date
    }
    removeProperty(find)

    let $set = {
      notice: false,
      display: false
    }

    return Dynam.update(find, { $set }, false, true).exec()
  },

  // 获取访问人数
  loadVist(vistid, type, op, targid) {
    let find = {
      type,
      op,
      vistid,
      targid,
      display: true
    }
    return Dynam.find(find, {
      display: 0,
      notice: 0,
      type: 0,
      vistid: 0,
      date: 0,
      op: 0,
      userid: 0,
      targid: 0
    })
      .addCreatedAt()
      .exec()
  },

  // 本人查看动态
  userRead(vistid) {
    let $set = {
      userid,
      vistid,
      notice: false
    }
    return Dynam.update({ vistid }, { $set }).exec()
  }
}
