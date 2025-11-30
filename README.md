# BEE Home Connect

A full-stack real estate platform with real-time notifications, multi-database support, and comprehensive property management features.

## Features

- 🏠 **Property Management** - Browse, search, and view property listings
- 🔐 **User Authentication** - Secure login/register with session management
- 📢 **Real-time Notifications** - WebSocket-powered instant updates
- 💾 **Multi-Database Support** - MongoDB, PostgreSQL, MariaDB, and Redis
- 🎨 **Responsive Design** - Modern UI with CSS animations
- 🔍 **Advanced Search** - Filter properties by price, location, and type
- 📊 **Database Viewer** - Admin dashboard to view database status

### 🆕 New Features

- 🔒 **SSL/HTTPS Support** - Run server over HTTPS with self-signed or production certificates
- 💨 **Redis Caching Dashboard** - Real-time visualization of cached data and statistics
- 🗂️ **Browser Caching** - localStorage and sessionStorage management with UI viewer

## Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB** (Mongoose) - Primary database for users and properties
- **PostgreSQL** - Relational database (optional)
- **MariaDB** - Relational database (optional)
- **Redis** - Caching layer (optional)

### Frontend
- **EJS** - Server-side templating
- **Vanilla JavaScript** - Client-side interactivity
- **CSS3** - Modern styling with animations

### Security & Middleware
- **JWT** - Token-based authentication
- **express-session** - Session management
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager (comes with Node.js)

### Optional (for full functionality)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **MariaDB** (v10.5 or higher) - [Download](https://mariadb.org/download/)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)

## Installation

### 1. Clone or Download the Project

```bash
cd "BEE Home Connect/Backend-Code"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`.

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following configuration (modify values as needed):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration (Required)
MONGO_URL=mongodb://localhost:27017/homeconnect

# Session Secret (Required)
SESSION_SECRET=your-secret-key-change-this-in-production

# JWT Configuration (Optional)
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# PostgreSQL Configuration (Optional)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=homeconnect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-postgres-password

# MariaDB Configuration (Optional)
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_DB=homeconnect
MARIADB_USER=root
MARIADB_PASSWORD=your-mariadb-password

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Set Up MongoDB

**Option A: Local MongoDB**

1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

2. Verify MongoDB is running:
   ```bash
   mongosh
   ```

**Option B: MongoDB Atlas (Cloud)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update `MONGO_URL` in `.env` with your Atlas connection string

### 5. Set Up Optional Databases

#### PostgreSQL (Optional)

1. Install and start PostgreSQL
2. Create database and user:
   ```sql
   CREATE DATABASE homeconnect;
   CREATE USER homeconnect_user WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE homeconnect TO homeconnect_user;
   ```

3. Run the schema:
   ```bash
   psql -U homeconnect_user -d homeconnect -f db/sql/postgres_demo.sql
   ```

4. Uncomment PostgreSQL connection in `server.js` (line 64):
   ```javascript
   connectPostgres().catch(err => console.error('[Postgres] Connection failed:', err));
   ```

#### MariaDB (Optional)

1. Install and start MariaDB
2. Create database and user:
   ```sql
   CREATE DATABASE homeconnect;
   CREATE USER 'homeconnect_user'@'localhost' IDENTIFIED BY 'your-password';
   GRANT ALL PRIVILEGES ON homeconnect.* TO 'homeconnect_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Run the schema:
   ```bash
   mysql -u homeconnect_user -p homeconnect < db/sql/mariadb_demo.sql
   ```

4. Uncomment MariaDB connection in `server.js` (line 65):
   ```javascript
   connectMariaDB().catch(err => console.error('[MariaDB] Connection failed:', err));
   ```

#### Redis (Optional - for caching)

1. Install and start Redis:
   ```bash
   # macOS
   brew services start redis
   
   # Windows - Download from https://github.com/microsoftarchive/redis/releases
   
   # Linux
   sudo systemctl start redis
   ```

2. Redis connection is already enabled in `server.js` (line 61)

## Running the Project

### Development Mode (with auto-restart)

```bash
npm run dev
```

This uses **nodemon** to automatically restart the server when files change.

### Production Mode

```bash
npm start
```

Or:

```bash
node server.js
```

The server will start on the port specified in `.env` (default: 3000).

## Accessing the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3000
```

