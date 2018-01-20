const express = require('express')
const router = express.Router()

// 获取所有话题
router.get('/', (req, res, next) => {
  let { data } = park_arr
  return res.retData(data)
})

module.exports = router
