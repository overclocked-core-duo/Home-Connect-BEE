const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  type: {
    type: String, 
    required: true,
    enum: ['house', 'flat', 'shop']
  },
  offerType: {
    type: String,
    required: true,
    enum: ['sale', 'rent', 'resale']
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['ready to move', 'under construction']
  },
  furnishingStatus: {
    type: String,
    required: true,
    enum: ['unfurnished', 'semi-furnished', 'furnished']
  },
  image: {
    type: String,
    default: 'house-img-1.jpg'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
// Example: Find properties by location and type
propertySchema.index({ location: 1, type: 1 });
// Example: Find properties by price range
propertySchema.index({ price: 1 });
// Example: Find properties by owner
propertySchema.index({ owner: 1 });

// To see query execution plan, use:
// Property.find({ location: 'New York' }).explain('executionStats')

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;