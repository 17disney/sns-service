const config = require('config-lite')(__dirname)
const fs = require('fs')
const express = require('express')
const router = express.Router()
const https = require('https')
const checkLogin = require('../middlewares/check').checkLogin
const UserModel = require('../models/users')
const SessionModel = require('../models/session')
const DynamModel = require('../models/dynams')

const request = require('request')
const { to, createSession, removeProperty, md5 } = require('../lib/util')
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
    let userid

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
      userid = data.userid
      ;[err] = await to(UserModel.loginByOpenid(openid))
      if (err) throw new Error(err)
    } else {
      // 读取传过来的用户资料
      user = req.fields
      // 保存用户头像
      let { avatarUrl } = user
      ;[err, data] = await to(saveAvatar(avatarUrl))
      if (err) throw new Error(err)
      let avatarFile = data

      // 创建新用户
      delete user.code
      userid = md5(openid)
      user.avatarFile = avatarFile
      user.openid = openid
      user.userid = userid
      ;[err] = await to(UserModel.create(user))
      if (err) throw new Error(err)
    }

    // 生成 session_key
    let key = createSession()
    let session = {
      userid,
      key
    }
    ;[err] = await to(SessionModel.set(session))
    if (err) throw new Error(err)

    user.session_key = key
    return res.retData(user)
  } catch (e) {
    return res.retErr(e.message)
  }
})

// GET 获取自己的资料
router.get('/info', checkLogin, async (req, res, next) => {
  let arr, data
  let { userid } = req.fields
  ;[err, data] = await to(UserModel.getUserById(userid))
  if (err) throw new Error(err)

  let vistList = await DynamModel.loadVist(userid, 'vist', 'pv')
  let likeList = await DynamModel.loadVist(userid, 'vist', 'like')
  data.vistList = vistList
  data.likeList = likeList

  return res.retData(data)
})

// GET 访问别人的资料
router.get('/vist', checkLogin, async (req, res, next) => {
  try {
    let arr, data
    const { userid } = req.fields
    const { id } = req.query
    if (!id) throw new Error('缺少查询条件')
    ;[err, data] = await to(UserModel.getUserById(id))

    if (err) throw new Error(err)
    if (!data) throw new Error('没有此用户')

    // 判断是否访问自己
    if (userid !== id) {
      let user = await UserModel.getUserById(userid)
      await UserModel.incPv(id)
      await DynamModel.reVist(user, id, 'vist', 'pv')
      await DynamModel.vist(user, id, 'vist', 'pv')
    }

    let vistList = await DynamModel.loadVist(id, 'vist', 'pv')
    let likeList = await DynamModel.loadVist(id, 'vist', 'like')
    data.vistList = vistList
    data.likeList = likeList
    return res.retData(data)
  } catch (e) {
    return res.retErr(e.message)
  }
})

// POST 点赞
router.post('/like', checkLogin, async (req, res, next) => {
  try {
    let err, data
    const { userid, id: vistid } = req.fields
    let { op } = req.fields
    op = !!op

    if (!vistid) {
      throw new Error('没有指定用户')
    }

    if (userid === vistid) {
      throw new Error('不能给自己点赞')
    }

    ;[err, data] = await to(UserModel.getUserById(userid))
    if (err) throw new Error(err)
    const user = data

    // 检查知否已点赞
    ;[err, data] = await to(DynamModel.checkLike(userid, vistid, 'vist'))
    if (err) throw new Error(err)
    if (data && op) throw new Error('已点过赞')
    if (!data && !op) throw new Error('取消点赞成功')

    if (op) {
      await DynamModel.vist(user, vistid, 'vist', 'like')
      await UserModel.incLike(vistid, 1)
      return res.retData('点赞成功')
    } else {
      await DynamModel.reVist(user, vistid, 'vist', 'like')
      await UserModel.incLike(vistid, -1)
      return res.retData('取消点赞成功')
    }
  } catch (e) {
    return res.retErr(e.message)
  }
})

// PUT 修改自己的资料
router.put('/info', checkLogin, async (req, res, next) => {
  let err
  let {
    nickName,
    province,
    country,
    gender,
    city,
    avatarUrl,
    showPos,
    seasonCard,
    openid
  } = req.fields

  let user = {
    nickName,
    province,
    country,
    gender,
    city,
    avatarUrl,
    showPos,
    seasonCard
  }

  removeProperty(user)
  ;[err, data] = await to(UserModel.updateByOpenid(openid, user))
  if (err) throw new Error(err)

  return res.retData('修改成功')
})

module.exports = router
