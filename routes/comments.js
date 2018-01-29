const express = require('express')
const router = express.Router()

const { checkLogin, getUserinfo } = require('../middlewares/check')
const CommentModel = require('../models/comments')
const PostModel = require('../models/posts')
const UserModel = require('../models/users')

const { to, removeProperty } = require('../lib/util')

// POST /comments 创建一条留言
router.post('/', checkLogin, getUserinfo, async (req, res, next) => {
  try {
    let err, data
    const { content, userid, targid, type = 'post' } = req.fields
    const { nickName, avatarFile, postAt } = req.userinfo
    let vistid

    let diff = Date.now() - postAt
    if (diff <= 10000) {
      throw new Error('歇一歇哦，发帖过快~')
    }

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
      content,
      nickName,
      avatarFile
    }
    removeProperty(comment)
    ;[err, data] = await to(CommentModel.create(comment))
    if (err) throw new Error(err)

    // 更新用户发帖时间
    user = {
      postAt: Date.now()
    }
    await UserModel.updateByid(userid, user)

    return res.retMsg('发布成功')
  } catch (e) {
    return res.retErr(e.message)
  }
})

// 查找留言
router.get('/', async (req, res, next) => {
  try {
    let err, data
    let { limit = 20, page = 0, targid } = req.query
    if (!targid) throw new Error('无目标id')

    limit = parseInt(limit)
    page = parseInt(page)

    if (isNaN(limit) || isNaN(page)) {
      throw new Error('分页参数不正确')
    }
    ;[err, data] = await to(CommentModel.getComments(targid, limit, page))
    if (err) throw new Error(err)

    return res.retData(data)
  } catch (e) {
    return res.retErr(e.message)
  }
})

// 以读所有留言
router.put('/clear', checkLogin, async (req, res, next) => {
  try {
    const { userid } = req.fields
    await CommentModel.clearCommentsByUserid(userid)

    return res.retMsg('ok')
  } catch (e) {
    return res.retErr(e.message)
  }
})

// DELETE 删除评论
router.delete('/', checkLogin, async (req, res, next) => {
  try {
    let err, data
    const { userid } = req.fields
    const id = req.fields.id
    ;[err, data] = await to(CommentModel.getCommentById(id))
    if (err) return res.retErr(err)
    if (!data) res.retErr('评论不存在')

    if (userid !== data.userid) {
      return res.retErr('没有权限')
    }
    await CommentModel.delCommentById(id)
    return res.retMsg('删除成功')
  } catch (e) {
    return res.retErr(e.message)
  }
})

module.exports = router
