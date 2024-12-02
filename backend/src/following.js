const User = require('./models/User');
const Article = require('./models/Article');
const { isLoggedIn } = require('./auth');
const { mapArticle } = require('./article');

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


// Get articles for followed users and logined-in user
const getArticlesForFollowedUsers = async (req, res) => {
  console.log('Called getArticlesForFollowedUsers');
  const username = req.user.username;

  try {
    // Find the logged-in user's following list
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: 'User not found' });

    // Combine the logged-in user and followed users into one array
    const authors = [...user.following, username];
    console.log(`Fetching articles for authors: ${authors}`); 

    // Fetch articles written by these authors (author is a string, not an ObjectId)
    const articles = await Article.find({ author: { $in: authors } }).sort({ created: -1 });
    console.log(`Retrieved articles: ${JSON.stringify(articles, null, 2)}`); // Log retrieved articles

    // Fetch profiles of followed users
    const followedUsers = await User.find({ username: { $in: user.following } });
    console.log(`Followed users: ${JSON.stringify(followedUsers, null, 2)}`); // Log followed users

    // Prepare response with articles and followed user info
    res.send({ articles, followedUsers });
  } catch (error) {
    console.error('Error fetching articles and followed user info:', error);
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

      if (!user) {
          return res.status(404).send({ error: 'Logged-in user not found' });
      }
      console.log(`Following list for ${username}:`, user.following);
      if (!followUser) {
          return res.status(404).send({ error: `User '${followUsername}' does not exist` });
      }

      if (!user.following.includes(followUsername)) {
          user.following.push(followUsername);
          await user.save();
      }

      // Fetch updated articles
      const updatedAuthors = [...user.following, username]
      const updatedArticles = await Article.find({ author: { $in: updatedAuthors } }).sort({ created: -1 });

      res.send({ username, following: user.following, articles: updatedArticles.map(mapArticle) });
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

    // Remove the user from the following list
    user.following = user.following.filter((f) => f !== unfollowUsername);
    await user.save();

    // Fetch updated articles after removing the user
    const updatedAuthors = [...user.following, username];
    const updatedArticles = await Article.find({ author: { $in: updatedAuthors } }).sort({ created: -1 });


    res.send({ username, following: user.following, articles: updatedArticles.map(mapArticle) });
    console.log(`Response sent successfully for unfollow request.`);
  } catch (error) {
    console.error('Error removing following:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Export routes
module.exports = (app) => {
  app.get('/following/articles', isLoggedIn, getArticlesForFollowedUsers);
  app.get('/following/:user?', isLoggedIn, getFollowing);
  app.put('/following/:user', isLoggedIn, addFollowing);
  app.delete('/following/:user', isLoggedIn, removeFollowing);
};
