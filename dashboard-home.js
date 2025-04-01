/**
 * Dashboard Home Component
 * Handles the main dashboard view functionality
 */

class DashboardHome {
    constructor() {
        this.template = document.getElementById('dashboard-template');
    }

    /**
     * Render the dashboard home view
     * @returns {HTMLElement} The rendered dashboard content
     */
    render() {
        // Clone the template content
        const content = this.template.content.cloneNode(true);
        
        // Initialize dashboard components
        this.initializeCharts(content);
        this.setupEventListeners(content);
        
        return content;
    }
    
    /**
     * Initialize charts and visualizations
     * @param {HTMLElement} content - The dashboard content element
     */
    initializeCharts(content) {
        // Find the canvas element for the performance chart
        const performanceCanvas = content.querySelector('#performance-chart');
        if (performanceCanvas) {
            this.createPerformanceChart(performanceCanvas);
        }
        
        // Find the canvas element for the module progress chart
        const moduleProgressCanvas = content.querySelector('#module-progress-chart');
        if (moduleProgressCanvas) {
            this.createModuleProgressChart(moduleProgressCanvas);
        }
    }
    
    /**
     * Create performance chart
     * @param {HTMLCanvasElement} canvas - The canvas element for the chart
     */
    createPerformanceChart(canvas) {
        // Sample data - would be replaced with actual API data
        const data = {
            labels: ['משימה 1', 'משימה 2', 'משימה 3', 'משימה 4', 'משימה 5'],
            datasets: [{
                label: 'ציון',
                data: [85, 72, 90, 88, 95],
                backgroundColor: 'rgba(30, 136, 229, 0.2)',
                borderColor: 'rgba(30, 136, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(30, 136, 229, 1)',
                pointRadius: 4
            }]
        };
        
        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        
        // Create chart using Chart.js (would be loaded in the main HTML)
        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'line',
                data: data,
                options: options
            });
        } else {
            console.error('Chart.js is not loaded');
            canvas.parentNode.innerHTML = '<div class="chart-error">לא ניתן לטעון את התרשים</div>';
        }
    }
    
    /**
     * Create module progress chart
     * @param {HTMLCanvasElement} canvas - The canvas element for the chart
     */
    createModuleProgressChart(canvas) {
        // Sample data - would be replaced with actual API data
        const data = {
            labels: ['מודול 1', 'מודול 2', 'מודול 3', 'מודול 4', 'מודול 5', 'מודול 6', 'מודול 7', 'מודול 8', 'מודול 9', 'מודול 10'],
            datasets: [{
                label: 'התקדמות',
                data: [100, 100, 100, 90, 80, 40, 10, 0, 0, 0],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',  // Completed
                    'rgba(76, 175, 80, 0.8)',  // Completed
                    'rgba(76, 175, 80, 0.8)',  // Completed
                    'rgba(76, 175, 80, 0.8)',  // Almost completed
                    'rgba(76, 175, 80, 0.8)',  // In progress
                    'rgba(255, 152, 0, 0.8)',  // Just started
                    'rgba(255, 152, 0, 0.8)',  // Just started
                    'rgba(189, 189, 189, 0.5)', // Not started
                    'rgba(189, 189, 189, 0.5)', // Not started
                    'rgba(189, 189, 189, 0.5)'  // Not started
                ],
                borderWidth: 0
            }]
        };
        
        const options = {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        
        // Create chart using Chart.js (would be loaded in the main HTML)
        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'bar',
                data: data,
                options: options
            });
        } else {
            console.error('Chart.js is not loaded');
            canvas.parentNode.innerHTML = '<div class="chart-error">לא ניתן לטעון את התרשים</div>';
        }
    }
    
    /**
     * Set up event listeners for dashboard elements
     * @param {HTMLElement} content - The dashboard content element
     */
    setupEventListeners(content) {
        // Add event listeners for task items
        const taskItems = content.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            item.addEventListener('click', () => {
                // Navigate to the assignments page with the specific task
                const taskId = item.dataset.taskId;
                if (taskId) {
                    loadPage('assignments', { taskId });
                }
            });
        });
        
        // Add event listeners for AI tool cards
        const aiToolCards = content.querySelectorAll('.ai-tool-card');
        aiToolCards.forEach(card => {
            card.addEventListener('click', () => {
                // Navigate to the AI tools page with the specific tool
                const toolId = card.dataset.toolId;
                if (toolId) {
                    loadPage('ai-tools', { toolId });
                }
            });
        });
    }
}

// Export the component
window.DashboardHome = DashboardHome;
