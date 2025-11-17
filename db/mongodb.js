const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Using Mongoose ODM for MongoDB
 */

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/homeconnect';

/**
 * Connect to MongoDB
 */
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('[MongoDB] Connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
    throw err;
  }
};

/**
 * Close MongoDB connection
 */
const closeMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed');
  } catch (err) {
    console.error('[MongoDB] Error closing connection:', err);
  }
};

module.exports = {
  connectMongoDB,
  closeMongoDB
};
