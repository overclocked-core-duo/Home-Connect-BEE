/**
 * HTTPS Redirect Middleware
 * Redirects HTTP requests to HTTPS
 * Only enable in production with valid SSL certificates
 */

const httpsRedirect = (req, res, next) => {
  // Check if HTTPS redirection is enabled via environment variable
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';

  if (!httpsEnabled) {
    // HTTPS redirection disabled, continue normally
    return next();
  }

  // Check if request is already secure (HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }

  // Redirect to HTTPS
  const httpsUrl = `https://${req.hostname}${req.url}`;
  console.log(`[HTTPS Redirect] Redirecting ${req.url} to HTTPS`);
  return res.redirect(301, httpsUrl);
};

module.exports = httpsRedirect;
