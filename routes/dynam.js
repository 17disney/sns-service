const config = require('config-lite')(__dirname)
const fs = require('fs')
const express = require('express')
const router = express.Router()
const https = require('https')
const checkLogin = require('../middlewares/check').checkLogin
const UserModel = require('../models/users')
const PostModel = require('../models/posts')
const DynamModel = require('../models/dynam')

const request = require('request')
const { to, createSession, removeProperty, md5 } = require('../lib/util')

// POST 点赞
router.post('/zan', async (req, res, next) => {
  try {
  } catch (e) {
    return res.retErr(e.message)
  }
})
