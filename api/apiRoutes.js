const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../models/mongodb/User');
const Property = require('../models/mongodb/Property');
const { notifyNewProperty } = require('../websocket/socket');

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    
    if (user) {
      // Store user in session
      req.session.user = {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email
      };
      return res.redirect('/');
    } else {
      return res.redirect('/register');
    }
  } catch (err) {
    next(err);
  }
});

// Register route
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, name, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    
    // Create new user
    const newUser = new User({
      username,
      password,
      name,
      email
    });
    
    await newUser.save();
    
    // Store user in session
    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email
    };
    
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Property routes
// Add new property
router.post('/properties', async (req, res, next) => {
  try {
    const { 
      title, description, type, offerType, price, 
      location, bedrooms, bathrooms, area, 
      status, furnishingStatus, image 
    } = req.body;
    
    const newProperty = new Property({
      title,
      description,
      type,
      offerType,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      status,
      furnishingStatus,
      image: image || 'house-img-1.jpg', // Default image if not provided
      owner: req.session.user._id
    });
    
    await newProperty.save();
    
    // Notify all connected WebSocket clients about new property
    notifyNewProperty(newProperty);
    
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

// Update property
router.post('/properties/:id', async (req, res, next) => {
  try {
    const { 
      title, description, type, offerType, price, 
      location, bedrooms, bathrooms, area, 
      status, furnishingStatus, image 
    } = req.body;
    
    const property = await Property.findById(req.params.id);
    
    // Ensure user owns this property
    if (property.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('Not authorized');
    }
    
    // Update property
    property.title = title;
    property.description = description;
    property.type = type;
    property.offerType = offerType;
    property.price = price;
    property.location = location;
    property.bedrooms = bedrooms;
    property.bathrooms = bathrooms;
    property.area = area;
    property.status = status;
    property.furnishingStatus = furnishingStatus;
    if (image) property.image = image;
    
    await property.save();
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

// Delete property
router.post('/properties/delete/:id', async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Ensure user owns this property
    if (property.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('Not authorized');
    }
    
    await Property.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

// Search properties
router.post('/search', async (req, res, next) => {
  try {
    const { 
      location, offer, type, bhk,
      minimum, maximum, status, furnished 
    } = req.body;
    
    // Store search parameters in session for potential page refresh
    req.session.searchParams = req.body;
    
    // Build query object
    const query = {};
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (offer) query.offerType = offer; // Properly match 'offer' from form to 'offerType' in database
    if (type) query.type = type;
    if (bhk) query.bedrooms = parseInt(bhk);
    
    // Price range
    if (minimum || maximum) {
      query.price = {};
      if (minimum) query.price.$gte = parseInt(minimum);
      if (maximum) query.price.$lte = parseInt(maximum);
    }
    
    if (status) query.status = status;
    if (furnished) query.furnishingStatus = furnished;
    
    const properties = await Property.find(query).populate('owner');
    
    // Filter the sensitive owner information
    const filteredProperties = properties.map(prop => {
      const { _id, title, description, type, offerType, price, location, 
              bedrooms, bathrooms, area, status, furnishingStatus, 
              image, createdAt } = prop;
      
      return {
        _id, title, description, type, offerType, price, location,
        bedrooms, bathrooms, area, status, furnishingStatus,
        image, createdAt,
        owner: {
          username: prop.owner.username,
          name: prop.owner.name
        }
      };
    });
    
    res.render('search', { 
      properties: filteredProperties, 
      filters: req.body,
      searchPerformed: true
    });
  } catch (err) {
    console.error('Search error:', err);
    res.render('search', { 
      properties: [],
      filters: req.body,
      searchPerformed: true,
      error: 'An error occurred while searching. Please try again.'
    });
  }
});

// Add a GET route for search to handle page refreshes
router.get('/search', async (req, res, next) => {
  try {
    // If we have stored search parameters, use them
    const searchParams = req.session.searchParams || {};
    const { 
      location, offer, type, bhk,
      minimum, maximum, status, furnished 
    } = searchParams;
    
    // Build query object - similar to POST handler
    const query = {};
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (offer) query.offerType = offer;
    if (type) query.type = type;
    if (bhk) query.bedrooms = parseInt(bhk);
    
    if (minimum || maximum) {
      query.price = {};
      if (minimum) query.price.$gte = parseInt(minimum);
      if (maximum) query.price.$lte = parseInt(maximum);
    }
    
    if (status) query.status = status;
    if (furnished) query.furnishingStatus = furnished;
    
    // If no search has been performed yet, show all properties (limited to 10)
    let properties = [];
    if (Object.keys(query).length > 0) {
      properties = await Property.find(query).populate('owner').limit(20);
    } else {
      properties = await Property.find().populate('owner').limit(10);
    }
    
    // Filter sensitive owner information
    const filteredProperties = properties.map(prop => {
      const { _id, title, description, type, offerType, price, location, 
              bedrooms, bathrooms, area, status, furnishingStatus, 
              image, createdAt } = prop;
      
      return {
        _id, title, description, type, offerType, price, location,
        bedrooms, bathrooms, area, status, furnishingStatus,
        image, createdAt,
        owner: {
          username: prop.owner.username,
          name: prop.owner.name
        }
      };
    });
    
    res.render('search', { 
      properties: filteredProperties, 
      filters: searchParams,
      searchPerformed: Object.keys(query).length > 0
    });
  } catch (err) {
    console.error('Search page error:', err);
    res.render('search', { 
      properties: [],
      filters: {},
      searchPerformed: false,
      error: 'An error occurred while loading properties. Please try again.'
    });
  }
});

// Add a route for clearing filters
router.get('/clear-filters', (req, res) => {
  // Clear search parameters from session
  req.session.searchParams = {};
  // Redirect to search page
  res.redirect('/api/search');
});

// Get all properties for listings page
router.get('/properties', async (req, res, next) => {
  try {
    const properties = await Property.find().populate('owner');
    
    // Filter the sensitive owner information
    const filteredProperties = properties.map(prop => {
      const { _id, title, description, type, offerType, price, location, 
              bedrooms, bathrooms, area, status, furnishingStatus, 
              image, createdAt } = prop;
      
      return {
        _id, title, description, type, offerType, price, location,
        bedrooms, bathrooms, area, status, furnishingStatus,
        image, createdAt,
        owner: {
          username: prop.owner.username,
          name: prop.owner.name
        }
      };
    });
    
    res.json(filteredProperties);
  } catch (err) {
    next(err);
  }
});

// Export the router
module.exports = router;