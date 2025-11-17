const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/mongodb/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/homeconnect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Read users from JSON file
const usersFilePath = path.join(__dirname, '../models/users.json');

fs.readFile(usersFilePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading users.json file:', err);
    process.exit(1);
  }

  try {
    const users = JSON.parse(data);
    
    // Drop existing users to avoid duplicates
    await User.collection.drop().catch(err => {
      // Ignore "namespace not found" error which occurs if the collection doesn't exist yet
      if (err.code !== 26) {
        throw err;
      }
    });
    
    console.log('Importing users...');
    
    // Add name and email attributes with default values
    const usersWithDefaults = users.map(user => ({
      ...user,
      name: user.name || user.username,
      email: user.email || `${user.username}@example.com`
    }));
    
    // Import users to MongoDB
    const result = await User.insertMany(usersWithDefaults);
    
    console.log(`Successfully imported ${result.length} users to MongoDB`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
});