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

app.set('trust proxy', 1);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
    origin: 'https://rbtrista.surge.sh',
    credentials: true,
};

app.use(cors(corsOptions));
// Session Configuration
app.use(
  session({
    secret: 'secretKey',
    resave: true, // Do not save the session if it is not modified
    saveUninitialized: false, // Do not save uninitialized sessions
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      secure: true, // Use true only in production
      sameSite: 'none',
      maxAge: 1000 * 60 * 60, // 1 hour
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
require('./src/auth')(app);
require('./src/profile')(app);
require('./src/article')(app);
require('./src/following')(app);
require('./src/googleAuth')(app);

// // Apply middleware only to specific routes
// app.use('/profile', isLoggedIn);
// app.use('/article', isLoggedIn);
// app.use('/following', isLoggedIn);

// Export for testing
module.exports = app;
