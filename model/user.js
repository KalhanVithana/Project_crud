const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let  UserSchema = new Schema({
  fname: {
    type: String
  },
  lname: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  cfmpassword: {
    type: String
  },
  resetToken: {
    type: String
  },
  expireToken: {
    type: Date
  },
  verifycode: {
    type: String
  },
  verified: {
    type:Boolean,
    default:0
  }
  
  
  

}, {
    collection: 'User'
  })

module.exports = mongoose.model('User', UserSchema)