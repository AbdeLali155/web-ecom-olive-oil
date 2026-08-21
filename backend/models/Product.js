const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  priceDisplay: { type: String },
  size: { type: String },
  description: { type: String },
  image: { type: String },
  images: [String],
  inStock: { type: Boolean, default: true },
  features: [String],
  nutritionFacts: {
    calories: String,
    fat: String,
    saturatedFat: String,
    vitaminE: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
