/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role
 * Must be used after authMiddleware
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - No user information' });
      }
      
      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden - Insufficient permissions',
          requiredRole: allowedRoles,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = roleMiddleware;
