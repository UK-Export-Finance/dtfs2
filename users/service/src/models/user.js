const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
  roles: [String],

});
mongoose.model('User', UserSchema);
