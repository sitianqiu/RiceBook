const Profile = require('./models/Profile');
const { isLoggedIn } = require('./auth');
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Helper function to retrieve a specific field dynamically
const getField = async (req, res, field) => {
  const username = req.params.user || req.user.username;
  try {
    const user = await Profile.findOne({ username });
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send({ username, [field]: user[field] });
  } catch (error) {
    console.error(`Error fetching ${field}:`, error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Helper function to update a specific field dynamically
const updateField = async (req, res, field) => {
  const username = req.user.username;
  const value = req.body[field];

  if (!value) return res.status(400).send({ error: `${field} is required` });

  try {
    const user = await Profile.findOneAndUpdate({ username }, { [field]: value }, { new: true });
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send({ username, [field]: user[field] });
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Dynamic endpoints for profile
const getProfile = async (req, res) => {
  const username = req.params.user || req.user.username;
  console.log(`Fetching profile for user: ${username}`);
  try {
    const user = await Profile.findOne({ username });
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  const username = req.user.username;
  const updates = req.body;

  try {
    const user = await Profile.findOneAndUpdate({ username }, updates, { new: true });
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Headline endpoints
const getHeadline = async (req, res) => {
  const username = req.params.user || req.user.username;
  try {
    const user = await Profile.findOne({ username });
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send({ username, headline: user.headline });
  } catch (error) {
    console.error('Error fetching headline:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

const updateHeadline = async (req, res) => {
    const username = req.params.user || req.user?.username || req.body.username;
    const { headline } = req.body;
  
    if (!headline) return res.status(400).send({ error: 'Headline is required' });
  
    try {
      const user = await Profile.findOneAndUpdate({ username }, { headline }, { new: true });
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      res.send({ username, headline: user.headline });
    } catch (error) {
      console.error('Error updating headline:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
};

// Password update endpoint
const updatePassword = async (req, res) => {
  const username = req.user.username; // Assuming `req.user` is populated by middleware
  const { password } = req.body;

  if (!password) {
    return res.status(400).send({ error: 'Password is required' });
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the new password

    const user = await User.findOneAndUpdate(
      { username },
      { password: hashedPassword, salt },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.send({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

  
// Export routes
module.exports = (app) => {
  // Dynamic endpoints
  app.get('/profile/:user?', isLoggedIn, getProfile);
  app.put('/profile', isLoggedIn, updateProfile);

  app.get('/headline/:user?', isLoggedIn, (req, res) => getField(req, res, 'headline'));
  app.put('/headline', isLoggedIn, (req, res) => updateField(req, res, 'headline'));

  app.get('/email/:user?', isLoggedIn, (req, res) => getField(req, res, 'email'));
  app.put('/email', isLoggedIn, (req, res) => updateField(req, res, 'email'));

  app.get('/zipcode/:user?', isLoggedIn, (req, res) => getField(req, res, 'zipcode'));
  app.put('/zipcode', isLoggedIn, (req, res) => updateField(req, res, 'zipcode'));

  app.get('/avatar/:user?', isLoggedIn, (req, res) => getField(req, res, 'avatar'));
  app.put('/avatar', isLoggedIn, (req, res) => updateField(req, res, 'avatar'));

  app.get('/phone/:user?', isLoggedIn, (req, res) => getField(req, res, 'phone'));
  app.put('/phone', isLoggedIn, (req, res) => updateField(req, res, 'phone'));

  app.get('/dob/:user?', isLoggedIn, (req, res) => getField(req, res, 'dob'));

  app.put('/password', isLoggedIn, updatePassword);

  // app.get('/headline/:user?', isLoggedIn, getHeadline);
  // app.put('/headline', isLoggedIn, updateHeadline);
};
