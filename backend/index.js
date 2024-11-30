const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const { isLoggedIn } = require('./src/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: 'secretKey',
    resave: true,
    saveUninitialized: true,
    httpOnly: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    },
  })
);

// MongoDB connection
const mongoURL = process.env.MONGO_URI;
mongoose
  .connect(mongoURL)
  .then(() => {
    console.log('Connected to MongoDB');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    }
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Backend Server is Running!');
});

// Import Routes
require('./src/auth')(app); // No middleware for /register and /login
require('./src/profile')(app);
require('./src/article')(app);
require('./src/following')(app);

// Apply middleware only to specific routes
app.use('/profile', isLoggedIn);
app.use('/article', isLoggedIn);
app.use('/following', isLoggedIn);

// Uncomment the following lines if you need the Cloudinary setup
// const upCloud = require('./src/uploadCloudinary');
// upCloud.setup(app);

// Export for testing
module.exports = app;
