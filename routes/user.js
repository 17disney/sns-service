const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()
const https = require('https')

const checkLogin = require('../middlewares/check').checkLogin
const UserModel = require('../models/users')
const PostModel = require('../models/posts')
const SessionModel = require('../models/session')

var crypto = require('crypto')
var request = require('request')
var md5 = crypto.createHash('md5')

const config = require('config-lite')(__dirname)

const appid = config.appid
const secret = config.secret

function saveAvatar(user) {
  return new Promise((resolve, reject) => {
    let { avatarUrl, openid } = user
    let img_filename =
      Math.random()
        .toString(36)
        .substr(2) + '.jpg'
    let writeStream = request(avatarUrl).pipe(
      fs.createWriteStream('./public/avatar/' + img_filename)
    )

    writeStream.on('finish', function() {
      resolve(img_filename)
    })
  })
}

// 获取openid
var getOpenid = code => {
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

// 获取用户信息
var getUser = user => {
  let { openid } = user
  delete user.code
  return new Promise((resolve, reject) => {
    UserModel.getUserByOpenid(openid).then(result => {
      //创建新用户
      if (!result) {
        console.log('sd')
        saveAvatar(user).then(avatarFile => {
          user.avatarFile = avatarFile
          UserModel.create(user).then(result => {
            resolve(user)
          })
        })
      } else {
        UserModel.login(user).then(result => {
          resolve(user)
        })
      }
    })
  })
}

// POST 用户登录
router.post('/login', async (req, res, next) => {
  let user = req.fields

  let { code } = user
  let sData = {}
  if (!code) {
    throw new Error('无Code')
  }
  try {
    sData = await getOpenid(code)
  } catch (e) {
    throw new Error('code error')
  }
  let { openid, session_key } = sData

  // 创建/登录用户
  user.openid = openid
  let userInfo = await getUser(user)
  let key = await SessionModel.set(sData)

  delete userInfo.openid
  user.session_key = key

  res.retData(userInfo)
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

module.exports = router
