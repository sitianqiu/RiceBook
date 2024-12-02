const Article = require('./models/Article');
const { isLoggedIn } = require('./auth');
const { uploadImage } = require('./uploadCloudinary');
const mongoose = require('mongoose');


// Map article object for response
const mapArticle = (article) => ({
  id: article._id,
  author: article.author,
  title: article.title,
  body: article.body,
  image: article.image,
  date: article.created,
  comments: (article.comments || []).map((comment) => ({
    id: comment.id,
    text: comment.text,
    author: comment.author,
    date: comment.created,
  })),
});

// Dynamic: Get articles or a specific article by ID or username
const getArticles = async (req, res) => {
  try {
    const articleId = req.params.id;
    const { username } = req.user;
    const { offset = 0, limit = 10 } = req.query;
    console.log('Fetching articles for:', username);

    if (articleId) {
      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).send({ error: 'Invalid Article ID format' });
      }
      const article = await Article.findById(articleId);
      if (!article) return res.status(404).send({ error: 'Article not found' });

      return res.status(200).send({ articles: [mapArticle(article)] });
    }

    const articles = await Article.find({ author: username })
      .sort({ created: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    if (!articles || articles.length === 0) {
      return res.status(200).send({ articles: [] });
    }
    res.status(200).send({
      articles: articles.map(mapArticle),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Dynamic: Post a new article
const postArticle = async (req, res) => {
  const { title, body } = req.body;
  const username = req.user?.username || req.body.username;
  console.log('Request body:', req.body);
  console.log('Received file URL:', req.fileurl);
  console.log('Received file ID:', req.fileid);

  if (!username) {
    console.error('Username is missing');
    return res.status(400).send({ error: 'Username is required' });
  }

  if (!title || !body) {
    console.error('Title or body is missing');
    return res.status(400).send({ error: 'Title and body are required to create an article' });
  }

  try {
    console.log('Received file URL:', req.fileurl);
    const imageUrl = req.fileurl || null;
    const newArticle = new Article({ title, body, author: username, image: imageUrl, });
    await newArticle.save();
    console.log('Saved article:', newArticle);

    const articles = await Article.find({ author: username }).sort({ created: -1 });
    res.status(201).send({ articles: articles.map(mapArticle) });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};


// Dynamic: Update an article or add/update a comment
const putArticle = async (req, res) => {
  const { id: articleId } = req.params;
  const { title, body, text, commentId } = req.body;
  const username = req.user.username;

  if (!articleId || (!title && !body && !text)) {
    return res.status(400).send({ error: 'Article ID and at least one field (title, body, or text) are required' });
  }

  try {
    const article = await Article.findById(articleId);
    if (!article) return res.status(404).send({ error: 'Article not found' });

    if (commentId !== undefined) {
      if (commentId === -1) {
        article.comments.push({
          id: article.comments.length + 1,
          text,
          author: username,
        });
      } else {
        const comment = article.comments.find((c) => c.id === commentId);
        if (!comment) return res.status(404).send({ error: 'Comment not found' });

        comment.text = text;
      }
    } else {
      if (article.author !== username) {
        return res.status(403).send({ error: 'Permission denied to edit this article' });
      }

      if (title) article.title = title;
      if (body) article.body = body;
    }

    await article.save();
    res.send({ articles: [mapArticle(article)] });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Export routes
module.exports = (app) => {
  // Dynamic endpoints
  app.get('/article', isLoggedIn, getArticles);
  app.get('/articles/:id', isLoggedIn, getArticles); 
  app.post('/article', isLoggedIn, uploadImage('image'), postArticle);
  
  app.put('/articles/:id', isLoggedIn, putArticle);
};

module.exports.mapArticle = mapArticle;