const Comment = require('../lib/mongo').Comment
const ObjectId = require('mongodb').ObjectID

module.exports = {
  // 创建一个留言
  create(data) {
    data.notice = true
    return Comment.create(data).exec()
  },

  // ID 获取留言
  getCommentById(id) {
    return Comment.findOne({ _id: ObjectId(id) }).exec()
  },

  // ID 删除留言
  delCommentById(id) {
    return Comment.remove({ _id: ObjectId(id) }).exec()
  },

  // 获取留言
  getComments(targid, limit, page) {
    return Comment.find({ targid }, { targid: 0, type: 0 })
      .skip(page * limit)
      .limit(limit)
      .sort({ _id: -1 })
      .addCreatedAt()
      .exec()
  },

  // 留言已读
  clearCommentsByUserid(vistid) {
    let $set = {
      notice: false
    }
    return Comment.update({ vistid }, { $set }, { multi: true }).exec()
  }

}
