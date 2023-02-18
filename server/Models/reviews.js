const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReviewSchema = new Schema({
  review_id: Number,
  rating: Number,
  summary: String,
  body: String,
  date: Number,
  recommend: Boolean,
  photos: [String],
  helpfulness: Number,
  response: String,
  reviewer_name: String,
  reviewer_email: String,
  reported: Boolean,
});

const MetaSchema = new Schema({
  product_id: String,
  ratings: [String],
  recommended: [String],
  characteristics: [String],
});

const ProductSchema = new Schema({
  id: Number,
  reviews: [ReviewSchema],
  meta: [MetaSchema],
});

module.exports = { ReviewsProductModel: mongoose.model('Product', ProductSchema), MetaModel: mongoose.model('Meta', MetaSchema), ReviewsModel: mongoose.model('Reviews', ReviewSchema) };
