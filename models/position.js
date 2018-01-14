const marked = require('marked')
const Position = require('../lib/mongo').Position

var disneyMap = { $box: [[121.658817, 31.157689], [121.6867, 31.141526]] }

module.exports = {
  // 插入位置信息
  create(post) {
    return Position.create(post).exec()
  },

  // 查找用户位置
  getPositionById(id) {
    return Position.find({ openId: id }).exec()
  },

  //查找在迪士尼乐园的用户
  getPositionIndisney(pos) {
    return Position.find({
      coordinates: { $geoWithin: disneyMap }
    })
  },
  //查找全部
  getPosition(pos) {
    return Position.find().addCreatedAt()
  }
}
