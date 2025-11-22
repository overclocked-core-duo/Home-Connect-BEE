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
const createHTTPSServer = (app, certPath = null) => {
  try {
    // Use environment variable or parameter or default to project root
    const basePath = certPath || process.env.SSL_CERT_PATH || __dirname;
    
    // Path to SSL certificate files
    const keyPath = path.join(basePath, 'server.key');
    const certFilePath = path.join(basePath, 'server.cert');

    // Check if certificate files exist
    if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
      console.warn('');
      console.warn('[HTTPS] ⚠️  SSL certificate files not found');
      console.warn('[HTTPS] Expected files:');
      console.warn(`[HTTPS]   - ${keyPath}`);
      console.warn(`[HTTPS]   - ${certFilePath}`);
      console.warn('');
      console.warn('[HTTPS] To generate self-signed certificates for development:');
      console.warn('[HTTPS]   ./generate-ssl-cert.sh');
      console.warn('');
      console.warn('[HTTPS] For production, use certificates from a trusted CA (Let\'s Encrypt, etc.)');
      console.warn('[HTTPS] Server will run on HTTP only until certificates are available');
      console.warn('');
      return null;
    }

    // SSL options
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certFilePath)
    };

    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);

    console.log('[HTTPS] ✓ Server created with SSL/TLS encryption');
    console.log(`[HTTPS] ✓ Certificate: ${certFilePath}`);
    return httpsServer;
  } catch (err) {
    console.error('[HTTPS] ❌ Error creating server:', err.message);
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
