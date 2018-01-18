const express = require('express')
const router = express.Router()
const ParkModel = require('../models/park')
const UserModel = require('../models/users')
const park_arr = require('../lib/park_arr')
const qiniu = require('qiniu')
const config = require('config-lite')(__dirname)
router.get('/', (req, res, next) => {
  let { data } = park_arr
  res.retData(data)
})

// 获取在线用户
router.get('/online', async (req, res, next) => {
  let data = await UserModel.getOnline()
  res.retData(data)
})


// 上传图片
router.get('/upload_token', (req, res, next) => {
  var accessKey = config.qiniu_ak
  var secretKey = config.qiniu_sk

  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

  var options = {
    scope: config.qiniu_bucket
  }

  var putPolicy = new qiniu.rs.PutPolicy(options)
  var uploadToken = putPolicy.uploadToken(mac)

  res.retData(uploadToken)
})


module.exports = router
