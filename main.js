// עדכון קובץ main.js לשימוש ב-API

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Load the default page (dashboard)
    loadPage('dashboard');
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Initialize the dashboard
 */
async function initDashboard() {
    console.log('Dashboard initialized');
    
    try {
        // טעינת פרטי המשתמש
        const user = await API.user.getUser();
        updateUserInfo(user);
        
        // טעינת נתוני לוח המחוונים
        await loadDashboardData();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorMessage('אירעה שגיאה בטעינת הדאשבורד. אנא נסה שוב מאוחר יותר.');
    }
}

/**
 * עדכון פרטי המשתמש בממשק
 */
function updateUserInfo(user) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    const userAvatarElement = document.querySelector('.user-avatar');
    if (userAvatarElement) {
        // יצירת ראשי תיבות מהשם
        const initials = user.name.split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
        userAvatarElement.textContent = initials;
    }
}

/**
 * טעינת נתוני לוח המחוונים
 */
async function loadDashboardData() {
    try {
        const dashboardData = await API.dashboard.getDashboardData();
        
        // עדכון התקדמות כללית
        updateOverallProgress(dashboardData.overallProgress);
        
        // עדכון התקדמות במודולים הנוכחיים
        updateCurrentModules(dashboardData.currentModules);
        
        // עדכון משימות קרובות
        updateUpcomingAssignments(dashboardData.upcomingAssignments);
        
        // עדכון התראות אחרונות
        updateRecentNotifications(dashboardData.recentNotifications);
        
        // עדכון פעילויות אחרונות
        updateRecentActivities(dashboardData.recentActivities);
        
        // עדכון ביצועים
        updatePerformance(dashboardData.performance);
        
        // עדכון כלי AI פופולריים
        updatePopularAITools(dashboardData.popularAiTools);
        
        // עדכון מספר ההתראות שלא נקראו
        updateNotificationBadge(dashboardData.recentNotifications.filter(n => !n.read).length);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('אירעה שגיאה בטעינת נתוני הדאשבורד. אנא נסה שוב מאוחר יותר.');
    }
}

/**
 * עדכון התקדמות כללית
 */
function updateOverallProgress(progress) {
    const progressElement = document.querySelector('.progress-fill');
    if (progressElement) {
        progressElement.style.width = `${progress}%`;
    }
    
    const progressTextElement = document.querySelector('.progress-text span:last-child');
    if (progressTextElement) {
        progressTextElement.textContent = `${progress}%`;
    }
}

/**
 * עדכון התקדמות במודולים הנוכחיים
 */
function updateCurrentModules(modules) {
    modules.forEach(module => {
        const moduleProgressElement = document.querySelector(`.module-${module.id} .progress-fill`);
        if (moduleProgressElement) {
            moduleProgressElement.style.width = `${module.progress}%`;
        }
        
        const moduleProgressTextElement = document.querySelector(`.module-${module.id} .progress-text span:last-child`);
        if (moduleProgressTextElement) {
            moduleProgressTextElement.textContent = `${module.progress}%`;
        }
    });
}

/**
 * עדכון משימות קרובות
 */
