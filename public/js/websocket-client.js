/**
 * WebSocket Client Example for Frontend Integration
 * Include Socket.IO client library in your HTML:
 * <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
 */

// Initialize Socket.IO connection
const socket = io('http://localhost:8080');

// Connection event handlers
socket.on('connect', () => {
  console.log('[WebSocket] Connected to server', socket.id);
  displayNotification('Connected to server', 'success');
});

socket.on('disconnect', () => {
  console.log('[WebSocket] Disconnected from server');
  displayNotification('Disconnected from server', 'warning');
});

socket.on('connect_error', (error) => {
  console.error('[WebSocket] Connection error:', error);
  displayNotification('Connection error', 'error');
});

// Listen for new property notifications
socket.on('new-property', (data) => {
  console.log('[WebSocket] New property added:', data);
  
  const { property, message } = data;
  
  // Display notification to user
  displayNotification(
    `${message}\n${property.title} in ${property.location} - $${property.price}`,
    'info'
  );
  
  // Optionally refresh property list or add to DOM
  refreshPropertyList();
});

// Listen for admin messages
socket.on('admin-message', (data) => {
  console.log('[WebSocket] Admin message:', data);
  displayNotification(`Admin: ${data.message}`, 'info');
});

// Join a specific room (optional)
function joinRoom(roomName) {
  socket.emit('join-room', roomName);
  console.log(`[WebSocket] Joined room: ${roomName}`);
}

// Leave a room (optional)
function leaveRoom(roomName) {
  socket.emit('leave-room', roomName);
  console.log(`[WebSocket] Left room: ${roomName}`);
}

// Send message to a room (optional)
function sendRoomMessage(roomName, message) {
  socket.emit('room-message', { room: roomName, message });
}

// Listen for room messages
socket.on('room-message', (data) => {
  console.log('[WebSocket] Room message:', data);
  // Handle room message in your UI
});

// Listen for user joined room
socket.on('user-joined', (data) => {
  console.log('[WebSocket] User joined room:', data.userId);
});

// Listen for user left room
socket.on('user-left', (data) => {
  console.log('[WebSocket] User left room:', data.userId);
});

/**
 * Display notification to user
 * @param {String} message - Notification message
 * @param {String} type - Notification type (success, error, warning, info)
 */
function displayNotification(message, type = 'info') {
  // Simple console log - replace with your notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Example: Using browser notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('BEE Home Connect', {
      body: message,
      icon: '/images/logo.png'
    });
  }
  
  // Example: Using a toast notification library
  // toast(message, { type });
  
  // Example: Custom notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

/**
 * Refresh property list
 * This is a placeholder - implement based on your frontend
 */
function refreshPropertyList() {
  // Example: Fetch updated property list
  fetch('/api/properties')
    .then(response => response.json())
    .then(properties => {
      console.log('[API] Fetched updated properties:', properties.length);
      // Update your UI with new properties
      // updatePropertyListUI(properties);
    })
    .catch(error => {
      console.error('[API] Error fetching properties:', error);
    });
}

/**
 * Request browser notification permission
 */
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('[Notification] Permission:', permission);
    });
  }
}

// Request notification permission on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', requestNotificationPermission);
} else {
  requestNotificationPermission();
}

// Example: Join property updates room on page load
// joinRoom('property-updates');

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    socket,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    displayNotification
  };
}
