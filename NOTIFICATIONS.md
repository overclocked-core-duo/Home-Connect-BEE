# Notification System Documentation

## Overview

The BEE Home Connect platform now includes a real-time notification system that displays WebSocket notifications in the header. This system provides instant updates to users about new properties, admin messages, and system events.

## Features

✅ **Real-time Notifications** - WebSocket-powered instant notifications
✅ **Visual Badge Counter** - Unread notification count with pulse animation
✅ **Dropdown Panel** - Elegant notification list with smooth animations
✅ **Multiple Notification Types** - Info, Success, Warning, Error, Property
✅ **Persistent Storage** - Notifications saved in localStorage
✅ **Browser Notifications** - Native OS notification support
✅ **Mark as Read/Unread** - Individual and bulk actions
✅ **Time Ago Display** - Human-readable timestamps
✅ **Mobile Responsive** - Optimized for all screen sizes
✅ **XSS Protection** - All content escaped for security

## User Interface

### Header Notification Bell
- Located in the header navigation (visible only when logged in)
- Bell icon with animated badge showing unread count
- Badge pulses when there are more than 5 unread notifications
- Hover effect for better UX

### Notification Dropdown
- **Width**: 380px (340px on mobile)
- **Max Height**: 520px
- **Features**:
  - Header with notification count
  - Mark all as read button
  - Clear all notifications button
  - Scrollable notification list
  - Footer with "View all" link

### Notification Items
Each notification includes:
- **Icon** - Color-coded by type (info, success, warning, error, property)
- **Title** - Bold notification heading
- **Message** - Notification details (max 2 lines)
- **Timestamp** - "Just now", "5m ago", "2h ago", etc.
- **Actions** - Mark as read, Delete (visible on hover)
- **Unread Indicator** - Blue left border for unread items

## Notification Types

### 1. Info (Blue)
```javascript
{
  type: 'info',
  title: 'Information',
  message: 'Your profile has been viewed 10 times today'
}
```

### 2. Success (Green)
```javascript
{
  type: 'success',
  title: 'Success!',
  message: 'Your profile has been updated successfully'
}
```

### 3. Warning (Orange)
```javascript
{
  type: 'warning',
  title: 'Warning',
  message: 'Your session will expire in 5 minutes'
}
```

### 4. Error (Red)
```javascript
{
  type: 'error',
  title: 'Error',
  message: 'Failed to save changes. Please try again.'
}
```

### 5. Property (Purple)
```javascript
{
  type: 'property',
  title: 'New Property Added',
  message: 'Beautiful 3BR House in San Francisco - $850,000',
  data: { propertyId: '123' },
  action: {
    text: 'View Property',
    url: '/property/123'
  }
}
```

## WebSocket Events

### Server → Client Events

| Event Name | Description | Data Structure |
|------------|-------------|----------------|
| `new-property` | New property listing added | `{ property: {...}, message: string }` |
| `admin-message` | Admin broadcast message | `{ message: string, priority?: string }` |
| `property-update` | Property information updated | `{ message: string, property: {...} }` |
| `user-action` | User-specific action notification | `{ title: string, message: string }` |
| `system-notification` | General system notification | `{ type: string, title: string, message: string }` |

### Client → Server Events (Future)

| Event Name | Description | Data Structure |
|------------|-------------|----------------|
| `mark-notification-read` | Mark notification as read | `{ notificationId: string }` |
| `delete-notification` | Delete notification | `{ notificationId: string }` |

## API Testing Endpoints

### Available Test Routes

All test routes are available at `/api/test/notification/*`

#### 1. Basic Test Notification
```bash
GET /api/test/notification
```
Sends a simple test notification to all connected clients.

#### 2. New Property Notification
```bash
GET /api/test/notification/property
```
Sends a mock "new property" notification with sample property data.

#### 3. Admin Message
```bash
GET /api/test/notification/admin
```
Sends a high-priority admin message notification.

#### 4. Property Update
```bash
GET /api/test/notification/update
```
Sends a property update notification (e.g., price change).

#### 5. Success Notification
```bash
GET /api/test/notification/success
```
Sends a success-type notification.

#### 6. Warning Notification
```bash
GET /api/test/notification/warning
```
Sends a warning-type notification.

#### 7. Error Notification
```bash
GET /api/test/notification/error
```
Sends an error-type notification.

#### 8. Custom Notification
```bash
POST /api/test/notification/custom
Content-Type: application/json

{
  "type": "info",
  "title": "Custom Title",
  "message": "Your custom message here"
}
```

### Testing in Browser

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Log in to the website** (notifications only show when authenticated)

3. **Open browser console** to see notification logs

