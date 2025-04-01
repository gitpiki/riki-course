/**
 * Progress Tracker
 * Handles tracking and saving user progress through the course
 */

class ProgressTracker {
    constructor() {
        this.progress = {
            modules: {},
            assignments: {},
            lastActivity: null
        };
        this.initialized = false;
    }

    /**
     * Initialize the progress tracker
     */
    async init() {
        if (this.initialized) return true;
        
        try {
            // Load saved progress from local storage
            this.loadProgress();
            
            // Sync with server if available
            await this.syncWithServer();
            
            this.initialized = true;
            console.log('Progress tracker initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing progress tracker:', error);
            return false;
        }
    }

    /**
     * Load progress from local storage
     */
    loadProgress() {
        const savedProgress = localStorage.getItem('courseProgress');
        if (savedProgress) {
            try {
                this.progress = JSON.parse(savedProgress);
                console.log('Progress loaded from local storage');
            } catch (error) {
                console.error('Error parsing saved progress:', error);
                this.progress = {
                    modules: {},
                    assignments: {},
                    lastActivity: null
                };
            }
        }
    }

    /**
     * Save progress to local storage
     */
    saveProgress() {
        try {
            localStorage.setItem('courseProgress', JSON.stringify(this.progress));
            console.log('Progress saved to local storage');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    /**
     * Sync progress with server
     */
    async syncWithServer() {
        if (!window.API) return;
        
        try {
            // Check if server API is available
            if (window.API === window.ServerAPI) {
                // Send progress to server
                await window.API.updateProgress(this.progress);
                
                // Get latest progress from server
                const serverProgress = await window.API.getProgress();
                
                // Merge server progress with local progress
                this.mergeProgress(serverProgress);
                
                console.log('Progress synced with server');
            }
        } catch (error) {
            console.error('Error syncing progress with server:', error);
        }
    }

    /**
     * Merge progress data
     * @param {Object} serverProgress - Progress data from server
     */
    mergeProgress(serverProgress) {
        if (!serverProgress) return;
        
        // Merge module progress
        if (serverProgress.modules) {
            Object.entries(serverProgress.modules).forEach(([moduleId, moduleProgress]) => {
                if (!this.progress.modules[moduleId] || 
                    new Date(serverProgress.modules[moduleId].lastUpdated) > 
                    new Date(this.progress.modules[moduleId].lastUpdated)) {
                    this.progress.modules[moduleId] = moduleProgress;
                }
            });
        }
        
        // Merge assignment progress
        if (serverProgress.assignments) {
            Object.entries(serverProgress.assignments).forEach(([assignmentId, assignmentProgress]) => {
                if (!this.progress.assignments[assignmentId] || 
                    new Date(serverProgress.assignments[assignmentId].lastUpdated) > 
                    new Date(this.progress.assignments[assignmentId].lastUpdated)) {
                    this.progress.assignments[assignmentId] = assignmentProgress;
                }
            });
        }
        
        // Update last activity
        if (serverProgress.lastActivity && 
            (!this.progress.lastActivity || 
             new Date(serverProgress.lastActivity) > new Date(this.progress.lastActivity))) {
            this.progress.lastActivity = serverProgress.lastActivity;
        }
        
        // Save merged progress
        this.saveProgress();
    }

    /**
     * Update module progress
     * @param {string} moduleId - The module ID
     * @param {number} progress - The progress percentage (0-100)
     */
    updateModuleProgress(moduleId, progress) {
        if (!moduleId) return;
        
        // Create module progress object if it doesn't exist
        if (!this.progress.modules[moduleId]) {
            this.progress.modules[moduleId] = {
                progress: 0,
                completedUnits: [],
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Update progress
        this.progress.modules[moduleId].progress = progress;
        this.progress.modules[moduleId].lastUpdated = new Date().toISOString();
        
        // Update last activity
        this.progress.lastActivity = new Date().toISOString();
        
        // Save progress
        this.saveProgress();
        
        // Sync with server
        this.syncWithServer();
    }

    /**
     * Update unit completion status
     * @param {string} moduleId - The module ID
     * @param {string} unitId - The unit ID
     * @param {boolean} completed - Whether the unit is completed
     */
    updateUnitCompletion(moduleId, unitId, completed) {
        if (!moduleId || !unitId) return;
        
        // Create module progress object if it doesn't exist
        if (!this.progress.modules[moduleId]) {
            this.progress.modules[moduleId] = {
                progress: 0,
                completedUnits: [],
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Update completed units
        const completedUnits = this.progress.modules[moduleId].completedUnits || [];
        
        if (completed && !completedUnits.includes(unitId)) {
            completedUnits.push(unitId);
        } else if (!completed && completedUnits.includes(unitId)) {
            const index = completedUnits.indexOf(unitId);
            if (index !== -1) {
                completedUnits.splice(index, 1);
            }
        }
        
        this.progress.modules[moduleId].completedUnits = completedUnits;
        this.progress.modules[moduleId].lastUpdated = new Date().toISOString();
        
        // Update last activity
        this.progress.lastActivity = new Date().toISOString();
        
        // Save progress
        this.saveProgress();
        
        // Sync with server
        this.syncWithServer();
        
        // Update content loader if available
        if (window.ContentLoader) {
            window.ContentLoader.updateUnitCompletion(unitId, completed);
        }
    }

    /**
     * Update assignment progress
     * @param {string} assignmentId - The assignment ID
     * @param {string} status - The assignment status
     * @param {Object} data - Additional assignment data
     */
    updateAssignmentProgress(assignmentId, status, data = {}) {
        if (!assignmentId) return;
        
        // Create assignment progress object if it doesn't exist
        if (!this.progress.assignments[assignmentId]) {
            this.progress.assignments[assignmentId] = {
                status: 'not-started',
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Update status
        this.progress.assignments[assignmentId].status = status;
        this.progress.assignments[assignmentId].lastUpdated = new Date().toISOString();
        
        // Add additional data
        Object.entries(data).forEach(([key, value]) => {
            this.progress.assignments[assignmentId][key] = value;
        });
        
        // Update last activity
        this.progress.lastActivity = new Date().toISOString();
        
        // Save progress
        this.saveProgress();
        
        // Sync with server
        this.syncWithServer();
    }

    /**
     * Get module progress
     * @param {string} moduleId - The module ID
     * @returns {Object} The module progress object
     */
    getModuleProgress(moduleId) {
        if (!moduleId || !this.progress.modules[moduleId]) {
            return {
                progress: 0,
                completedUnits: [],
                lastUpdated: null
            };
        }
        
        return this.progress.modules[moduleId];
    }

    /**
     * Get assignment progress
     * @param {string} assignmentId - The assignment ID
     * @returns {Object} The assignment progress object
     */
    getAssignmentProgress(assignmentId) {
        if (!assignmentId || !this.progress.assignments[assignmentId]) {
            return {
                status: 'not-started',
                lastUpdated: null
            };
        }
        
        return this.progress.assignments[assignmentId];
    }

    /**
     * Get overall course progress
     * @returns {number} The overall progress percentage (0-100)
     */
    getOverallProgress() {
        // Calculate progress based on completed modules and assignments
        const moduleCount = Object.keys(this.progress.modules).length;
        const assignmentCount = Object.keys(this.progress.assignments).length;
        
        if (moduleCount === 0 && assignmentCount === 0) {
            return 0;
        }
        
        let totalProgress = 0;
        
        // Add module progress
        if (moduleCount > 0) {
            const moduleProgress = Object.values(this.progress.modules)
                .reduce((sum, module) => sum + (module.progress || 0), 0) / moduleCount;
            totalProgress += moduleProgress * 0.7; // Modules are 70% of overall progress
        }
        
        // Add assignment progress
        if (assignmentCount > 0) {
            const completedAssignments = Object.values(this.progress.assignments)
                .filter(assignment => assignment.status === 'completed').length;
            const assignmentProgress = (completedAssignments / assignmentCount) * 100;
            totalProgress += assignmentProgress * 0.3; // Assignments are 30% of overall progress
        }
        
        return Math.round(totalProgress);
    }

    /**
     * Get last activity timestamp
     * @returns {string} The last activity timestamp
     */
    getLastActivity() {
        return this.progress.lastActivity;
    }

    /**
     * Reset progress
     */
    resetProgress() {
        this.progress = {
            modules: {},
            assignments: {},
            lastActivity: null
        };
        
        // Save progress
        this.saveProgress();
        
        // Sync with server
        this.syncWithServer();
    }
}

// Export the progress tracker
window.ProgressTracker = new ProgressTracker();
