const config = require('config-lite')(__dirname)
const fs = require('fs')
const express = require('express')
const router = express.Router()
const https = require('https')
const checkLogin = require('../middlewares/check').checkLogin
const UserModel = require('../models/users')
const PostModel = require('../models/posts')
const SessionModel = require('../models/session')

const crypto = require('crypto')
const request = require('request')
const md5 = crypto.createHash('md5')
const { to, createSession } = require('../lib/util')
const appid = config.appid
const secret = config.secret

// 保存头像
const saveAvatar = avatarUrl => {
  return new Promise((resolve, reject) => {
    let img_filename =
      Math.random()
        .toString(36)
        .substr(2) + '.jpg'
    let writeStream = request(avatarUrl).pipe(
      fs.createWriteStream('./public/avatar/' + img_filename)
    )
    writeStream.on('finish', () => {
      resolve(img_filename)
    })
  })
}

// 获取openid
const getOpenid = code => {
  return new Promise((resolve, reject) => {
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    https.get(url, res => {
      res.on('data', data => {
        data = JSON.parse(data)
        let { errcode, errmsg } = data
        if (errmsg) {
          reject(errmsg)
        } else {
          resolve(data)
        }
      })
    })
  })
}

// POST 用户登录
router.post('/login', async (req, res, next) => {
  try {
    let err, data
    let { code } = req.fields
    if (!code) throw new Error('无Code')
    ;[err, data] = await to(getOpenid(code))
    if (err) throw new Error(err)

    // 读取微信用户信息
    let { openid } = data
    ;[err, data] = await to(UserModel.getUserByOpenid(openid))
    if (err) throw new Error(err)

    let user = data
    // 已注册
    if (data) {
      ;[err] = await to(UserModel.loginByOpenid(openid))
      if (err) throw new Error(err)
    } else {
      user = req.fields
      let {avatarUrl} = user

      // 保存用户头像
      ;[err] = await to(saveAvatar(avatarUrl))
      if (err) throw new Error(err)

      // 创建新用户
      delete user.code
      user.openid = openid
      ;[err] = await to(UserModel.create(user))
      if (err) throw new Error(err)
    }

    // 生成 session_key
    let key = createSession()
    let session = {
      openid,
      key
    }
    ;[err] = await to(SessionModel.set(session))
    if (err) throw new Error(err)

    user.session_key = key
    return res.retData(user)

  } catch (e) {
    res.retErr(e.message)
  }
})

// 获取自己的文章
router.get('/posts', checkLogin, async (req, res, next) => {
  let { openid } = req.fields
  let posts = await PostModel.getPostByOpenid(openid)
  res.retData(posts)
})

// 获取自己的资料
router.get('/info', checkLogin, async (req, res, next) => {
  let { openid } = req.fields
  let posts = await UserModel.getUserByOpenid(openid)
  res.retData(posts)
})

// 修改自己的资料
router.post('/info', checkLogin, async (req, res, next) => {
  let {
    nickName,
    province,
    country,
    gender,
    city,
    avatarUrl,
    openid
  } = req.fields
  let posts = await UserModel.updateByOpenid(openid, {
    nickName,
    province,
    country,
    gender,
    city,
    avatarUrl
  })
  res.retData('修改成功')
})

module.exports = router
