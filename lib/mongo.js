const config = require('config-lite')(__dirname)
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
mongolass.connect(config.mongodb)

exports.User = mongolass.model('User')
exports.User.index({ openid: 1 }, { unique: true }).exec()
exports.User.index({ userid: 1 }, { unique: true }).exec()
exports.User.index({ coordinates: '2d' }).exec()

const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function(results) {
    results.forEach(function(item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format(
        'YYYY-MM-DD HH:mm:ss'
      )
    })
    return results
  },
  afterFindOne: function(result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format(
        'YYYY-MM-DD HH:mm:ss'
      )
    }
    return result
  }
})

// 文章表
exports.Post = mongolass.model('Post')
exports.Post.index({ openid: 1, _id: -1 }).exec()
exports.Post.index({ id: 1 }).exec()

// 位置表
exports.Position = mongolass.model('Position')
exports.Position.index({ coordinates: '2d' }).exec()
exports.Position.index({ openid: 1 }).exec()

// 会话表
exports.Session = mongolass.model('Session')
exports.Session.index({ key: 1, _id: 1 }).exec()

// 乐园信息表
exports.Park = mongolass.model('Park')
exports.Park.index({ type: 1, id: 1, _id: 1 }).exec()
