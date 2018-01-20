const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')
const PostModel = require('../models/posts')
const UserModel = require('../models/users')

const { to, removeProperty } = require('../lib/util')

// POST /comments 创建一条留言
router.post('/', checkLogin, async (req, res, next) => {
  try {
    let err, data
    const { content, userid, targid, type = 'post' } = req.fields
    let vistid

    if (!content) throw new Error('无内容')
    if (!targid) throw new Error('无对象')

    if (type === 'post') {
      ;[err, data] = await to(PostModel.getPostById(targid))
      if (err) throw new Error(err)
      if (!data) throw new Error('没有此文章')
      vistid = data.userid
    } else if (type === 'user') {
      vistid = targid
      if (userid === targid) throw new Error('不能给自己留言')
      ;[err, data] = await to(UserModel.getUserById(vistid))
      if (err) throw new Error(err)
      if (!data) throw new Error('没有此用户')
    }

    let comment = {
      userid,
      vistid,
      targid,
      type,
      content
    }
    removeProperty(comment)
    ;[err, data] = await to(CommentModel.create(comment))
    if (err) throw new Error(err)

    return res.retData('发表成功')
  } catch (e) {
    return res.retErr(e.message)
  }
})

module.exports = router
