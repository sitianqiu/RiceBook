const Article = require('./models/Article');
const { isLoggedIn } = require('./auth');

// Map article object for response
const mapArticle = (article) => ({
  id: article._id,
  author: article.author,
  text: article.text,
//   image: article.image,
  date: article.created,
  comments: article.comments,
});

// Dynamic: Get articles or a specific article by ID or username
const getArticles = async (req, res) => {
  try {
    const articleId = req.params.id;
    const { username } = req.user;
    const { offset = 0, limit = 10 } = req.query;


    if (articleId) {
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
  const { text } = req.body;
  const username = req.user?.username || req.body.username;

  if (!username) {
      console.error('Username is missing');
      return res.status(400).send({ error: 'Username is required' });
  }

  if (!text) {
      console.error('Text is missing');
      return res.status(400).send({ error: 'Text is required to create an article' });
  }

  try {
      const newArticle = new Article({ text, author: username });
      await newArticle.save();

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
  const { text, commentId } = req.body;
  const username = req.user.username;

  if (!articleId || !text) {
    return res.status(400).send({ error: 'Article ID and text are required' });
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

      article.text = text;
    }

    await article.save();
    res.send({ articles: [mapArticle(article)] });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

// Stubbed responses for testing
const stubbedArticles = [
  {
    id: 1,
    author: 'dummyUser',
    text: 'This is a stubbed article',
    // image: null,
    date: Date.now(),
    comments: [],
  },
];

// Stub: Get articles
const stubGetArticles = (req, res) => {
  res.send({
    articles: stubbedArticles,
  });
};

// Stub: Post a new article
const stubPostArticle = (req, res) => {
  const newArticle = {
    id: stubbedArticles.length + 1,
    author: 'dummyUser',
    text: 'This is another stubbed article',
    // image: 'https://dummyimage.com/600x400',
    date: Date.now(),
    comments: [],
  };
  stubbedArticles.push(newArticle);
  res.status(201).send({ articles: [newArticle] });
};

// Stub: Update an article or comment
const stubPutArticle = (req, res) => {
  const updatedArticle = {
    id: req.params.id || 1,
    author: 'dummyUser',
    text: 'Updated stubbed article text',
    // image: null,
    date: Date.now(),
    comments: [],
  };
  res.send({ articles: [updatedArticle] });
};


// Export routes
module.exports = (app) => {
  // Dynamic endpoints
  app.get('/article', isLoggedIn, getArticles);
  app.get('/articles/:id?', isLoggedIn, getArticles); 
  app.post('/article', isLoggedIn, postArticle); 
  
  app.put('/articles/:id', stubPutArticle);
};
