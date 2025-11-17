require('dotenv').config();
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const apiRoutes = require('./api/apiRoutes');
const authRoutes = require('./routes/auth');
const dbTestRoutes = require('./routes/dbTest');
const notificationTestRoutes = require('./routes/notificationTest');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const jwtAuthMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');
const cacheMiddleware = require('./middlewares/cacheMiddleware');
const httpsRedirect = require('./middlewares/httpsRedirect');

// Import models
const Property = require('./models/mongodb/Property');
const User = require('./models/mongodb/User');

// Import database connections (optional - uncomment to use)
const { connectMongoDB } = require('./db/mongodb');
const { connectRedis } = require('./db/redis');
const { connectPostgres } = require('./db/postgres');
const { connectMariaDB } = require('./db/mariadb');

// Import WebSocket
const { initializeSocket, notifyNewProperty } = require('./websocket/socket');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const io = initializeSocket(server);

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Optional: HTTPS redirect (controlled by environment variable)
// app.use(httpsRedirect);

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/homeconnect';
mongoose.connect(MONGO_URL)
  .then(() => console.log('[MongoDB] Connected to MongoDB'))
  .catch(err => console.error('[MongoDB] Could not connect to MongoDB:', err));

// Optional: Initialize Redis for caching
// Uncomment when Redis is available
connectRedis().catch(err => console.warn('[Redis] Connection failed:', err));

// Optional: Initialize other databases
// connectPostgres().catch(err => console.error('[Postgres] Connection failed:', err));
// connectMariaDB().catch(err => console.error('[MariaDB] Connection failed:', err));
// connectInflux();
// connectNeo4j();

// Set up session with MongoDB store
const SESSION_SECRET = process.env.SESSION_SECRET || 'homeconnectsecret';
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: MONGO_URL,
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 } // 14 days in ms
}));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Custom logger middleware
app.use(logger);

// Health check endpoint (no authentication required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// JWT-based authentication routes (no session auth required)
app.use('/auth', authRoutes);

// Database test routes (no authentication required for testing)
app.use('/db', dbTestRoutes);

// Notification test routes (no authentication required for testing)
app.use('/api/test', notificationTestRoutes);

// Authentication middleware
const authMiddleware = (req, res, next) => {
  // Skip authentication for login and register routes
  if (req.path === '/login' || req.path === '/register' || 
      req.path === '/api/login' || req.path === '/api/register') {
    return next();
  }
  
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  // Make user data available to all views
  res.locals.user = req.session.user;
  next();
};

// Apply authentication middleware to all routes
app.use(authMiddleware);

// API routes (with optional caching for GET requests)
// Uncomment cacheMiddleware when Redis is configured
app.use('/api/properties', cacheMiddleware(60)); // Cache for 60 seconds
app.use('/api', apiRoutes);

