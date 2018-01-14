const express = require('express')
const moment = require('moment')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const UserModel = require('../models/users')

// 获取列表
router.get('/', async (req, res, next) => {
  let { limit = 10, page = 0, type = '' } = req.query
  let data = await PostModel.getPosts(limit, page, type)
  res.retData(data)
})

// POST 发表一篇文章
router.post('/', checkLogin, async (req, res, next) => {
  let {
    content,
    images = [],
    task = {},
    at = '',
    type = 'travel',
    coordinates = [],
    pos_name = '',
    openid
  } = req.fields

  // 校验参数
  try {
    if (!content) {
      throw new Error('无content')
    }
    if (!openid) {
      throw new Error('无openid')
    }
  } catch (e) {
    res.retErr(e.message)
  }

  // 获取用户资料
  let userinfo = await UserModel.getUserByOpenid(openid)
  let { nickName, avatarFile, city, gender, country } = userinfo

  // 获取用户发帖
  let uPost = await PostModel.getPostByOpenid(openid)

  if (uPost.length > 0) {
    let { created_at } = uPost[0]
    // 防灌水
    let diff = -moment(created_at).diff(moment())
    if (diff <= 10000) {
      res.retErr('歇一歇哦，发帖过快~')
      return
    }
  }

  let post = {
    type,
    content,
    images,
    task,
    at,
    coordinates,
    pos_name,
    pv: 0,
    nickName,
    avatarFile,
    city,
    gender,
    country,
    openid
  }

  PostModel.create(post)
    .then(result => {
      res.retData('发布成功！')
    })
    .catch(next)
})

// GET 获取文章详情
router.get('/:postId', async (req, res, next) => {
  const { postId } = req.params
  Promise.all([
    PostModel.getPostById(postId), // 获取文章信息
    // CommentModel.getComments(postId), // 获取该文章所有留言
    PostModel.incPv(postId) // pv 加 1
  ])
    .then(function(post) {
      // const comments = result[1]
      if (!post) {
        res.retErr('该文章不存在')
      }

      let data = post
      res.retData({
        data
      })
    })
    .catch(next)
})

// PUT 更新一篇文章
router.put('/:postId', checkLogin, function(req, res, next) {
  const {
    openid,
    content,
    images = [],
    coordinates = [],
    pos_name = '',
    at = '',
    task = {}
  } = req.fields
  const postId = req.params.postId

  // 校验参数
  try {
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.retErr(e.message)
    return
  }

  PostModel.getRawPostById(postId).then(function(post) {
    if (!post) {
      return res.retErr('文章不存在')
    }
    if (post.openid !== openid) {
      return res.retErr('没有权限')
    }

    PostModel.updatePostById(postId, {
      content,
      images,
      at,
      task,
      coordinates,
      pos_name
    })
      .then(function() {
        return res.retData('success', '编辑成功')
      })
      .catch(next)
  })
})

// DELETE 删除一篇文章
router.delete('/:postId', checkLogin, function(req, res, next) {
  const { openid } = req.fields
  const postId = req.params.postId
  PostModel.getRawPostById(postId).then(function(post) {
    if (!post) {
      return res.retErr('文章不存在')
    }
    if (post.openid !== openid) {
      return res.retErr('没有权限')
    }
    PostModel.delPostById(postId)
      .then(function() {
        return res.retData('success', '删除成功')
      })
      .catch(next)
  })
})

module.exports = router
