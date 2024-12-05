const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User');
const Profile = require('./models/Profile');

const redirectURI = process.env.NODE_ENV === 'production'
  ? 'https://rbqserver-742880fd6875.herokuapp.com/auth/google/callback'
  : 'http://localhost:3000/auth/google/callback';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURI
);

const verifyGoogleToken = async (token) => {
try {
        console.log('Verifying Google token:', token); // Log the token for debugging
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '272365865460-cokd54de8n0rqehlapp0idhoseab6ic4.apps.googleusercontent.com',
        });
        return ticket.getPayload();
    } catch (error) {
        console.error('Error verifying Google token:', error);
        throw new Error('Invalid Google token');
    }
};

const googleAuth = async (req, res) => {
  console.log('Received request body:', req.body);
  const { token } = req.body;
  if (!token) {
    console.error('Google token is missing in the request body');
    return res.status(400).json({ error: 'Token is missing.' });
  }

  try {
    const profile = await verifyGoogleToken(token);
    const email = profile.email;

    if (!email) {
      return res.status(400).json({ error: 'Google account does not provide an email address.' });
    }

    let user = await User.findOne({ email });
    if (!user) {
        user = new User({
            username: profile.name,
            email,
            googleId: profile.sub,
          });          
      await user.save();

      const newProfile = new Profile({
        userId: user._id,
        username: profile.name,
        email,
        dob: null,
        phone: '',
        zipcode: '',
        headline: 'Hello World!',
        avatar: '/profile.jpeg',
      });
        try {
            await newProfile.save();
            console.log('Profile saved successfully:', newProfile);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      await user.save();
    }

    req.session.user = { username: user.username };
    req.session.save((err) => {
      if (err) return res.status(500).json({ error: 'Failed to save session' });
      res.status(200).json({ message: 'Google login successful', user });
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Google token' });
  }
};

module.exports = (app) => {
  app.post('/google', googleAuth);
};
