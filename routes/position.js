const express = require('express')
const router = express.Router()
const PositionModel = require('../models/position')
const UserModel = require('../models/users')
const checkLogin = require('../middlewares/check').checkLogin

// 提交用户坐标
router.post('/update', checkLogin, (req, res, next) => {
  let { coordinates, openid } = req.fields
  let post = {
    coordinates,
    openid
  }
  // 插入轨迹
  PositionModel.create(post)
    .then(result => {
      // 更新用户位置
      UserModel.updataUserPos(post)
      // 获取其他在线用户位置
      UserModel.getOnline()
        .then(result => {
          res.retData(result)
        })
        .catch(next)
    })
    .catch(next)
})

module.exports = router
