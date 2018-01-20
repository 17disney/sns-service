const express = require('express')
const router = express.Router()
const PositionModel = require('../models/position')
const UserModel = require('../models/users')
const checkLogin = require('../middlewares/check').checkLogin
const { to } = require('../lib/util')

// 提交用户坐标
router.post('/update', checkLogin, async (req, res, next) => {
  try {
    let err, data
    let { coordinates, userid } = req.fields
    if (!coordinates || coordinates.length !== 2) throw new Error('位置不正确')

    let pos = {
      coordinates,
      userid
    }
    // 插入轨迹
    ;[err] = await to(PositionModel.create(pos))
    if (err) throw new Error(err)
    ;[err, data] = await to(UserModel.getOnline())
    if (err) throw new Error(err)

    return res.retData(data)
  } catch (e) {
    return res.retErr(e.message)
  }
})

// 获取在线用户
router.get('/online', async (req, res, next) => {
  let data = await UserModel.getOnline()
  res.retData(data)
})

module.exports = router
