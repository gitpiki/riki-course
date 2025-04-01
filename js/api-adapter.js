/**
 * Server API Adapter
 * Provides API endpoints for the dashboard by connecting to the backend server
 */

class ServerAPIAdapter {
    constructor() {
        this.baseUrl = '/api';
        this.initialized = false;
    }

    /**
     * Initialize the API adapter
     */
    async init() {
        if (this.initialized) return true;
        
        try {
            // Check if server is available
            const response = await fetch(`${this.baseUrl}/status`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.initialized = true;
                console.log('Server API Adapter initialized successfully');
                return true;
            } else {
                console.error('Server API is not available');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Server API Adapter:', error);
            return false;
        }
    }

    /**
     * Make an API request
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} The API response
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        if (requestOptions.body && typeof requestOptions.body === 'object') {
            requestOptions.body = JSON.stringify(requestOptions.body);
        }
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error in API request to ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Get user data
     * @returns {Promise} User data
     */
    async getUser() {
        return this.request('/user');
    }

    /**
     * Get dashboard data
     * @returns {Promise} Dashboard data
     */
    async getDashboardData() {
        return this.request('/dashboard');
    }

    /**
     * Get all modules
     * @returns {Promise} Array of module objects
     */
    async getModules() {
        return this.request('/course/modules');
    }

    /**
     * Get a specific module
     * @param {string} moduleId - The module ID
     * @returns {Promise} The module object
     */
    async getModule(moduleId) {
        return this.request(`/course/modules/${moduleId}`);
    }

    /**
     * Get all assignments
     * @returns {Promise} Array of assignment objects
     */
    async getAssignments() {
        return this.request('/assignments');
    }

    /**
     * Get a specific assignment
     * @param {string} assignmentId - The assignment ID
     * @returns {Promise} The assignment object
     */
    async getAssignment(assignmentId) {
        return this.request(`/assignments/${assignmentId}`);
    }

    /**
     * Submit an assignment
     * @param {string} assignmentId - The assignment ID
     * @param {Object} submission - The submission data
     * @returns {Promise} The submission result
     */
    async submitAssignment(assignmentId, submission) {
        return this.request(`/assignments/${assignmentId}/submit`, {
            method: 'POST',
            body: submission
        });
    }

    /**
     * Get analytics data
     * @returns {Promise} Analytics data
     */
    async getAnalyticsData() {
        return this.request('/analytics');
    }

    /**
     * Get AI tools data
     * @returns {Promise} AI tools data
     */
    async getAITools() {
        return this.request('/ai-tools');
    }

    /**
     * Get a specific AI tool
     * @param {string} toolId - The tool ID
     * @returns {Promise} The AI tool object
     */
    async getAITool(toolId) {
        return this.request(`/ai-tools/${toolId}`);
    }

    /**
     * Get a specific prompt
     * @param {string} promptId - The prompt ID
     * @returns {Promise} The prompt object
     */
    async getPrompt(promptId) {
        return this.request(`/ai-tools/prompts/${promptId}`);
    }

    /**
     * Get course structure
     * @returns {Promise} Course structure data
     */
    async getCourseStructure() {
        return this.request('/content/course-structure');
    }

    /**
     * Get module content
     * @param {string} moduleId - The module ID
     * @returns {Promise} Module content data
     */
    async getModuleContent(moduleId) {
        return this.request(`/content/modules/${moduleId}`);
    }
}

// Export the API adapter
window.ServerAPI = new ServerAPIAdapter();
