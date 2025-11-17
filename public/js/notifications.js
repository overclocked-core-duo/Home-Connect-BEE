/**
 * Notification System with WebSocket Integration
 * BEE Home Connect - Real-time Notification Manager
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.socket = null;
    this.maxNotifications = 50;
    
    // DOM Elements
    this.bell = document.getElementById('notification-bell');
    this.badge = document.getElementById('notification-badge');
    this.dropdown = document.getElementById('notification-dropdown');
    this.list = document.getElementById('notification-list');
    this.markAllReadBtn = document.getElementById('mark-all-read');
    this.clearAllBtn = document.getElementById('clear-all');
    this.viewAllBtn = document.getElementById('view-all-notifications');
    
    this.init();
  }
  
  /**
   * Initialize notification system
   */
  init() {
    // Load saved notifications from localStorage
    this.loadNotifications();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize WebSocket connection
    this.initWebSocket();
    
    // Request notification permission
    this.requestNotificationPermission();
    
    // Update UI
    this.updateBadge();
    this.renderNotifications();
  }
  
  /**
   * Setup DOM event listeners
   */
  setupEventListeners() {
    // Toggle dropdown on bell click
    if (this.bell) {
      this.bell.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDropdown();
      });
    }
    
    // Mark all as read
    if (this.markAllReadBtn) {
      this.markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }
    
    // Clear all notifications
    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener('click', () => {
        this.clearAll();
      });
    }
    
    // View all notifications
    if (this.viewAllBtn) {
      this.viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.viewAllNotifications();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.dropdown && !e.target.closest('.notification-container')) {
        this.closeDropdown();
      }
    });
  }
  
  /**
   * Initialize WebSocket connection
   */
  initWebSocket() {
    try {
      // Connect to Socket.IO server
      this.socket = io(window.location.origin);
      
      // Connection events
      this.socket.on('connect', () => {
        // Connected (silent)
      });

      this.socket.on('disconnect', () => {
        // Disconnected (silent)
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('[Notifications] Connection error:', error);
      });
      
      // Listen for notification events
      this.socket.on('new-property', (data) => {
        this.handleNewProperty(data);
      });
      
      this.socket.on('admin-message', (data) => {
        this.handleAdminMessage(data);
      });
      
      this.socket.on('property-update', (data) => {
        this.handlePropertyUpdate(data);
      });
      
      this.socket.on('user-action', (data) => {
        this.handleUserAction(data);
      });
      
      this.socket.on('system-notification', (data) => {
        this.handleSystemNotification(data);
      });
      
    } catch (error) {
      console.error('[Notifications] WebSocket initialization failed:', error);
    }
  }
  
  /**
   * Handle new property notification
   */
  handleNewProperty(data) {
    const { property, message } = data;
    const propertyId = property._id || property.id;
    
    this.addNotification({
      type: 'property',
      title: 'New Property Added',
      message: `${property.title || 'Property'} in ${property.location || 'Unknown'} - $${property.price || 'N/A'}`,
      timestamp: Date.now(),
      data: property,
      action: propertyId ? {
        text: 'View Property',
        url: `/view-property/${propertyId}`
      } : undefined
    });
    
    // Show browser notification
    this.showBrowserNotification('New Property Available', {
      body: `${property.title} - $${property.price}`,
      icon: property.image || '/images/logo.png',
      tag: `property-${property._id}`
    });
  }
  
  /**
   * Handle admin message
   */
  handleAdminMessage(data) {
    this.addNotification({
      type: 'warning',
      title: 'Admin Message',
      message: data.message,
      timestamp: Date.now(),
      important: true
    });
    
    this.showBrowserNotification('Admin Message', {
      body: data.message,
      icon: '/images/logo.png',
      requireInteraction: true
    });
  }
  
  /**
   * Handle property update
   */
  handlePropertyUpdate(data) {
    this.addNotification({
      type: 'info',
      title: 'Property Updated',
      message: data.message || 'A property has been updated',
      timestamp: Date.now(),
      data: data.property
    });
  }
  
  /**
   * Handle user action notification
   */
  handleUserAction(data) {
    this.addNotification({
      type: 'info',
      title: data.title || 'User Action',
      message: data.message,
      timestamp: Date.now()
    });
  }
  
  /**
   * Handle system notification
   */
  handleSystemNotification(data) {
    this.addNotification({
      type: data.type || 'info',
      title: data.title || 'System Notification',
      message: data.message,
      timestamp: Date.now(),
      important: data.important || false
    });
  }
  
  /**
   * Add a new notification
   */
  addNotification(notification) {
    // Generate unique ID
    notification.id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    notification.read = false;
    
    // Add to beginning of array
    this.notifications.unshift(notification);
    
    // Limit total notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
    
    // Update unread count
    this.unreadCount++;
    
    // Save to localStorage
    this.saveNotifications();
    
    // Update UI
    this.updateBadge();
    this.renderNotifications();
    
    // Auto-hide if specified
    if (notification.autoHide) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    }
    
    // Play sound (optional)
    this.playNotificationSound();
  }
  
  /**
   * Remove a notification
   */
  removeNotification(id) {
    const notification = this.notifications.find(n => n.id === id);
    
    if (notification && !notification.read) {
      this.unreadCount--;
    }
    
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.updateBadge();
    this.renderNotifications();
  }
  
  /**
   * Mark notification as read
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount--;
      this.saveNotifications();
      this.updateBadge();
      this.renderNotifications();
    }
  }
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.saveNotifications();
    this.updateBadge();
    this.renderNotifications();
  }
  
  /**
   * Clear all notifications
   */
  clearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notifications = [];
      this.unreadCount = 0;
      this.saveNotifications();
      this.updateBadge();
      this.renderNotifications();
    }
  }
  
  /**
   * Toggle notification dropdown
   */
  toggleDropdown() {
    if (this.dropdown) {
      this.dropdown.classList.toggle('active');
    }
  }
  
  /**
   * Close dropdown
   */
  closeDropdown() {
    if (this.dropdown) {
      this.dropdown.classList.remove('active');
    }
  }
  
  /**
   * Update notification badge
   */
  updateBadge() {
    if (this.badge) {
      this.badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      
      if (this.unreadCount > 0) {
        this.badge.classList.add('active');
        if (this.unreadCount > 5) {
          this.badge.classList.add('pulse');
        }
      } else {
        this.badge.classList.remove('active', 'pulse');
      }
    }
  }
  
  /**
   * Render notifications list
   */
  renderNotifications() {
    if (!this.list) return;
    
    if (this.notifications.length === 0) {
      this.list.innerHTML = `
        <div class="no-notifications">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
      `;
      return;
    }
    
    const html = this.notifications.map(notification => {
      return this.createNotificationHTML(notification);
    }).join('');
    
    this.list.innerHTML = html;
    
    // Attach event listeners to notification items
    this.attachNotificationListeners();
  }
  
  /**
   * Create HTML for a single notification
   */
  createNotificationHTML(notification) {
    const iconClass = this.getIconClass(notification.type);
    const timeAgo = this.getTimeAgo(notification.timestamp);
    
    return `
      <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
        <div class="notification-icon ${notification.type}">
          <i class="${iconClass}"></i>
        </div>
        <div class="notification-content">
          <h4 class="notification-title">${this.escapeHtml(notification.title)}</h4>
          <p class="notification-message">${this.escapeHtml(notification.message)}</p>
          <span class="notification-time">
            <i class="far fa-clock"></i>
            ${timeAgo}
          </span>
        </div>
        <div class="notification-item-actions">
          ${!notification.read ? '<button class="mark-read" title="Mark as read"><i class="fas fa-check"></i></button>' : ''}
          <button class="delete-notification" title="Delete"><i class="fas fa-times"></i></button>
        </div>
      </div>
    `;
  }
  
  /**
   * Attach event listeners to notification items
   */
  attachNotificationListeners() {
    // Click on notification item
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.notification-item-actions')) return;
        
        const id = item.dataset.id;
        this.markAsRead(id);
        
        // Handle action if exists and is valid
        const notification = this.notifications.find(n => n.id === id);
        if (notification?.action?.url && !notification.action.url.includes('undefined')) {
          window.location.href = notification.action.url;
        }
      });
    });
    
    // Mark as read buttons
    document.querySelectorAll('.mark-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.notification-item').dataset.id;
        this.markAsRead(id);
      });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-notification').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.notification-item').dataset.id;
        this.removeNotification(id);
      });
    });
  }
  
  /**
   * Get icon class for notification type
   */
  getIconClass(type) {
    const icons = {
      'info': 'fas fa-info-circle',
      'success': 'fas fa-check-circle',
      'warning': 'fas fa-exclamation-triangle',
      'error': 'fas fa-times-circle',
      'property': 'fas fa-home'
    };
    
    return icons[type] || icons.info;
  }
  
  /**
   * Get time ago string
   */
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify({
        notifications: this.notifications,
        unreadCount: this.unreadCount
      }));
    } catch (error) {
      console.error('[Notifications] Failed to save to localStorage:', error);
    }
  }
  
  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    try {
      const data = localStorage.getItem('notifications');
      if (data) {
        const parsed = JSON.parse(data);
        this.notifications = parsed.notifications || [];
        this.unreadCount = parsed.unreadCount || 0;
      }
    } catch (error) {
      console.error('[Notifications] Failed to load from localStorage:', error);
      this.notifications = [];
      this.unreadCount = 0;
    }
  }
  
  /**
   * Request browser notification permission
   */
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(() => {
        // Permission result intentionally not logged
      });
    }
  }
  
  /**
   * Show browser notification
   */
  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/images/logo.png',
          badge: '/images/logo.png',
          ...options
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('[Notifications] Browser notification failed:', error);
      }
    }
  }
  
  /**
   * Play notification sound
   */
  playNotificationSound() {
    // Optional: Add a subtle notification sound
    // const audio = new Audio('/sounds/notification.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(e => console.log('Sound play failed:', e));
  }
  
  /**
   * View all notifications (navigate to dedicated page)
   */
  viewAllNotifications() {
    // For now, just mark all as read and close
    this.markAllAsRead();
    this.closeDropdown();
    
    // Optional: Navigate to a dedicated notifications page
    // window.location.href = '/notifications';
  }
}

// Initialize notification manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if notification elements exist (user is logged in)
  if (document.getElementById('notification-bell')) {
    window.notificationManager = new NotificationManager();
  }
});
