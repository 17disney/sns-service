const express = require('express')
const router = express.Router()
const ParkModel = require('../models/park')
const UserModel = require('../models/users')
const park_arr = require('../lib/park_arr')

router.get('/', (req, res, next) => {
  let { data } = park_arr

  res.retData(data)
})

// 获取在线用户
router.get('/online', async (req, res, next) => {
  let data = await UserModel.getOnline()
  res.retData(data)
})

module.exports = router
