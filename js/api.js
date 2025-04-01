// קובץ אינטגרציה בין הפרונטאנד לבאקאנד
// מכיל פונקציות לביצוע קריאות API לשרת

// כתובת השרת
const API_URL = 'http://localhost:3000/api';

// פונקציה כללית לביצוע בקשות HTTP
async function fetchAPI(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'שגיאה בביצוע הבקשה');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// פונקציות לקבלת מידע על המשתמש
const userAPI = {
    // קבלת פרטי המשתמש
    getUser: () => fetchAPI('/user')
};

// פונקציות לניהול הקורס
const courseAPI = {
    // קבלת מידע על הקורס
    getCourse: () => fetchAPI('/course'),
    
    // קבלת מידע על מודול ספציפי
    getModule: (moduleId) => fetchAPI(`/modules/${moduleId}`),
    
    // קבלת מידע על יחידה ספציפית
    getUnit: (unitId) => fetchAPI(`/units/${unitId}`),
    
    // עדכון סטטוס של יחידה
    updateUnitStatus: (unitId, status) => fetchAPI(`/units/${unitId}/status`, 'PUT', { status })
};

// פונקציות לניהול משימות
const assignmentsAPI = {
    // קבלת כל המשימות
    getAssignments: () => fetchAPI('/assignments'),
    
    // קבלת משימה ספציפית
    getAssignment: (assignmentId) => fetchAPI(`/assignments/${assignmentId}`),
    
    // עדכון סטטוס של משימה
    updateAssignmentStatus: (assignmentId, status) => fetchAPI(`/assignments/${assignmentId}/status`, 'PUT', { status }),
    
    // הגשת משימה
    submitAssignment: (assignmentId, content) => fetchAPI(`/assignments/${assignmentId}/submit`, 'POST', { content })
};

// פונקציות לניהול התראות
const notificationsAPI = {
    // קבלת כל ההתראות
    getNotifications: () => fetchAPI('/notifications'),
    
    // סימון התראה כנקראה
    markAsRead: (notificationId) => fetchAPI(`/notifications/${notificationId}/read`, 'PUT')
};

// פונקציות לניהול פעילויות
const activitiesAPI = {
    // קבלת כל הפעילויות
    getActivities: () => fetchAPI('/activities')
};

// פונקציות לניהול פורומים
const forumsAPI = {
    // קבלת כל הפורומים
    getForums: () => fetchAPI('/forums'),
    
    // קבלת פורום ספציפי
    getForum: (forumId) => fetchAPI(`/forums/${forumId}`),
    
    // הוספת פוסט לפורום
    addPost: (forumId, content) => fetchAPI(`/forums/${forumId}/posts`, 'POST', { content }),
    
    // יצירת נושא חדש בפורום
    createThread: (title, content) => fetchAPI('/forums', 'POST', { title, content })
};

// פונקציות לניהול כלי AI
const aiToolsAPI = {
    // קבלת כל כלי ה-AI
    getAITools: () => fetchAPI('/ai-tools'),
    
    // קבלת כלי AI ספציפי
    getAITool: (toolId) => fetchAPI(`/ai-tools/${toolId}`)
};

// פונקציות לקבלת מידע ללוח המחוונים
const dashboardAPI = {
    // קבלת מידע ללוח המחוונים
    getDashboardData: () => fetchAPI('/dashboard')
};

// פונקציות לקבלת מידע אנליטי
const analyticsAPI = {
    // קבלת מידע אנליטי
    getAnalyticsData: () => fetchAPI('/analytics')
};

// ייצוא כל ה-API
const API = {
    user: userAPI,
    course: courseAPI,
    assignments: assignmentsAPI,
    notifications: notificationsAPI,
    activities: activitiesAPI,
    forums: forumsAPI,
    aiTools: aiToolsAPI,
    dashboard: dashboardAPI,
    analytics: analyticsAPI
};
