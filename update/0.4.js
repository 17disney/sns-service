const Post = require('../lib/mongo').Post
const User = require('../lib/mongo').User
ObjectId = require('mongodb').ObjectID
const { to, createSession, removeProperty, md5 } = require('../lib/util')

var updatePosts = async () => {
  let posts = await Post.find()
    .limit(100)
    .exec()

  posts.forEach(element => {
    let { _id, openid } = element
    if (openid) {
      let $set = {
        userid: md5(openid)
      }
      Post.update({ _id: ObjectId(_id) }, { $set }, { upsert: true }).exec()
    }
  })
  console.log('post pk')
}

var updateUsers = async () => {
  let users = await User.find()
    .limit(100)
    .exec()

  users.forEach(element => {
    let { _id, openid } = element
    if (openid) {
      let $set = {
        userid: md5(openid)
      }
      User.update({ _id: ObjectId(_id) }, { $set }, { upsert: true }).exec()
    }
  })
  console.log('user pk')
}

updatePosts()
updateUsers()
