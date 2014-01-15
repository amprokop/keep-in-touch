var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  firstName: String,
  verificationNumber: Number,
  verified: Boolean,
  lastName: String,
  phoneNumber: String,
  friendsToKIT: [],
});
 
exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema);
