var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  facebookId: String,
  facebookUsername: String,
  firstName: String,
  lastName: String,
  verificationNumber: Number,
  verified: Boolean,
  phoneNumber: String,
  friendsToKIT: [],
});
 
exports.userSchema = userSchema;
exports.User = mongoose.model('User', userSchema);



