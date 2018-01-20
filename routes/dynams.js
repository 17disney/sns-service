const express = require('express')
const moment = require('moment')
const router = express.Router()
const path = require('path')

const { checkLogin, getUserinfo } = require('../middlewares/check')
const PostModel = require('../models/posts')
const UserModel = require('../models/users')
const DynamModel = require('../models/dynams')

const fs = require('fs')
const { to, createSession, removeProperty } = require('../lib/util')

// 文章和用户点赞
router.post('/like', checkLogin, getUserinfo, async (req, res, next) => {
  try {
    let err, data, vistid
    const { targid, type } = req.fields
    if (!targid) throw new Error('没有指定对象id')
    if (!type) throw new Error('没有指定对象类型')

    const user = req.userinfo
    const { userid } = user

    let { op } = req.fields
    op = !!op

    if (type === 'post') {
      ;[err, data] = await to(PostModel.getPostById(targid))
      if (err || !data) throw new Error('没有此文章')
      vistid = data.userid // 获取文章作者
    }

    // 检查知否已点赞
    ;[err, data] = await to(DynamModel.checkLike(userid, vistid, type, targid))

    if (err) throw new Error(err)
    if (data && op) throw new Error('已点过赞')
    if (!data && !op) throw new Error('取消点赞成功')

    // 点赞
    if (op) {
      await DynamModel.create(user, vistid, type, 'like', targid)
      if (type === 'post') {
        await PostModel.incLike(vistid, 1)
      } else if (type === 'user') {
        await UserModel.incLike(vistid, 1)
      }
      return res.retData('点赞成功')
    } else {
      // 取消点赞
      await DynamModel.reDynam(user, vistid, type, 'like', targid)
      if (type === 'post') {
        await PostModel.incLike(vistid, -1)
      } else if (type === 'user') {
        await UserModel.incLike(vistid, -1)
      }
      return res.retData('取消点赞成功')
    }
  } catch (e) {
    return res.retErr(e.message)
  }
})

module.exports = router