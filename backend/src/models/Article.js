const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, 'author is required'],
  },
  text: {
    type: String,
    required: [true, 'text is required'],
  },
//   image: {
//     type: String,
//     default: null,
//   },
  comments: [
    {
      id: { type: Number, required: [true, 'id is required'] },
      text: { type: String, required: [true, 'text is required'] },
      author: { type: String, required: [true, 'author is required'] },
      created: { type: Date, default: Date.now },
    },
  ],
  created: { type: Date, required: true, default: Date.now },
});
articleSchema.path('comments').default(() => []);
const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
