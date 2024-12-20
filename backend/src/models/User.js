const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      index: true,
      unique: true,
      required: [true, 'Username is required']
    },
    email: {type: String},
    following: {
      type: [String], 
      default: [],
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    passwordLength: { type: Number },
    avatar: {
      type: String,
      default: '/profile.jpeg',
    },
    created: {
      type: Date,
      required: [true, 'Created date is required'],
      default: Date.now,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, 
    },
  });
  

const User = mongoose.model('User', userSchema);
module.exports = User;
