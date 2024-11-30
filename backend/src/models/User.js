const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      index: true,
      unique: true,
      required: [true, 'Username is required'],
    },
    email: {type: String},
    following: {
      type: [
        {
          type: String,
          ref: 'User',
        },
      ],
      default: [],
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    avatar: {
      type: String,
      default: '/profile.jpeg',
    },
    created: {
      type: Date,
      required: [true, 'Created date is required'],
      default: Date.now,
    },
  });
  

const User = mongoose.model('User', userSchema);
module.exports = User;
