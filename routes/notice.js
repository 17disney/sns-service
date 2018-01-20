const express = require('express')
const router = express.Router()
const { checkLogin, getUserinfo } = require('../middlewares/check')
const DynamModel = require('../models/dynams')
const { to } = require('../lib/util')


module.exports = router
