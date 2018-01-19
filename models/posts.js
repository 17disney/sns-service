const Post = require('../lib/mongo').Post
ObjectId = require('mongodb').ObjectID

module.exports = {
  // 创建一篇文章
  create(post) {
    return Post.create(post).exec()
  },

  // 查找用户下的文章
  getPostByUserid(userid) {
    return Post.find({ userid })
      .addCreatedAt()
      .exec()
  },

  // id 获取文章
  getPostById(id) {
    return Post.findOne({ _id: ObjectId(id) })
      .addCreatedAt()
      .exec()
  },

  // 获取文章列表
  getPosts(limit, page, find) {
    return Post.find(find, { openid: 0 })
      .skip(page * limit)
      .limit(limit)
      .sort({ _id: -1 })
      .addCreatedAt()
      .exec()
  },

  // 文章浏览量
  incPv(postId) {
    return Post.update({ _id: ObjectId(postId) }, { $inc: { pv: 1 } }).exec()
  },

  // 文章点赞
  incZan(postId) {
    return Post.update({ _id: ObjectId(postId) }, { $inc: { zan: 1 } }).exec()
  },

  // id 更新文章
  updatePostById(postId, $set) {
    return Post.update({ _id: ObjectId(postId) }, { $set }).exec()
  },

  // id 删除文章
  delPostById(postId) {
    return Post.remove({ _id: ObjectId(postId) }).exec()
  }
}