### Available Routes

- **Home** - `http://localhost:8080/`
- **Properties** - `http://localhost:8080/listings`
- **Search** - `http://localhost:8080/search`
- **Login** - `http://localhost:8080/login`
- **Register** - `http://localhost:8080/register`
- **Dashboard** - `http://localhost:8080/dashboard` (requires login)
- **Database Viewer** - `http://localhost:8080/db` (requires login)
- **About** - `http://localhost:8080/about`
- **Contact** - `http://localhost:8080/contact`

#### 🆕 New Pages

- **Redis Dashboard** - `http://localhost:8080/redis-dashboard` - View cache statistics and  managecached keys
- **Browser Cache Viewer** - `http://localhost:8080/cache-viewer` - View localStorage/sessionStorage data
- **HTTPS** - `https://localhost:8443/` - Access via HTTPS (after generating SSL certificates)

### API Endpoints

- **Health Check** - `GET /health`
- **Properties API** - `GET /api/properties`

#### 🆕 New API Endpoints

- **Redis Stats** - `GET /api/redis/stats` - Get cache statistics
- **Redis Keys** - `GET /api/redis/keys` - List all cached keys
- **Redis Key Details** - `GET /api/redis/key/:key` - Get specific key details
- **Clear Cache** - `DELETE /api/redis/clear` - Clear all cached data

4. Notifications will appear instantly in the dropdown

## Project Structure

```
Backend-Code/
├── api/                    # API routes
│   └── apiRoutes.js
├── db/                     # Database connections
│   ├── mongodb.js
│   ├── postgres.js
│   ├── mariadb.js
│   ├── redis.js
│   └── sql/               # SQL schemas
├── middlewares/           # Express middlewares
│   ├── authMiddleware.js
│   ├── cacheMiddleware.js
│   ├── errorHandler.js
│   └── logger.js
├── models/                # Database models
│   └── mongodb/
│       ├── Property.js
│       └── User.js
├── public/                # Static assets
│   ├── css/
│   ├── images/
│   └── js/
│       └── notifications.js
├── routes/                # Route handlers
│   ├── auth.js
│   ├── dbTest.js
│   └── notificationTest.js
├── views/                 # EJS templates
│   ├── partials/
│   └── *.ejs
├── websocket/             # WebSocket handlers
│   └── socket.js
├── .env                   # Environment variables (create this)
├── package.json
├── server.js              # Main entry point
└── README.md
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGO_URL` | Yes | - | MongoDB connection string |
| `SESSION_SECRET` | Yes | - | Session encryption key |
| `JWT_SECRET` | No | - | JWT token secret |
| `POSTGRES_HOST` | No | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port |
| `POSTGRES_DB` | No | - | PostgreSQL database name |
| `POSTGRES_USER` | No | - | PostgreSQL username |
| `POSTGRES_PASSWORD` | No | - | PostgreSQL password |
| `MARIADB_HOST` | No | `localhost` | MariaDB host |
| `MARIADB_PORT` | No | `3306` | MariaDB port |
| `MARIADB_DB` | No | - | MariaDB database name |
| `MARIADB_USER` | No | - | MariaDB username |
| `MARIADB_PASSWORD` | No | - | MariaDB password |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
- Check connection string in `.env`
- Verify MongoDB is listening on the correct port (default: 27017)

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
- Change `PORT` in `.env` to a different port (e.g., `3001`)
- Or kill the process using port 3000:
  ```bash
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### PostgreSQL/MariaDB Connection Errors

**Solution:**
- Verify credentials in `.env`
- Ensure database service is running
- Check that database and user exist
- Verify firewall settings

### Redis Connection Warning

If you see `[Redis] Connection failed`, Redis is optional. The app will work without it, but caching will be disabled.

To enable Redis:
1. Install and start Redis
2. Update `.env` with Redis credentials
3. Uncomment cache middleware in routes

## Development

### Adding New Properties

1. Login to the dashboard
2. Use the property management interface
3. Or use the API: `POST /api/properties` with property data

### Viewing Database Status

Visit `/db` while logged in to see:
- MongoDB collections and documents
- PostgreSQL tables (if configured)
- MariaDB tables (if configured)
- Redis status (if configured)

## 🆕 SSL/HTTPS Setup

The application supports HTTPS encryption for secure communication.

### Generate Self-Signed Certificates (Development)

1. Run the certificate generation script:
   ```bash
   ./generate-ssl-cert.sh
   ```

2. Follow the prompts to enter certificate details (or press Enter for defaults)

3. The script will create `server.key` and `server.cert` files

4. Restart the server:
   ```bash
   npm start
   ```

5. Access via HTTPS:
   ```
   https://localhost:8443
   ```

**Note:** Browsers will show a security warning for self-signed certificates. This is normal for development. Click "Advanced" and "Proceed to localhost" to access the site.

### Production Certificates

For production, use certificates from a trusted Certificate Authority:

1. **Let's Encrypt** (Free):
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

2. Update `.env` with certificate paths:
   ```env
   SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com
   ```

3. Enable HTTPS redirect by settingenvironment variable:
   ```env
   HTTPS_ENABLED=true
   ```

## 🆕 Redis Caching Dashboard

The Redis dashboard provides real-time visualization of cached data.

### Access the Dashboard

1. Ensure Redis is running:
   ```bash
   redis-cli ping  # Should return "PONG"
   ```

2. Login to the application

3. Visit: `http://localhost:8080/redis-dashboard`

