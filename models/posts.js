const Post = require('../lib/mongo').Post
ObjectId = require('mongodb').ObjectID
const { removeProperty } = require('../lib/util')
module.exports = {
  // 创建一篇文章
  create(post) {
    post.pv = 0
    post.like = 0
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
    if (find) {
      try {
        find = JSON.parse(find)
      } catch (e) {
        res.retErr('搜索格式错误')
      }
      let { type, userid, eit } = find

      find = {
        type,
        userid
      }
      if (eit) {
        find.eit = { $in: eit }
      }
      removeProperty(find)
    } else {
      find = {}
    }

    return Post.find(find)
      .skip(page * limit)
      .limit(limit)
      .sort({ _id: -1 })
      .addCreatedAt()
      .exec()
  },

  // 文章浏览量
  incPv(postid) {
    return Post.update({ _id: ObjectId(postid) }, { $inc: { pv: 1 } }).exec()
  },

  // 文章点赞
  incLike(postid, op) {
    return Post.update({ _id: ObjectId(postid) }, { $inc: { like: op } }).exec()
  },

  // id 更新文章
  updatePostById(postid, $set) {
    return Post.update({ _id: ObjectId(postid) }, { $set }).exec()
  },

  // id 删除文章
  delPostById(postid) {
    return Post.remove({ _id: ObjectId(postid) }).exec()
  }
}
