const User = require('./models/User');

// Get following list
const getFollowing = async (req, res) => {
  const username = req.params.user || req.user.username;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send({ username, following: user.following });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Add a user to following list
const addFollowing = async (req, res) => {
  const username = req.user.username;
  const followUsername = req.params.user;

  try {
    const user = await User.findOne({ username });
    const followUser = await User.findOne({ username: followUsername });

    if (!user || !followUser) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (!user.following.includes(followUsername)) {
      user.following.push(followUsername);
      await user.save();
    }

    res.send({ username, following: user.following });
  } catch (error) {
    console.error('Error adding following:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Remove a user from following list
const removeFollowing = async (req, res) => {
  const username = req.user.username;
  const unfollowUsername = req.params.user;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: 'User not found' });

    user.following = user.following.filter((f) => f !== unfollowUsername);
    await user.save();

    res.send({ username, following: user.following });
  } catch (error) {
    console.error('Error removing following:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Export routes
module.exports = (app) => {
  app.get('/following/:user?', getFollowing);
  app.put('/following/:user', addFollowing);
  app.delete('/following/:user', removeFollowing);
};
