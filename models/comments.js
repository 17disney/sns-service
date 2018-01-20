const Comment = require('../lib/mongo').Comment
const ObjectId = require('mongodb').ObjectID

module.exports = {
  // 创建一个留言
  create(data) {
    data.notice = true
    return Comment.create(data).exec()
  },

  delCommentById(id) {
    return Comment.remove({ _id: ObjectId(id) }).exec()
  },

  // 获取对象下的所有留言
  getComments(targid) {
    return Comment.find({ targid })
      // .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec()
  }
}
