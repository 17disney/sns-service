const Comment = require('../lib/mongo').Comment

module.exports = {
  // 创建一个留言
  create(comment) {
    return Comment.create(comment).exec()
  }
}
