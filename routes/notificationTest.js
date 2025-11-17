/**
 * Notification Test Routes
 * Development routes for testing notification system
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/test/notification
 * Test notification endpoint - sends a test notification via WebSocket
 */
router.get('/notification', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  // Send test notification to all connected clients
  io.emit('system-notification', {
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification from the server',
    timestamp: Date.now()
  });
  
  res.json({ 
    success: true, 
    message: 'Test notification sent to all clients' 
  });
});

/**
 * GET /api/test/notification/property
 * Test new property notification
 */
router.get('/notification/property', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  // Mock property data with proper MongoDB ObjectId format
  const mockProperty = {
    _id: '673a1234567890abcdef1234',
    id: '673a1234567890abcdef1234',
    title: 'Beautiful 3BR House',
    location: 'San Francisco, CA',
    price: '850,000',
    image: '/images/house.jpg'
  };
  
  io.emit('new-property', {
    property: mockProperty,
    message: 'A new property matching your criteria is available!'
  });
  
  res.json({ 
    success: true, 
    message: 'New property notification sent',
    property: mockProperty
  });
});

/**
 * GET /api/test/notification/admin
 * Test admin message notification
 */
router.get('/notification/admin', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  io.emit('admin-message', {
    message: 'System maintenance scheduled for tonight at 11 PM EST',
    priority: 'high'
  });
  
  res.json({ 
    success: true, 
    message: 'Admin notification sent' 
  });
});

/**
 * GET /api/test/notification/update
 * Test property update notification
 */
router.get('/notification/update', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  io.emit('property-update', {
    message: 'Price reduced on your saved property!',
    property: {
      _id: '123456',
      title: 'Modern Apartment',
      oldPrice: '500,000',
      newPrice: '450,000'
    }
  });
  
  res.json({ 
    success: true, 
    message: 'Property update notification sent' 
  });
});

/**
 * GET /api/test/notification/success
 * Test success notification
 */
router.get('/notification/success', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  io.emit('system-notification', {
    type: 'success',
    title: 'Success!',
    message: 'Your profile has been updated successfully',
    timestamp: Date.now()
  });
  
  res.json({ 
    success: true, 
    message: 'Success notification sent' 
  });
});

/**
 * GET /api/test/notification/warning
 * Test warning notification
 */
router.get('/notification/warning', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  io.emit('system-notification', {
    type: 'warning',
    title: 'Warning',
    message: 'Your session will expire in 5 minutes',
    timestamp: Date.now()
  });
  
  res.json({ 
    success: true, 
    message: 'Warning notification sent' 
  });
});

/**
 * GET /api/test/notification/error
 * Test error notification
 */
router.get('/notification/error', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  io.emit('system-notification', {
    type: 'error',
    title: 'Error',
    message: 'Failed to save changes. Please try again.',
    timestamp: Date.now()
  });
  
  res.json({ 
    success: true, 
    message: 'Error notification sent' 
  });
});

/**
 * POST /api/test/notification/custom
 * Send custom notification
 */
router.post('/notification/custom', (req, res) => {
  const io = req.app.get('io');
  
  if (!io) {
    return res.status(500).json({ 
      success: false, 
      message: 'WebSocket server not initialized' 
    });
  }
  
  const { type, title, message } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title and message are required' 
    });
  }
  
  io.emit('system-notification', {
    type: type || 'info',
    title,
    message,
    timestamp: Date.now()
  });
  
  res.json({ 
    success: true, 
    message: 'Custom notification sent' 
  });
});

module.exports = router;
