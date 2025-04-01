/**
 * Analytics Component
 * Handles the analytics and performance visualization functionality
 */

class Analytics {
    constructor() {
        this.template = document.getElementById('analytics-template');
        this.analyticsData = null;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Analytics data
     */
    async init(data) {
        if (!data) {
            try {
                // Fetch analytics data from API
                this.analyticsData = await API.analytics.getAnalyticsData();
            } catch (error) {
                console.error('Error loading analytics data:', error);
                showErrorMessage('אירעה שגיאה בטעינת נתוני האנליטיקה. אנא נסה שוב מאוחר יותר.');
                this.analyticsData = null;
            }
        } else {
            this.analyticsData = data;
        }
    }

    /**
     * Render the analytics view
     * @returns {HTMLElement} The rendered analytics content
     */
    async render() {
        // Initialize data if needed
        if (!this.analyticsData) {
            await this.init();
        }
        
        // Clone the template content
        const content = this.template.content.cloneNode(true);
        
        // Initialize charts and visualizations
        this.initializeCharts(content);
        
        // Setup event listeners
        this.setupEventListeners(content);
        
        return content;
    }
    
    /**
     * Initialize charts and visualizations
     * @param {HTMLElement} content - The content element
     */
    initializeCharts(content) {
        if (!this.analyticsData) return;
        
        // Initialize progress over time chart
        const progressChartCanvas = content.querySelector('#progress-chart');
        if (progressChartCanvas) {
            this.createProgressChart(progressChartCanvas);
        }
        
        // Initialize performance by module chart
        const modulePerformanceCanvas = content.querySelector('#module-performance-chart');
        if (modulePerformanceCanvas) {
            this.createModulePerformanceChart(modulePerformanceCanvas);
        }
        
        // Initialize skills heat map
        const skillsHeatMapCanvas = content.querySelector('#skills-heatmap');
        if (skillsHeatMapCanvas) {
            this.createSkillsHeatMap(skillsHeatMapCanvas);
        }
        
        // Initialize time spent analysis chart
        const timeSpentCanvas = content.querySelector('#time-spent-chart');
        if (timeSpentCanvas) {
            this.createTimeSpentChart(timeSpentCanvas);
        }
        
        // Update summary metrics
        this.updateSummaryMetrics(content);
    }
    
    /**
     * Create progress over time chart
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    createProgressChart(canvas) {
        const progressData = this.analyticsData.progressOverTime;
        
        const data = {
            labels: progressData.labels,
            datasets: [{
                label: 'התקדמות בקורס',
                data: progressData.values,
                backgroundColor: 'rgba(30, 136, 229, 0.2)',
                borderColor: 'rgba(30, 136, 229, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
        
        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'אחוז השלמה'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'תאריך'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `התקדמות: ${context.parsed.y}%`;
                        }
                    }
                }
            }
        };
        
        // Create chart using Chart.js
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
     * Create module performance chart
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    createModulePerformanceChart(canvas) {
        const moduleData = this.analyticsData.modulePerformance;
        
        const data = {
            labels: moduleData.modules,
            datasets: [{
                label: 'ציון',
                data: moduleData.grades,
                backgroundColor: moduleData.grades.map(grade => {
                    if (grade >= 90) return 'rgba(76, 175, 80, 0.7)';
                    if (grade >= 75) return 'rgba(255, 193, 7, 0.7)';
                    if (grade >= 60) return 'rgba(255, 152, 0, 0.7)';
                    return 'rgba(244, 67, 54, 0.7)';
                }),
                borderWidth: 1
            }]
        };
        
        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'ציון'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'מודול'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `ציון: ${context.parsed.y}/100`;
                        }
                    }
                }
            }
        };
        
        // Create chart using Chart.js
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
     * Create skills heat map
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    createSkillsHeatMap(canvas) {
        const skillsData = this.analyticsData.skillsHeatMap;
        
        // Create a custom heat map visualization
        const heatMapContainer = document.createElement('div');
        heatMapContainer.className = 'skills-heatmap-container';
        
        skillsData.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            
            // Determine color based on proficiency level
            let colorClass = '';
            if (skill.level >= 90) colorClass = 'level-expert';
            else if (skill.level >= 75) colorClass = 'level-advanced';
            else if (skill.level >= 60) colorClass = 'level-intermediate';
            else if (skill.level >= 40) colorClass = 'level-basic';
            else colorClass = 'level-novice';
            
            skillItem.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-bar-container">
                    <div class="skill-bar ${colorClass}" style="width: ${skill.level}%"></div>
                </div>
                <div class="skill-level">${skill.level}%</div>
            `;
            
            heatMapContainer.appendChild(skillItem);
        });
        
        // Replace canvas with custom heat map
        canvas.parentNode.replaceChild(heatMapContainer, canvas);
    }
    
    /**
     * Create time spent analysis chart
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    createTimeSpentChart(canvas) {
        const timeData = this.analyticsData.timeSpentAnalysis;
        
        const data = {
            labels: timeData.categories,
            datasets: [{
                label: 'זמן שהושקע (שעות)',
                data: timeData.hours,
                backgroundColor: [
                    'rgba(30, 136, 229, 0.7)',
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(123, 31, 162, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ],
                borderWidth: 1
            }]
        };
        
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} שעות (${percentage}%)`;
                        }
                    }
                }
            }
        };
        
        // Create chart using Chart.js
        if (typeof Chart !== 'undefined') {
            new Chart(canvas, {
                type: 'pie',
                data: data,
                options: options
            });
        } else {
            console.error('Chart.js is not loaded');
            canvas.parentNode.innerHTML = '<div class="chart-error">לא ניתן לטעון את התרשים</div>';
        }
    }
    
    /**
     * Update summary metrics in the analytics view
     * @param {HTMLElement} content - The content element
     */
    updateSummaryMetrics(content) {
        if (!this.analyticsData || !this.analyticsData.summary) return;
        
        const summary = this.analyticsData.summary;
        
        // Update overall progress
        const overallProgressElement = content.querySelector('.metric-overall-progress .metric-value');
        if (overallProgressElement) {
            overallProgressElement.textContent = `${summary.overallProgress}%`;
        }
        
        // Update average grade
        const averageGradeElement = content.querySelector('.metric-average-grade .metric-value');
        if (averageGradeElement) {
            averageGradeElement.textContent = `${summary.averageGrade}/100`;
        }
        
        // Update completed assignments
        const completedAssignmentsElement = content.querySelector('.metric-completed-assignments .metric-value');
        if (completedAssignmentsElement) {
            completedAssignmentsElement.textContent = `${summary.completedAssignments}/${summary.totalAssignments}`;
        }
        
        // Update total time spent
        const timeSpentElement = content.querySelector('.metric-time-spent .metric-value');
        if (timeSpentElement) {
            timeSpentElement.textContent = `${summary.totalHours} שעות`;
        }
        
        // Update class rank if available (for students)
        const classRankElement = content.querySelector('.metric-class-rank .metric-value');
        if (classRankElement && summary.classRank) {
            classRankElement.textContent = `${summary.classRank}/${summary.totalStudents}`;
        } else if (classRankElement) {
            classRankElement.closest('.metric-card').style.display = 'none';
        }
    }
    
    /**
     * Set up event listeners for analytics elements
     * @param {HTMLElement} content - The content element
     */
    setupEventListeners(content) {
        // Time period selector
        const periodSelectors = content.querySelectorAll('.period-selector button');
        periodSelectors.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                periodSelectors.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update charts based on selected period
                const period = button.dataset.period;
                this.updateChartsForPeriod(content, period);
            });
        });
        
        // Comparison toggle (for students)
        const comparisonToggle = content.querySelector('#comparison-toggle');
        if (comparisonToggle) {
            comparisonToggle.addEventListener('change', () => {
                this.toggleClassComparison(content, comparisonToggle.checked);
            });
        }
    }
    
    /**
     * Update charts based on selected time period
     * @param {HTMLElement} content - The content element
     * @param {string} period - The selected time period
     */
    updateChartsForPeriod(content, period) {
        // This would fetch new data from the API based on the selected period
        // For now, we'll just log the selected period
        console.log(`Updating charts for period: ${period}`);
        
        // In a real implementation, this would:
        // 1. Fetch new data for the selected period
        // 2. Update all charts with the new data
    }
    
    /**
     * Toggle class comparison in charts
     * @param {HTMLElement} content - The content element
     * @param {boolean} showComparison - Whether to show class comparison
     */
    toggleClassComparison(content, showComparison) {
        // This would update charts to show/hide class average comparison
        console.log(`Toggling class comparison: ${showComparison}`);
        
        // In a real implementation, this would:
        // 1. Update charts to include/exclude class average data
    }
}

// Export the component
window.Analytics = Analytics;
