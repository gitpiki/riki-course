/**
 * Main Application
 * Handles the main application functionality and routing
 */

class App {
    constructor() {
        this.currentPage = null;
        this.currentParams = {};
        this.components = {};
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Show loading indicator
            this.showLoading();
            
            // Initialize API
            console.log('Initializing API...');
            
            // Try to initialize server API first
            let apiInitialized = false;
            
            if (window.ServerAPI) {
                apiInitialized = await window.ServerAPI.init();
                if (apiInitialized) {
                    // Use server API
                    window.API = window.ServerAPI;
                    console.log('Using Server API');
                }
            }
            
            // Fall back to mock API if server API is not available
            if (!apiInitialized && window.APIMock) {
                apiInitialized = await window.APIMock.init();
                if (apiInitialized) {
                    // Use mock API
                    window.API = window.APIMock;
                    console.log('Using Mock API');
                }
            }
            
            if (!apiInitialized) {
                throw new Error('Failed to initialize API');
            }
            
            // Initialize content loader
            console.log('Initializing content loader...');
            if (window.ContentLoader) {
                await window.ContentLoader.init();
            }
            
            // Initialize components
            this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Handle initial route
            this.handleRoute();
            
            // Hide loading indicator
            this.hideLoading();
            
            this.initialized = true;
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('אירעה שגיאה באתחול האפליקציה. אנא רענן את הדף ונסה שוב.');
            this.hideLoading();
        }
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Initialize dashboard components
        this.components = {
            'dashboard': window.DashboardHome ? new window.DashboardHome() : null,
            'course-content': window.CourseContent ? new window.CourseContent() : null,
            'assignments': window.Assignments ? new window.Assignments() : null,
            'analytics': window.Analytics ? new window.Analytics() : null,
            'ai-tools': window.AITools ? new window.AITools() : null,
            'communication': null, // Not implemented yet
            'settings': null // Not implemented yet
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // User menu toggle
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', () => {
                const userMenu = document.querySelector('.user-menu');
                if (userMenu) {
                    userMenu.classList.toggle('active');
                }
            });
        }
        
        // Notifications toggle
        const notificationsToggle = document.querySelector('.notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('click', () => {
                const notificationsPanel = document.querySelector('.notifications-panel');
                if (notificationsPanel) {
                    notificationsPanel.classList.toggle('active');
                }
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (event) => {
            const userMenu = document.querySelector('.user-menu');
            const userMenuToggle = document.querySelector('.user-menu-toggle');
            const notificationsPanel = document.querySelector('.notifications-panel');
            const notificationsToggle = document.querySelector('.notifications-toggle');
            
            if (userMenu && userMenu.classList.contains('active') && 
                !userMenu.contains(event.target) && 
                !userMenuToggle.contains(event.target)) {
                userMenu.classList.remove('active');
            }
            
            if (notificationsPanel && notificationsPanel.classList.contains('active') && 
                !notificationsPanel.contains(event.target) && 
                !notificationsToggle.contains(event.target)) {
                notificationsPanel.classList.remove('active');
            }
        });
        
        // Theme toggle
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                document.body.classList.toggle('dark-theme');
                
                // Save theme preference
                const isDarkTheme = document.body.classList.contains('dark-theme');
                localStorage.setItem('darkTheme', isDarkTheme);
            });
            
            // Set initial theme based on saved preference
            const savedTheme = localStorage.getItem('darkTheme');
            if (savedTheme === 'true') {
                document.body.classList.add('dark-theme');
                themeToggle.checked = true;
            }
        }
        
        // Font size controls
        const increaseFontBtn = document.querySelector('#increase-font');
        const decreaseFontBtn = document.querySelector('#decrease-font');
        const resetFontBtn = document.querySelector('#reset-font');
        
        if (increaseFontBtn && decreaseFontBtn && resetFontBtn) {
            // Set initial font size based on saved preference
            const savedFontSize = localStorage.getItem('fontSize');
            if (savedFontSize) {
                document.documentElement.style.fontSize = savedFontSize;
            }
            
            increaseFontBtn.addEventListener('click', () => {
                const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const newSize = currentSize * 1.1;
                document.documentElement.style.fontSize = `${newSize}px`;
                localStorage.setItem('fontSize', `${newSize}px`);
            });
            
            decreaseFontBtn.addEventListener('click', () => {
                const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const newSize = currentSize * 0.9;
                document.documentElement.style.fontSize = `${newSize}px`;
                localStorage.setItem('fontSize', `${newSize}px`);
            });
            
            resetFontBtn.addEventListener('click', () => {
                document.documentElement.style.fontSize = '16px';
                localStorage.removeItem('fontSize');
            });
        }
    }

    /**
     * Handle the current route
     */
    handleRoute() {
        // Get the current page from the URL
        const url = new URL(window.location.href);
        const page = url.searchParams.get('page') || 'dashboard';
        
        // Get additional parameters
        const params = {};
        for (const [key, value] of url.searchParams.entries()) {
            if (key !== 'page') {
                params[key] = value;
            }
        }
        
        // Load the page
        this.loadPage(page, params);
    }

    /**
     * Navigate to a page
     * @param {string} page - The page to navigate to
     * @param {Object} params - Additional parameters
     */
    navigateTo(page, params = {}) {
        // Create URL with parameters
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        
        // Add additional parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        // Update browser history
        window.history.pushState({}, '', url);
        
        // Load the page
        this.loadPage(page, params);
    }

    /**
     * Load a page
     * @param {string} page - The page to load
     * @param {Object} params - Additional parameters
     */
    async loadPage(page, params = {}) {
        try {
            // Show loading indicator
            this.showLoading();
            
            // Update current page and params
            this.currentPage = page;
            this.currentParams = params;
            
            // Update active navigation link
            this.updateActiveNavLink(page);
            
            // Get the component for the page
            const component = this.components[page];
            
            if (!component) {
                throw new Error(`Component not found for page: ${page}`);
            }
            
            // Render the component
            const content = await component.render(params);
            
            // Update the main content area
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = '';
                mainContent.appendChild(content);
            }
            
            // Hide loading indicator
            this.hideLoading();
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            console.log(`Page loaded: ${page}`);
        } catch (error) {
            console.error(`Error loading page ${page}:`, error);
            this.showError(`אירעה שגיאה בטעינת העמוד. אנא נסה שוב מאוחר יותר.`);
            this.hideLoading();
        }
    }

    /**
     * Update the active navigation link
     * @param {string} page - The current page
     */
    updateActiveNavLink(page) {
        // Remove active class from all navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the current page's navigation link
        const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('active');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
    }

    /**
     * Show error message
     * @param {string} message - The error message
     */
    showError(message) {
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.add('active');
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorContainer.classList.remove('active');
            }, 5000);
        }
    }

    /**
     * Show success message
     * @param {string} message - The success message
     */
    showSuccess(message) {
        const successContainer = document.querySelector('.success-container');
        if (successContainer) {
            successContainer.textContent = message;
            successContainer.classList.add('active');
            
            // Hide success after 3 seconds
            setTimeout(() => {
                successContainer.classList.remove('active');
            }, 3000);
        }
    }
}

// Create global functions for showing messages
window.showErrorMessage = function(message) {
    if (window.app) {
        window.app.showError(message);
    }
};

window.showSuccessMessage = function(message) {
    if (window.app) {
        window.app.showSuccess(message);
    }
};

// Create global function for navigation
window.loadPage = function(page, params = {}) {
    if (window.app) {
        window.app.navigateTo(page, params);
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