// Images route - add this before the EJS routes
app.get('/images', (req, res) => {
  try {
    // Define path to image directory - assuming images are in public/images
    const imagesDir = path.join(__dirname, 'public', 'images');
    
    // Read directory contents
    fs.readdir(imagesDir, (err, files) => {
      if (err) {
        console.error('Error reading image directory:', err);
        return res.status(500).json({ error: 'Failed to read images' });
      }
      
      // Filter for image files (add more extensions if needed)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      });
      
      // Convert filenames to URLs
      const imageUrls = imageFiles.map(file => `/images/${file}`);
      
      // Return the list of image URLs
      res.json({ images: imageUrls });
    });
  } catch (error) {
    console.error('Error processing images request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// EJS routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/listings', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner');
    res.render('listings', { properties });
  } catch (err) {
    console.error(err);
    res.render('listings', { properties: [] });
  }
});

app.get('/login', (req, res) => {
  // If already logged in, redirect to home
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login');
});

app.get('/register', (req, res) => {
  // If already logged in, redirect to home
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register');
});

// Remove the basic /search route since it's now handled in the API routes
// The /api/search route will handle both GET and POST requests

app.get('/view-property/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner');
    if (!property) {
      return res.status(404).send('Property not found');
    }
    res.render('view_property', { property });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/dashboard', async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.session.user._id });
    res.render('dashboard', { properties });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Database viewer route
app.get('/db', async (req, res) => {
  try {
    const pg = require('./db/postgres');
    const maria = require('./db/mariadb');
    
    // Initialize data structure
    const data = {
      mongodb: { properties: [], users: [], error: null },
      postgres: { users: [], error: null },
      mariadb: { users: [], error: null }
    };
    
    const stats = {
      mongodb: { total: 0, connected: false },
      postgres: { total: 0, connected: false },
      mariadb: { total: 0, connected: false },
      redis: { total: 0, connected: false }
    };
    
    // Fetch MongoDB data
    try {
      if (mongoose.connection.readyState === 1) {
        stats.mongodb.connected = true;
        data.mongodb.properties = await Property.find().limit(100).lean();
        data.mongodb.users = await User.find().limit(100).lean();
        stats.mongodb.total = data.mongodb.properties.length + data.mongodb.users.length;
      }
    } catch (err) {
      data.mongodb.error = err.message;
    }
    
    // Fetch PostgreSQL data
    try {
      const pgResult = await pg.query('SELECT id, name, email, created_at FROM demo_users LIMIT 100');
      data.postgres.users = pgResult.rows;
      stats.postgres.total = data.postgres.users.length;
      stats.postgres.connected = true;
    } catch (err) {
      data.postgres.error = err.message;
    }
    
    // Fetch MariaDB data
    try {
      const mariaRows = await maria.query('SELECT id, name, email, created_at FROM demo_users LIMIT 100');
      data.mariadb.users = mariaRows;
      stats.mariadb.total = mariaRows.length;
      stats.mariadb.connected = true;
    } catch (err) {
      data.mariadb.error = err.message;
    }
    
    res.render('database', { data, stats });
  } catch (err) {
    console.error('Database viewer error:', err);
    res.status(500).send('Error loading database viewer');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Test route to verify caching
app.get('/api/test/cache', cacheMiddleware(30), async (req, res) => {
  // Simulate expensive operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  res.json({
    message: 'This response should be cached for 30 seconds',
    timestamp: new Date().toISOString(),
    random: Math.random()
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Error handling middleware
app.use(errorHandler);

// Database connection health checks (non-fatal)
(async function checkDatabaseConnections() {
  // Check PostgreSQL
  try {
    const pg = require('./db/postgres');
    const result = await pg.query('SELECT NOW() AS now');
    console.log('[Postgres] Connected successfully:', result.rows[0].now);
  } catch (err) {
    console.warn('[Postgres] Connection check failed:', err.message);
    console.warn('[Postgres] Database endpoints will return errors until configured');
  }

  // Check MariaDB
  try {
    const maria = require('./db/mariadb');
    const rows = await maria.query('SELECT NOW() as now');
    const time = rows[0] && (rows[0].now || Object.values(rows[0])[0]);
    console.log('[MariaDB] Connected successfully:', time);
  } catch (err) {
    console.warn('[MariaDB] Connection check failed:', err.message);
    console.warn('[MariaDB] Database endpoints will return errors until configured');
  }
})();

// Check Redis connection
(async function checkRedisConnection() {
  try {
    const { getRedisClient } = require('./db/redis');
    const client = getRedisClient();
    const pong = await client.ping();
    const keyCount = await client.dbsize();
    console.log(`[Redis] Connected successfully: ${pong}`);
    console.log(`[Redis] Current keys in database: ${keyCount}`);
    console.log('[Redis] Cache middleware is active');
  } catch (err) {
    console.warn('[Redis] Connection check failed:', err.message);
    console.warn('[Redis] Caching will be disabled until Redis is configured');
  }
})();

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[WebSocket] Socket.IO initialized`);
  console.log(`[Health] Check endpoint available at http://localhost:${PORT}/health`);
  console.log(`[Database] Test endpoints available at http://localhost:${PORT}/db/*`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

// Export server for testing purposes
module.exports = server;
