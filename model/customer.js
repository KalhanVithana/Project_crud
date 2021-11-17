const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let  Customer = new Schema({
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
  userid:{
    type: String
  }
}, {
    collection: 'Customer'
  })

module.exports = mongoose.model('Customer', Customer)