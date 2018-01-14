const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')
var http = require('http')
var https = require('https')
var fs = require('fs')
const app = express()

// 静态文件目录
app.use(express.static(path.join(__dirname, 'public')))

// 返回方法
app.use((req, res, next) => {
  res.retErr = (err, code = 400) => {
    res.json({ err, code })
  }
  res.retData = (data, code = 200) => {
    res.json({ data, code })
  }
  next()
})

// 路由
routes(app)

// 正常请求的日志
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: 'logs/success.log'
      })
    ]
  })
)

// 错误请求的日志
app.use(
  expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: 'logs/error.log'
      })
    ]
  })
)

//错误返回
app.use((err, req, res, next) => {
  res.retErr(err.message)
})

// 监听端口，启动程序
var key = fs.readFileSync('./cert/privatekey.pem', 'utf8')
var cert = fs.readFileSync('./cert/certificate.crt', 'utf8')
var credentials = { key, cert }

var httpsServer = https.createServer(credentials, app)
httpsServer.listen(443)

console.log('Disney-SNS')