### Features

- **Real-time Statistics**: Total keys, cache hit rate, memory usage
- **Cached Keys List**: View all cached keys with TTL countdown
- **Key Management**: View details, delete individual keys  
- **Auto-refresh**: Automatically updates every 5-30 seconds
- **Clear All Cache**: Flush all cached data with one click

### Where Data is Cached

The application automatically caches:
- **Property Listings** (`cache:/api/properties`) - 60 seconds TTL
- **User Data** - As needed
- **API Responses** - GET requests with caching middleware

## 🆕 Browser Caching

Client-side caching using localStorage and sessionStorage with a management UI.

### Using Browser Cache

The application automatically caches:
- User preferences
- Session data
- Recent searches

### Browser Cache Viewer

Visit `/cache-viewer` to:
- View all localStorage items with expiration times
- View all sessionStorage items
- See item sizes and timestamps
- Delete individual cached items
- Clear all cache data

### For Developers

Use the `BrowserCache` utility in your JavaScript:

```javascript
// Set item in localStorage with  15-minute expiration
BrowserCache.setLocal('myKey', {data: 'value'}, 15);

// Get item from localStorage
const data = BrowserCache.getLocal('myKey');

// Set item in sessionStorage
BrowserCache.setSession('tempKey', 'tempValue');

// Get item from sessionStorage
const temp = BrowserCache.getSession('tempKey');

// Clear all localStorage
BrowserCache.clearLocal();
```

The utility is globally available on all pages via `window.BrowserCache`.


## Security Notes

⚠️ **Important for Production:**

1. Change `SESSION_SECRET` and `JWT_SECRET` to strong random values
2. Use strong database passwords
3. Enable HTTPS (uncomment `httpsRedirect` middleware)
4. Set `NODE_ENV=production`
5. Configure proper CORS origins
6. Review and adjust rate limiting settings
7. Never commit `.env` file to version control

## Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs for error messages
- Ensure all prerequisites are installed
- Verify environment variables are correctly set

## License

This project is for educational purposes.

---

**Built with ❤️ using Node.js, Express, MongoDB, and Socket.IO**
