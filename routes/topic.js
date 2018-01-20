const express = require('express')
const router = express.Router()
const park_arr = require('../lib/park_arr')

// 乐园信息
router.get('/park', (req, res, next) => {
  let { data } = park_arr
  return res.retData(data)
})

// 乐园信息
router.get('/:id', (req, res, next) => {
  let { data } = park_arr
  return res.retData(data)
})


module.exports = router
