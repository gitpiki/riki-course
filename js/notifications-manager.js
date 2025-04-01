/**
 * Notifications Manager
 * Handles user notifications and alerts
 */

class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.initialized = false;
    }

    /**
     * Initialize the notifications manager
     */
    async init() {
        if (this.initialized) return true;
        
        try {
            // Load notifications from local storage
            this.loadNotifications();
            
            // Fetch notifications from server if available
            await this.fetchNotifications();
            
            // Set up notification panel
            this.setupNotificationPanel();
            
            this.initialized = true;
            console.log('Notifications manager initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing notifications manager:', error);
            return false;
        }
    }

    /**
     * Load notifications from local storage
     */
    loadNotifications() {
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            try {
                this.notifications = JSON.parse(savedNotifications);
                console.log('Notifications loaded from local storage');
            } catch (error) {
                console.error('Error parsing saved notifications:', error);
                this.notifications = [];
            }
        }
    }

    /**
     * Save notifications to local storage
     */
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    /**
     * Fetch notifications from server
     */
    async fetchNotifications() {
        if (!window.API) return;
        
        try {
            // Check if server API is available
            if (window.API === window.ServerAPI) {
                // Get notifications from server
                const serverNotifications = await window.API.getNotifications();
                
                if (serverNotifications && Array.isArray(serverNotifications)) {
                    // Merge with existing notifications
                    this.mergeNotifications(serverNotifications);
                }
                
                console.log('Notifications fetched from server');
            } else if (window.API === window.APIMock) {
                // Get mock notifications
                const mockNotifications = await window.API.dashboard.getDashboardData();
                
                if (mockNotifications && mockNotifications.recentNotifications) {
                    // Merge with existing notifications
                    this.mergeNotifications(mockNotifications.recentNotifications);
                }
                
                console.log('Mock notifications loaded');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    /**
     * Merge notifications from server with local notifications
     * @param {Array} serverNotifications - Notifications from server
     */
    mergeNotifications(serverNotifications) {
        if (!serverNotifications || !Array.isArray(serverNotifications)) return;
        
        // Add new notifications from server
        serverNotifications.forEach(notification => {
            const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
            
            if (existingIndex === -1) {
                // Add new notification
                this.notifications.push(notification);
            } else {
                // Update existing notification
                this.notifications[existingIndex] = {
                    ...this.notifications[existingIndex],
                    ...notification
                };
            }
        });
        
        // Sort notifications by timestamp (newest first)
        this.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Save merged notifications
        this.saveNotifications();
        
        // Update notification count
        this.updateNotificationCount();
    }

    /**
     * Set up notification panel
     */
    setupNotificationPanel() {
        // Get notification panel elements
        const notificationsToggle = document.querySelector('.notifications-toggle');
        const notificationsPanel = document.querySelector('.notifications-panel');
        const notificationsList = document.querySelector('.notifications-list');
        const notificationCount = document.querySelector('.notification-count');
        
        if (!notificationsToggle || !notificationsPanel || !notificationsList) return;
        
        // Update notification panel content
        this.updateNotificationPanel();
        
        // Update notification count
        this.updateNotificationCount();
        
        // Add event listener for mark all as read button
        const markAllReadBtn = document.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
    }

    /**
     * Update notification panel content
     */
    updateNotificationPanel() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList) return;
        
        // Clear current notifications
        notificationsList.innerHTML = '';
        
        if (this.notifications.length === 0) {
            // Show empty state
            notificationsList.innerHTML = '<div class="empty-state">אין התראות חדשות</div>';
            return;
        }
        
        // Add notifications to panel
        this.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            notificationItem.dataset.id = notification.id;
            
            // Format timestamp
            const timestamp = new Date(notification.timestamp);
            const formattedDate = timestamp.toLocaleDateString('he-IL');
            const formattedTime = timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
            
            notificationItem.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${formattedDate} ${formattedTime}</div>
                </div>
                <div class="notification-actions">
                    <button class="mark-read-btn" title="סמן כנקרא">
                        <i class="fas ${notification.read ? 'fa-check-circle' : 'fa-circle'}"></i>
                    </button>
                </div>
            `;
            
            // Add event listener for mark as read button
            const markReadBtn = notificationItem.querySelector('.mark-read-btn');
            if (markReadBtn) {
                markReadBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.markAsRead(notification.id);
                });
            }
            
            // Add event listener for notification item click
            notificationItem.addEventListener('click', () => {
                // Mark as read
                this.markAsRead(notification.id);
                
                // Handle notification action if available
                if (notification.action) {
                    this.handleNotificationAction(notification);
                }
            });
            
            notificationsList.appendChild(notificationItem);
        });
    }

    /**
     * Update notification count badge
     */
    updateNotificationCount() {
        const notificationCount = document.querySelector('.notification-count');
        if (!notificationCount) return;
        
        // Count unread notifications
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            notificationCount.textContent = unreadCount;
            notificationCount.style.display = 'flex';
        } else {
            notificationCount.style.display = 'none';
        }
    }

    /**
     * Add a new notification
     * @param {Object} notification - The notification object
     */
    addNotification(notification) {
        if (!notification || !notification.title) return;
        
        // Create notification object
        const newNotification = {
            id: notification.id || `notification_${Date.now()}`,
            title: notification.title,
            timestamp: notification.timestamp || new Date().toISOString(),
            read: notification.read || false,
            action: notification.action || null
        };
        
        // Add to notifications array
        this.notifications.unshift(newNotification);
        
        // Sort notifications by timestamp (newest first)
        this.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Save notifications
        this.saveNotifications();
        
        // Update notification panel
        this.updateNotificationPanel();
        
        // Update notification count
        this.updateNotificationCount();
        
        // Show notification toast
        this.showNotificationToast(newNotification);
    }

    /**
     * Mark a notification as read
     * @param {string} id - The notification ID
     */
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;
        
        // Mark as read
        notification.read = true;
        
        // Save notifications
        this.saveNotifications();
        
        // Update notification panel
        this.updateNotificationPanel();
        
        // Update notification count
        this.updateNotificationCount();
        
        // Sync with server if available
        this.syncNotificationStatus(id, true);
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        // Mark all as read
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        
        // Save notifications
        this.saveNotifications();
        
        // Update notification panel
        this.updateNotificationPanel();
        
        // Update notification count
        this.updateNotificationCount();
        
        // Sync with server if available
        this.syncAllNotificationStatus();
    }

    /**
     * Sync notification status with server
     * @param {string} id - The notification ID
     * @param {boolean} read - Whether the notification is read
     */
    async syncNotificationStatus(id, read) {
        if (!window.API || window.API !== window.ServerAPI) return;
        
        try {
            // Send notification status to server
            await window.API.updateNotificationStatus(id, read);
            console.log(`Notification ${id} status synced with server`);
        } catch (error) {
            console.error(`Error syncing notification ${id} status with server:`, error);
        }
    }

    /**
     * Sync all notification statuses with server
     */
    async syncAllNotificationStatus() {
        if (!window.API || window.API !== window.ServerAPI) return;
        
        try {
            // Send all notification statuses to server
            await window.API.updateAllNotificationStatus(this.notifications);
            console.log('All notification statuses synced with server');
        } catch (error) {
            console.error('Error syncing all notification statuses with server:', error);
        }
    }

    /**
     * Handle notification action
     * @param {Object} notification - The notification object
     */
    handleNotificationAction(notification) {
        if (!notification.action) return;
        
        switch (notification.action.type) {
            case 'navigate':
                // Navigate to page
                if (window.app && notification.action.page) {
                    window.app.navigateTo(notification.action.page, notification.action.params || {});
                }
                break;
            case 'url':
                // Open URL
                if (notification.action.url) {
                    window.open(notification.action.url, '_blank');
                }
                break;
            case 'function':
                // Call function
                if (notification.action.function && typeof window[notification.action.function] === 'function') {
                    window[notification.action.function](notification.action.params);
                }
                break;
            default:
                console.warn(`Unknown notification action type: ${notification.action.type}`);
        }
    }

    /**
     * Show notification toast
     * @param {Object} notification - The notification object
     */
    showNotificationToast(notification) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
            </div>
            <button class="toast-close">×</button>
        `;
        
        // Add event listener for close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            });
        }
        
        // Add event listener for toast click
        toast.addEventListener('click', () => {
            // Mark as read
            this.markAsRead(notification.id);
            
            // Handle notification action if available
            if (notification.action) {
                this.handleNotificationAction(notification);
            }
            
            // Close toast
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }
}

// Export the notifications manager
window.NotificationsManager = new NotificationsManager();
