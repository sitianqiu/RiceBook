const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User', // Refers to the `User` collection
    required: [true, 'UserId is required'],
  },
  username: {
    type: String,
    unique: true,
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  headline: {
    type: String,
    default: 'Hello World!',
  },
  dob: {
    type: String,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  zipcode: {
    type: String,
    required: [true, 'Zipcode is required'],
  },
  avatar: {
    type: String,
    default: '/profile.jpeg',
  },
});

const Profile = mongoose.model('profile', profileSchema);
module.exports = Profile;