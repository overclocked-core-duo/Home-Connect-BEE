/**
 * WebSocket implementation using Socket.IO
 * Provides real-time communication between server and clients
 */

let io;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {Object} server - HTTP server instance
 */
const initializeSocket = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: "*", // Configure appropriately for production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] New client connected: ${socket.id}`);

    // Example: Client joins a room
    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      console.log(`[WebSocket] Client ${socket.id} joined room: ${roomName}`);
      socket.to(roomName).emit('user-joined', { userId: socket.id });
    });

    // Example: Client leaves a room
    socket.on('leave-room', (roomName) => {
      socket.leave(roomName);
      console.log(`[WebSocket] Client ${socket.id} left room: ${roomName}`);
      socket.to(roomName).emit('user-left', { userId: socket.id });
    });

    // Example: Broadcast message to a room
    socket.on('room-message', (data) => {
      const { room, message } = data;
      socket.to(room).emit('room-message', {
        userId: socket.id,
        message,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Broadcast notification when a new property is added
 * @param {Object} property - Property object
 */
const notifyNewProperty = (property) => {
  if (io) {
    io.emit('new-property', {
      message: 'A new property has been listed!',
      property: {
        id: property._id,
        title: property.title,
        type: property.type,
        price: property.price,
        location: property.location
      },
      timestamp: new Date()
    });
    console.log('[WebSocket] Broadcasted new property notification');
  }
};

/**
 * Send admin message to all connected clients
 * @param {String} message - Admin message
 */
const sendAdminMessage = (message) => {
  if (io) {
    io.emit('admin-message', {
      message,
      timestamp: new Date()
    });
    console.log('[WebSocket] Broadcasted admin message');
  }
};

module.exports = {
  initializeSocket,
  getIO,
  notifyNewProperty,
  sendAdminMessage
};
