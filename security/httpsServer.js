const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

/**
 * HTTPS Server Example
 * Demonstrates SSL/TLS encrypted connection
 * 
 * To generate self-signed certificates for local development:
 * 
 * openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
 * 
 * For production, use certificates from a trusted Certificate Authority (CA)
 * like Let's Encrypt, DigiCert, etc.
 */

/**
 * Create HTTPS server with SSL/TLS
 * Requires certificate files in the project root or specified path
 */
const createHTTPSServer = (app, certPath = '.') => {
  try {
    // Path to SSL certificate files
    const keyPath = path.join(certPath, 'server.key');
    const certFilePath = path.join(certPath, 'server.cert');

    // Check if certificate files exist
    if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
      console.warn('[HTTPS] Certificate files not found. Generate them using:');
      console.warn('openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365');
      return null;
    }

    // SSL options
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certFilePath)
    };

    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);

    console.log('[HTTPS] Server created with SSL/TLS encryption');
    return httpsServer;
  } catch (err) {
    console.error('[HTTPS] Error creating server:', err.message);
    return null;
  }
};

/**
 * Example standalone HTTPS server
 * Run this file directly to test HTTPS functionality
 */
const runHTTPSExample = () => {
  const app = express();

  app.get('/', (req, res) => {
    res.send('Hello from HTTPS Server! 🔒');
  });

  const httpsServer = createHTTPSServer(app);

  if (httpsServer) {
    const PORT = process.env.HTTPS_PORT || 8443;
    httpsServer.listen(PORT, () => {
      console.log(`[HTTPS] Server running on https://localhost:${PORT}`);
      console.log('[HTTPS] Note: Browser will show security warning for self-signed certificates');
    });
  } else {
    console.error('[HTTPS] Could not start HTTPS server');
  }
};

// Uncomment to run this file directly for testing
// runHTTPSExample();

module.exports = {
  createHTTPSServer,
  runHTTPSExample
};