4. **Send test notifications**:
   ```bash
   # In a new terminal
   curl http://localhost:8080/api/test/notification
   curl http://localhost:8080/api/test/notification/property
   curl http://localhost:8080/api/test/notification/admin
   
   # Custom notification
   curl -X POST http://localhost:8080/api/test/notification/custom \
     -H "Content-Type: application/json" \
     -d '{"type":"success","title":"Test","message":"Hello World"}'
   ```

5. **Watch notifications appear** in the header bell dropdown

## Usage in Application Code

### Sending Notifications from Backend

```javascript
// In any route or controller
const io = req.app.get('io');

// Send to all connected clients
io.emit('new-property', {
  property: newPropertyData,
  message: 'A new property matching your criteria is available!'
});

// Send to specific room
io.to(roomName).emit('property-update', {
  message: 'Price reduced!',
  property: updatedProperty
});

// Send to specific user (if you store socket IDs)
io.to(userSocketId).emit('user-action', {
  title: 'Profile Updated',
  message: 'Your profile information has been saved'
});
```

### JavaScript API

```javascript
// Access the notification manager
const nm = window.notificationManager;

// Manually add notification
nm.addNotification({
  type: 'info',
  title: 'Manual Notification',
  message: 'This was added manually',
  timestamp: Date.now()
});

// Mark as read
nm.markAsRead(notificationId);

// Clear all
nm.clearAll();

// Get notification count
console.log(nm.unreadCount);
```

## Browser Notification Permission

The system automatically requests browser notification permission on first load. Users can:

1. **Allow** - Receive native OS notifications even when the site is not focused
2. **Deny** - Only see in-app notifications
3. **Default** - Not yet decided (will be asked again)

To manually check permission:
```javascript
console.log(Notification.permission); // "granted", "denied", or "default"
```

## Styling Customization

All notification styles are in `/public/css/style.css` under the section:
```css
/* ========================================
   Notification System Styles
   ======================================== */
```

### Key CSS Variables to Customize

```css
/* Primary color */
--notification-primary: #2c6bed;

/* Badge color */
--notification-badge: linear-gradient(135deg, #ff6b6b, #ee5a52);

/* Type colors */
--notification-info: #1976d2;
--notification-success: #388e3c;
--notification-warning: #f57c00;
--notification-error: #d32f2f;
--notification-property: #7b1fa2;
```

## localStorage Structure

Notifications are persisted in localStorage:

```javascript
{
  "notifications": [
    {
      "id": "notif-1234567890-abc123",
      "type": "info",
      "title": "Test",
      "message": "Test message",
      "timestamp": 1637123456789,
      "read": false
    }
  ],
  "unreadCount": 5
}
```

## Performance Considerations

- **Maximum Notifications**: Limited to 50 stored notifications
- **Auto-cleanup**: Older notifications are automatically removed
- **Debounced Rendering**: UI updates are optimized
- **Lazy Loading**: Notifications load from localStorage on demand

## Security

✅ **XSS Protection** - All user content is HTML-escaped
✅ **CSRF Protection** - WebSocket uses same-origin policy
✅ **Input Validation** - All notification data is validated
✅ **Content Security** - No inline scripts or eval()

## Troubleshooting

### Notifications Not Appearing

1. **Check if logged in** - Notifications only show for authenticated users
2. **Check console** - Look for WebSocket connection errors
3. **Check browser** - Ensure JavaScript is enabled
4. **Check server** - Verify WebSocket server is running

```javascript
// In browser console
console.log(window.notificationManager); // Should exist
console.log(window.io); // Should be Socket.IO client
```

### WebSocket Not Connecting

```javascript
// Check connection status
if (window.notificationManager?.socket) {
  console.log('Connected:', window.notificationManager.socket.connected);
  console.log('Socket ID:', window.notificationManager.socket.id);
}
```

### Badge Not Updating

```javascript
// Manually trigger update
window.notificationManager?.updateBadge();
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- [ ] Notification categories/filters
- [ ] Notification settings/preferences
- [ ] Email digest of notifications
- [ ] Mark as important/pin notifications
- [ ] Notification history page
- [ ] Search/filter notifications
- [ ] Notification sound customization
- [ ] Do Not Disturb mode
- [ ] Notification scheduling

## Files Modified/Created

### New Files
- `/public/js/notifications.js` - Notification manager class
- `/routes/notificationTest.js` - Test routes for development
- `NOTIFICATIONS.md` - This documentation

### Modified Files
- `/views/partials/header.ejs` - Added notification bell and dropdown
- `/views/partials/footer.ejs` - Added Socket.IO and notification scripts
- `/public/css/style.css` - Added notification system styles
- `/server.js` - Added notification test routes and io instance to app

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Test with the `/api/test/notification/*` endpoints
4. Check WebSocket connection status

---

**Notification System v1.0** - Real-time notifications for BEE Home Connect 🔔
