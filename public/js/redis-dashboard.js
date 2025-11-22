// Redis Dashboard Client-Side JavaScript

let autoRefreshInterval = null;

// Fetch and display Redis stats
async function fetchRedisStats() {
    try {
        const response = await fetch('/api/redis/stats');
        const data = await response.json();

        if (data.success) {
            displayStats(data.stats);
        } else {
            console.error('Failed to fetch stats:', data.error);
        }
    } catch (error) {
        console.error('Error fetching Redis stats:', error);
        displayError('Failed to connect to Redis');
    }
}

// Fetch and display all cached keys
async function fetchCachedKeys() {
    try {
        const response = await fetch('/api/redis/keys');
        const data = await response.json();

        if (data.success) {
            displayKeys(data.keys);
        } else {
            console.error('Failed to fetch keys:', data.error);
        }
    } catch (error) {
        console.error('Error fetching Redis keys:', error);
    }
}

// Display statistics
function displayStats(stats) {
    document.getElementById('total-keys').textContent = stats.totalKeys;
    document.getElementById('cache-hits').textContent = stats.hits;
    document.getElementById('cache-misses').textContent = stats.misses;
    document.getElementById('hit-rate').textContent = stats.hitRate + '%';
    document.getElementById('memory-used').textContent = stats.memoryUsed;
    document.getElementById('memory-peak').textContent = stats.memoryPeak;

    // Update last refresh time
    document.getElementById('last-refresh').textContent = new Date().toLocaleTimeString();
}

// Display cached keys
function displayKeys(keys) {
    const container = document.getElementById('keys-list');

    if (keys.length === 0) {
        container.innerHTML = '<p class="no-data">No cached keys found</p>';
        return;
    }

    container.innerHTML = keys.map(item => `
    <div class="key-item">
      <div class="key-info">
        <span class="key-name">${escapeHtml(item.key)}</span>
        <span class="key-ttl">TTL: ${item.ttl}</span>
      </div>
      <div class="key-actions">
        <button class="btn-view" onclick="viewKeyDetails('${escapeHtml(item.key)}')">View</button>
        <button class="btn-delete" onclick="deleteKey('${escapeHtml(item.key)}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// View key details
async function viewKeyDetails(key) {
    try {
        const response = await fetch(`/api/redis/key/${encodeURIComponent(key)}`);
        const data = await response.json();

        if (data.success) {
            const details = data.details;
            let valuePreview = details.value;

            // Try to format JSON
            try {
                const parsed = JSON.parse(details.value);
                valuePreview = JSON.stringify(parsed, null, 2);
            } catch (e) {
                // Not JSON, keep as is
            }

            alert(`Key: ${key}\nTTL: ${details.ttl}\nType: ${details.type}\nSize: ${details.size} bytes\n\nValue:\n${valuePreview}`);
        } else {
            alert('Failed to fetch key details');
        }
    } catch (error) {
        console.error('Error fetching key details:', error);
        alert('Error fetching key details');
    }
}

// Delete a specific key
async function deleteKey(key) {
    if (!confirm(`Are you sure you want to delete key: ${key}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/redis/key/${encodeURIComponent(key)}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            alert('Key deleted successfully');
            refreshDashboard();
        } else {
            alert('Failed to delete key: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting key:', error);
        alert('Error deleting key');
    }
}

// Clear all cache
async function clearAllCache() {
    if (!confirm('Are you sure you want to clear ALL cached data? This cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/api/redis/clear', {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            alert('All cache cleared successfully');
            refreshDashboard();
        } else {
            alert('Failed to clear cache: ' + data.error);
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Error clearing cache');
    }
}

// Refresh dashboard data
function refreshDashboard() {
    fetchRedisStats();
    fetchCachedKeys();
}

// Toggle auto-refresh
function toggleAutoRefresh() {
    const checkbox = document.getElementById('auto-refresh');
    const intervalSelect = document.getElementById('refresh-interval');

    if (checkbox.checked) {
        const interval = parseInt(intervalSelect.value) * 1000;
        autoRefreshInterval = setInterval(refreshDashboard, interval);
        console.log(`Auto-refresh enabled (${intervalSelect.value}s)`);
    } else {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
            console.log('Auto-refresh disabled');
        }
    }
}

// Display error message
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    refreshDashboard();

    // Start auto-refresh by default (5 seconds)
    document.getElementById('auto-refresh').checked = true;
    toggleAutoRefresh();
});
