const Profile = require('./models/Profile');
const { isLoggedIn } = require('./auth');

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

// Stubbed responses
const stubbedResponses = {
  password: { username: 'dummyUser', result: 'success' },
  email: { username: 'dummyUser', email: 'dummy@example.com' },
  zipcode: { username: 'dummyUser', zipcode: '12345' },
  avatar: { username: 'dummyUser', avatar: 'https://dummyimage.com/150' },
  phone: { username: 'dummyUser', phone: '123-456-7890' },
  dob: { username: 'dummyUser', dob: '1990-01-01' },
};

// Stubbed endpoints
const stubUpdatePassword = (req, res) => {
  res.send(stubbedResponses.password);
};

const stubGetEmail = (req, res) => {
  res.send(stubbedResponses.email);
};

const stubUpdateEmail = (req, res) => {
  res.send(stubbedResponses.email);
};

const stubGetZipcode = (req, res) => {
  res.send(stubbedResponses.zipcode);
};

const stubUpdateZipcode = (req, res) => {
  res.send(stubbedResponses.zipcode);
};

const stubGetAvatar = (req, res) => {
  res.send(stubbedResponses.avatar);
};

const stubUpdateAvatar = (req, res) => {
  res.send(stubbedResponses.avatar);
};

const stubGetPhone = (req, res) => {
  res.send(stubbedResponses.phone);
};

const stubUpdatePhone = (req, res) => {
  res.send(stubbedResponses.phone);
};

const stubGetDob = (req, res) => {
  res.send(stubbedResponses.dob);
};

// Dynamic endpoints for profile
const getProfile = async (req, res) => {
  const username = req.params.user || req.user.username;
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
  
// Export routes
module.exports = (app) => {
  // Dynamic endpoints
  app.get('/profile/:user?', isLoggedIn, getProfile);
  app.put('/profile', isLoggedIn, updateProfile);

  app.get('/headline/:user?', isLoggedIn, getHeadline);
  app.put('/headline', isLoggedIn, updateHeadline);

  // Stubbed endpoints
  app.put('/password', stubUpdatePassword);

  app.get('/email/:user?', stubGetEmail);
  app.put('/email', stubUpdateEmail);

  app.get('/zipcode/:user?', stubGetZipcode);
  app.put('/zipcode', stubUpdateZipcode);

  app.get('/avatar/:user?', stubGetAvatar);
  app.put('/avatar', stubUpdateAvatar);

  app.get('/phone/:user?', stubGetPhone);
  app.put('/phone', stubUpdatePhone);

  app.get('/dob/:user?', stubGetDob);
};