function updateUpcomingAssignments(assignments) {
    const assignmentsListElement = document.querySelector('.upcoming-assignments');
    if (!assignmentsListElement) return;
    
    assignmentsListElement.innerHTML = '';
    
    assignments.forEach(assignment => {
        // חישוב ימים שנותרו
        const dueDate = new Date(assignment.dueDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let statusClass = 'status-not-started';
        let daysText = '';
        
        if (assignment.status === 'completed') {
            statusClass = 'status-completed';
            daysText = 'הושלם';
        } else if (assignment.status === 'overdue') {
            statusClass = 'status-overdue';
            daysText = `איחור: יום ${Math.abs(diffDays)}`;
        } else if (diffDays <= 0) {
            statusClass = 'status-overdue';
            daysText = 'היום';
        } else if (diffDays === 1) {
            statusClass = 'status-pending';
            daysText = 'מחר';
        } else {
            statusClass = 'status-pending';
            daysText = `${diffDays} ימים`;
        }
        
        const assignmentItem = document.createElement('li');
        assignmentItem.className = 'task-item';
        assignmentItem.innerHTML = `
            <div class="task-name">
                <div class="task-status ${statusClass}"></div>
                ${assignment.title}
            </div>
            <div class="task-due">${daysText}</div>
        `;
        
        assignmentsListElement.appendChild(assignmentItem);
    });
}

/**
 * עדכון התראות אחרונות
 */
function updateRecentNotifications(notifications) {
    const notificationsListElement = document.querySelector('.notifications-list');
    if (!notificationsListElement) return;
    
    notificationsListElement.innerHTML = '';
    
    notifications.forEach(notification => {
        // חישוב זמן יחסי
        const notificationTime = new Date(notification.timestamp);
        const now = new Date();
        const diffTime = now - notificationTime;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        
        let timeText = '';
        if (diffHours < 1) {
            timeText = 'לפני פחות משעה';
        } else if (diffHours === 1) {
            timeText = 'לפני שעה';
        } else if (diffHours < 24) {
            timeText = `לפני ${diffHours} שעות`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) {
                timeText = 'לפני יום';
            } else {
                timeText = `לפני ${diffDays} ימים`;
            }
        }
        
        const notificationItem = document.createElement('li');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
            <div class="notification-content">${notification.title}</div>
            <div class="notification-time">${timeText}</div>
        `;
        
        notificationsListElement.appendChild(notificationItem);
    });
}

/**
 * עדכון פעילויות אחרונות
 */
function updateRecentActivities(activities) {
    const activitiesListElement = document.querySelector('.activities-list');
    if (!activitiesListElement) return;
    
    activitiesListElement.innerHTML = '';
    
    activities.forEach(activity => {
        // חישוב זמן יחסי
        const activityTime = new Date(activity.timestamp);
        const now = new Date();
        const diffTime = now - activityTime;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        
        let timeText = '';
        if (diffHours < 1) {
            timeText = 'לפני פחות משעה';
        } else if (diffHours === 1) {
            timeText = 'לפני שעה';
        } else if (diffHours < 24) {
            timeText = `לפני ${diffHours} שעות`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) {
                timeText = 'לפני יום';
            } else {
                timeText = `לפני ${diffDays} ימים`;
            }
        }
        
        let iconClass = 'fas fa-info-circle';
        if (activity.type === 'assignment') {
            iconClass = 'fas fa-tasks';
        } else if (activity.type === 'content') {
            iconClass = 'fas fa-book';
        } else if (activity.type === 'forum') {
            iconClass = 'fas fa-comments';
        }
        
        const activityItem = document.createElement('li');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon"><i class="${iconClass}"></i></div>
            <div class="activity-details">
                <div class="activity-text">${activity.title}</div>
                <div class="activity-time">${timeText}</div>
            </div>
        `;
        
        activitiesListElement.appendChild(activityItem);
    });
}

/**
 * עדכון ביצועים
 */
function updatePerformance(performance) {
    const averageElement = document.querySelector('.performance-average');
    if (averageElement) {
        averageElement.textContent = performance.averageGrade ? `${performance.averageGrade}/100` : 'אין נתונים';
    }
    
    const trendElement = document.querySelector('.performance-trend');
    if (trendElement) {
        let trendText = 'יציבה';
        if (performance.trend === 'rising') {
            trendText = 'עולה';
        } else if (performance.trend === 'falling') {
            trendText = 'יורדת';
        }
        trendElement.textContent = trendText;
    }
}

/**
 * עדכון כלי AI פופולריים
 */
function updatePopularAITools(tools) {
    const toolsContainer = document.querySelector('.ai-tools');
    if (!toolsContainer) return;
    
    toolsContainer.innerHTML = '';
    
    tools.forEach(tool => {
        let iconClass = 'fas fa-robot';
        if (tool.icon === 'chat') {
            iconClass = 'fas fa-comments';
        } else if (tool.icon === 'code') {
            iconClass = 'fas fa-code';
        } else if (tool.icon === 'image') {
            iconClass = 'fas fa-image';
        } else if (tool.icon === 'chart') {
            iconClass = 'fas fa-chart-bar';
        }
        
        const toolElement = document.createElement('div');
        toolElement.className = 'ai-tool';
        toolElement.setAttribute('data-tool', tool.name.toLowerCase().replace(' ', '-'));
        toolElement.innerHTML = `
            <div class="ai-tool-icon"><i class="${iconClass}"></i></div>
            <div class="ai-tool-name">${tool.name}</div>
        `;
        
        toolsContainer.appendChild(toolElement);
    });
}

