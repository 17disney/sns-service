const express = require('express')
const router = express.Router()
const ParkModel = require('../models/park')
const UserModel = require('../models/users')

const qiniu = require('qiniu')
const config = require('config-lite')(__dirname)

// 获取七牛上传图片 Token
router.get('/upload_token', (req, res, next) => {
  let accessKey = config.qiniu_ak
  let secretKey = config.qiniu_sk

  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

  let options = {
    scope: config.qiniu_bucket
  }

  let putPolicy = new qiniu.rs.PutPolicy(options)
  let uploadToken = putPolicy.uploadToken(mac)
  return res.retData({uploadToken})
})

module.exports = router
