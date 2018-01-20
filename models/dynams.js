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
  create(user, vistid, type, op, targid) {
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
  reDynam(user, vistid, type, op, targid) {
    let { userid } = user
    let find = {
      type,
      op,
      userid,
      vistid,
      targid,
      display: true
    }
    // 如是浏览仅 删除当天重复访问
    if (op === 'pv') {
      find.date = date
    }
    removeProperty(find)

    let $set = {
      notice: false,
      display: false
    }
    if (op === 'like') {
      return Dynam.remove(find).exec()
    } else {
      return Dynam.update(find, { $set }, false, true).exec()
    }
  },

  // 检查是否已点赞
  checkLike(userid, vistid, type, targid) {
    let find = {
      type,
      userid,
      vistid,
      targid,
      op: 'like'
    }
    removeProperty(find)
    return Dynam.findOne(find).exec()
  },

  // 根据对象获取访问人数
  getDynamsByTargid(targid, type, op) {
    let find = {
      type,
      op,
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

  // 动态已读
  clearDynamsByUserid(vistid) {
    let $set = {
      notice: false
    }
    return Dynam.update({ vistid }, { $set }, { multi: true }).exec()
  },

  // 查看自己的动态
  getDynamsByUserid(vistid, notice) {
    let find = {
      vistid
    }
    // 查找已读
    if (notice) {
      find.notice = true
    }
    return Dynam.find(find).exec()
  }
}