/**
 * עדכון מספר ההתראות שלא נקראו
 */
function updateNotificationBadge(count) {
    const badgeElement = document.querySelector('.notification-badge');
    if (badgeElement) {
        badgeElement.textContent = count;
        badgeElement.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * הצגת הודעת שגיאה
 */
function showErrorMessage(message) {
    // יצירת אלמנט הודעת שגיאה
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // הוספת האלמנט לדף
    document.body.appendChild(errorElement);
    
    // הסרת האלמנט לאחר 5 שניות
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation menu items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            loadPage(page);
            
            // Update active state
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', toggleUserMenu);
    }
    
    // Notifications dropdown
    const notifications = document.querySelector('.notifications');
    if (notifications) {
        notifications.addEventListener('click', toggleNotificationsMenu);
    }
    
    // Search functionality
    const searchBar = document.querySelector('.search-bar input');
    if (searchBar) {
        searchBar.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchContent(this.value);
            }
        });
    }
}

/**
 * Toggle sidebar visibility (for responsive design)
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Update toggle icon
    const toggleIcon = document.querySelector('.sidebar-toggle i');
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.className = 'fas fa-chevron-left';
    } else {
        toggleIcon.className = 'fas fa-chevron-right';
    }
}

/**
 * Toggle user menu dropdown
 */
function toggleUserMenu() {
    // Implementation would create and toggle a dropdown menu
    console.log('Toggle user menu');
}

/**
 * Toggle notifications dropdown
 */
function toggleNotificationsMenu() {
    // Implementation would create and toggle a notifications dropdown
    console.log('Toggle notifications menu');
}

/**
 * Search content across the dashboard
 * @param {string} query - Search query
 */
function searchContent(query) {
    console.log('Searching for:', query);
    // Implementation would search across dashboard content
    // and display results
}

/**
 * Load a specific page into the main content area
 * @param {string} page - Page identifier
 */
async function loadPage(page) {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById(`${page}-template`);
    
    if (template) {
        pageContent.innerHTML = template.innerHTML;
        
        // Setup page-specific event listeners
        setupPageEventListeners(page);
        
        // Initialize page-specific components
        await initPageComponents(page);
        
        console.log(`Loaded page: ${page}`);
    } else {
        console.error(`Template not found for page: ${page}`);
        pageContent.innerHTML = '<div class="error-message">Page not found</div>';
    }
}

/**
 * Setup event listeners specific to a page
 * @param {string} page - Page identifier
 */
function setupPageEventListeners(page) {
    switch(page) {
        case 'dashboard':
            setupDashboardEventListeners();
            break;
        case 'course-content':
            setupCourseContentEventListeners();
            break;
        case 'assignments':
            setupAssignmentsEventListeners();
            break;
        case 'analytics':
            setupAnalyticsEventListeners();
            break;
        case 'communication':
            setupCommunicationEventListeners();
            break;
        case 'ai-tools':
            setupAiToolsEventListeners();
            break;
    }
}

/**
 * Initialize components specific to a page
 * @param {string} page - Page identifier
 */
async function initPageComponents(page) {
    switch(page) {
        case 'dashboard':
            await initDashboardComponents();
            break;
        case 'course-content':
            await initCourseContentComponents();
            break;
        case 'assignments':
            await initAssignmentsComponents();
            break;
        case 'analytics':
            await initAnalyticsComponents();
            break;
        case 'communication':
            await initCommunicationComponents();
            break;
        case 'ai-tools':
            await initAiToolsComponents();
            break;
    }
}

/**
 * Initialize components for the dashboard page
 */
async function initDashboardComponents() {
    try {
        // טעינת נתוני לוח המחוונים
        await loadDashboardData();
        
        /
(Content truncated due to size limit. Use line ranges to read in chunks)