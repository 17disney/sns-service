const marked = require('marked')
const Post = require('../lib/mongo').Post
const User = require('../lib/mongo').User
const UserModel = require('./users')

ObjectId = require('mongodb').ObjectID

module.exports = {
  // 创建一篇文章
  create: function create(post) {
    return Post.create(post).exec()
  },

  getPostByOpenid: function getPostByOpenid(openid) {
    return Post.find({ openid }, { openid: 0 })
      .addCreatedAt()
      .exec()
  },

  // id 获取文章
  getPostById: function getPostById(postId) {
    return (
      Post.findOne({ _id: ObjectId(postId) }, { openid: 0 })
        // .populate({ path: 'openid', model: 'User' })
        .addCreatedAt()
        // .addCommentsCount()
        .exec()
    )
  },

  // 获取原生文章
  getRawPostById: function getRawPostById(postId) {
    return Post.findOne({ _id: ObjectId(postId) }).exec()
  },

  // 获取文章列表
  getPosts: function getPosts(limit, page) {
    limit = parseInt(limit)
    page = parseInt(page)
    return (
      Post.find()
        // .populate({ path: 'author', model: 'User' })
        .skip(page * limit)
        .limit(limit)
        .sort({ _id: -1 })
        .addCreatedAt()
        .exec()
    )
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post.update({ _id: ObjectId(postId) }, { $inc: { pv: 1 } }).exec()
  },

  // 通过文章 id 更新一篇文章
  updatePostById: function updatePostById(postId, data) {
    return Post.update({ _id: ObjectId(postId) }, { $set: data }).exec()
  },

  // 通过文章 id 删除一篇文章
  delPostById: function delPostById(postId) {
    return Post.remove({ _id: ObjectId(postId) }).exec()
  }
}
