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
  product_id: String,
  results: [QuestionSchema],
});

module.exports = mongoose.model('Product', ProductSchema);
