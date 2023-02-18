const mongoose = require('mongoose');

const { Schema } = mongoose;

const AnswerSchema = new Schema({
  id: Number,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
  photos: [String],
});

const QuestionSchema = new Schema({
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean,
  answers: [AnswerSchema],
});

const ProductSchema = new Schema({
  product_id: Number,
  results: [QuestionSchema],
});

// module.exports.
  // module.exports = mongoose.model('Product', ProductSchema);
module.exports = { QuestionModel: mongoose.model('Question', QuestionSchema), ProductModel: mongoose.model('Product', ProductSchema), AnswerModel: mongoose.model('Answer', AnswerSchema) };
