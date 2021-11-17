const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let  resetpassword = new Schema({
  
  email: {
    type: String
  },
  resetToken: {
    type: String
  },
  expireToken: {
    type: Date
  }
  

}, {
    collection: 'reset'
  })

module.exports = mongoose.model('reset', resetpassword)