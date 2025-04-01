/**
 * Assignments Component
 * Handles the assignments and projects view functionality
 */

class Assignments {
    constructor() {
        this.template = document.getElementById('assignments-template');
        this.assignments = [];
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Assignments data
     */
    async init(data) {
        if (!data) {
            try {
                // Fetch assignments data from API
                this.assignments = await API.assignments.getAssignments();
            } catch (error) {
                console.error('Error loading assignments:', error);
                showErrorMessage('אירעה שגיאה בטעינת המשימות. אנא נסה שוב מאוחר יותר.');
                this.assignments = [];
            }
        } else {
            this.assignments = data.assignments || [];
        }
    }

    /**
     * Render the assignments view
     * @param {Object} params - Optional parameters (assignmentId)
     * @returns {HTMLElement} The rendered assignments content
     */
    async render(params = {}) {
        // Initialize data if needed
        if (this.assignments.length === 0) {
            await this.init();
        }
        
        // Clone the template content
        const content = this.template.content.cloneNode(true);
        
        // Render assignments list
        this.renderAssignmentsList(content);
        
        // Render selected assignment details if specified
        if (params.assignmentId) {
            this.renderAssignmentDetails(content, params.assignmentId);
        } else if (this.assignments.length > 0) {
            // Default to first assignment if none specified
            this.renderAssignmentDetails(content, this.assignments[0].id);
        }
        
        // Setup event listeners
        this.setupEventListeners(content);
        
        return content;
    }
    
    /**
     * Render the assignments list
     * @param {HTMLElement} content - The content element
     */
    renderAssignmentsList(content) {
        const assignmentsList = content.querySelector('.assignments-list');
        if (!assignmentsList) return;
        
        assignmentsList.innerHTML = '';
        
        // Group assignments by type
        const groupedAssignments = {
            'weekly': { title: 'משימות שבועיות', items: [] },
            'midterm': { title: 'פרויקט אמצע', items: [] },
            'final': { title: 'פרויקט מסכם', items: [] }
        };
        
        // Sort assignments into groups
        this.assignments.forEach(assignment => {
            if (groupedAssignments[assignment.type]) {
                groupedAssignments[assignment.type].items.push(assignment);
            } else {
                // Default to weekly if type is unknown
                groupedAssignments['weekly'].items.push(assignment);
            }
        });
        
        // Create assignment groups
        Object.values(groupedAssignments).forEach(group => {
            if (group.items.length === 0) return;
            
            const groupElement = document.createElement('div');
            groupElement.className = 'assignment-group';
            groupElement.innerHTML = `<h3 class="group-title">${group.title}</h3>`;
            
            const itemsList = document.createElement('ul');
            itemsList.className = 'assignment-items';
            
            // Sort assignments by due date
            group.items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            // Create assignment items
            group.items.forEach(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const today = new Date();
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let statusClass = 'status-not-started';
                let statusText = 'לא התחיל';
                
                if (assignment.status === 'completed') {
                    statusClass = 'status-completed';
                    statusText = 'הושלם';
                } else if (assignment.status === 'in-progress') {
                    statusClass = 'status-in-progress';
                    statusText = 'בתהליך';
                } else if (diffDays < 0) {
                    statusClass = 'status-overdue';
                    statusText = 'באיחור';
                } else if (diffDays <= 2) {
                    statusClass = 'status-urgent';
                    statusText = 'דחוף';
                }
                
                const item = document.createElement('li');
                item.className = `assignment-item ${statusClass}`;
                item.dataset.assignmentId = assignment.id;
                
                item.innerHTML = `
                    <div class="assignment-info">
                        <div class="assignment-title">${assignment.title}</div>
                        <div class="assignment-meta">
                            <span class="assignment-due">תאריך הגשה: ${dueDate.toLocaleDateString('he-IL')}</span>
                            <span class="assignment-status">${statusText}</span>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn btn-view">צפייה</button>
                    </div>
                `;
                
                itemsList.appendChild(item);
            });
            
            groupElement.appendChild(itemsList);
            assignmentsList.appendChild(groupElement);
        });
    }
    
    /**
     * Render the details of a specific assignment
     * @param {HTMLElement} content - The content element
     * @param {string} assignmentId - The ID of the assignment to render
     */
    renderAssignmentDetails(content, assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        const detailsContainer = content.querySelector('.assignment-details');
        if (!detailsContainer) return;
        
        // Update assignment details
        detailsContainer.innerHTML = `
            <div class="details-header">
                <h2 class="details-title">${assignment.title}</h2>
                <div class="details-meta">
                    <span class="details-type">${this.getAssignmentTypeText(assignment.type)}</span>
                    <span class="details-due">תאריך הגשה: ${new Date(assignment.dueDate).toLocaleDateString('he-IL')}</span>
                </div>
            </div>
            <div class="details-content">
                <div class="details-description">
                    <h3>תיאור המשימה</h3>
                    <div class="description-text">${assignment.description || 'אין תיאור זמין למשימה זו.'}</div>
                </div>
                <div class="details-requirements">
                    <h3>דרישות</h3>
                    <ul class="requirements-list">
                        ${assignment.requirements ? assignment.requirements.map(req => `
                            <li class="requirement-item">${req}</li>
                        `).join('') : '<li>אין דרישות מוגדרות למשימה זו.</li>'}
                    </ul>
                </div>
                <div class="details-resources">
                    <h3>משאבים</h3>
                    <ul class="resources-list">
                        ${assignment.resources ? assignment.resources.map(resource => `
                            <li class="resource-item">
                                <a href="${resource.url}" target="_blank" class="resource-link">
                                    <i class="fas ${this.getResourceIcon(resource.type)}"></i>
                                    <span>${resource.title}</span>
                                </a>
                            </li>
                        `).join('') : '<li>אין משאבים זמינים למשימה זו.</li>'}
                    </ul>
                </div>
            </div>
            <div class="details-submission">
                <h3>הגשה</h3>
                ${this.renderSubmissionSection(assignment)}
            </div>
            <div class="details-ai-tools">
                <h3>כלי AI מומלצים למשימה זו</h3>
                <div class="ai-tools-list">
                    ${assignment.recommendedAiTools ? assignment.recommendedAiTools.map(tool => `
                        <div class="ai-tool-card" data-tool-id="${tool.id}">
                            <div class="ai-tool-icon"><i class="fas ${tool.icon || 'fa-robot'}"></i></div>
                            <div class="ai-tool-info">
                                <div class="ai-tool-name">${tool.name}</div>
                                <div class="ai-tool-description">${tool.description}</div>
                            </div>
                        </div>
                    `).join('') : '<div class="no-tools">אין כלי AI מומלצים למשימה זו.</div>'}
                </div>
            </div>
        `;
    }
    
    /**
     * Render the submission section based on assignment status
     * @param {Object} assignment - The assignment object
     * @returns {string} HTML for the submission section
     */
    renderSubmissionSection(assignment) {
        if (assignment.status === 'completed') {
            return `
                <div class="submission-completed">
                    <div class="submission-status">
                        <i class="fas fa-check-circle"></i>
                        <span>המשימה הוגשה בהצלחה</span>
                    </div>
                    <div class="submission-date">תאריך הגשה: ${new Date(assignment.submissionDate).toLocaleDateString('he-IL')}</div>
                    ${assignment.grade ? `
                        <div class="submission-grade">
                            <span class="grade-label">ציון:</span>
                            <span class="grade-value">${assignment.grade}/100</span>
                        </div>
                    ` : ''}
                    ${assignment.feedback ? `
                        <div class="submission-feedback">
                            <h4>משוב:</h4>
                            <div class="feedback-text">${assignment.feedback}</div>
                        </div>
                    ` : ''}
                    <button class="btn btn-primary btn-resubmit">הגש מחדש</button>
                </div>
            `;
        } else {
            return `
                <div class="submission-form">
                    <div class="form-group">
                        <label for="submission-text">תיאור ההגשה:</label>
                        <textarea id="submission-text" class="form-control" rows="4" placeholder="תאר את ההגשה שלך..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="submission-file">קובץ הגשה:</label>
                        <input type="file" id="submission-file" class="form-control-file">
                        <small class="form-text">פורמטים מותרים: PDF, ZIP, DOC, DOCX, PPT, PPTX (מקסימום 10MB)</small>
                    </div>
                    <div class="form-group">
                        <label for="submission-ai-usage">שימוש בכלי AI:</label>
                        <textarea id="submission-ai-usage" class="form-control" rows="2" placeholder="תאר את השימוש שעשית בכלי AI במשימה זו..."></textarea>
                        <small class="form-text">חשוב לתעד את השימוש בכלי AI בהתאם למדיניות הקורס</small>
                    </div>
                    <button class="btn btn-primary btn-submit">הגש משימה</button>
                </div>
            `;
        }
    }
    
    /**
     * Get the appropriate icon for a resource type
     * @param {string} type - The resource type
     * @returns {string} The icon class
     */
    getResourceIcon(type) {
        switch (type) {
            case 'video': return 'fa-video';
            case 'article': return 'fa-file-alt';
            case 'book': return 'fa-book';
            case 'link': return 'fa-link';
            case 'pdf': return 'fa-file-pdf';
            case 'code': return 'fa-code';
            default: return 'fa-file';
        }
    }
    
    /**
     * Get the display text for an assignment type
     * @param {string} type - The assignment type
     * @returns {string} The display text
     */
    getAssignmentTypeText(type) {
        switch (type) {
            case 'weekly': return 'משימה שבועית';
            case 'midterm': return 'פרויקט אמצע';
            case 'final': return 'פרויקט מסכם';
            default: return 'משימה';
        }
    }
    
    /**
     * Set up event listeners for assignments elements
     * @param {HTMLElement} content - The content element
     */
    setupEventListeners(content) {
        // Assignment item click event
        const assignmentItems = content.querySelectorAll('.assignment-item');
        assignmentItems.forEach(item => {
            item.addEventListener('click', () => {
                const assignmentId = item.dataset.assignmentId;
                
                // Remove active class from all assignment items
                assignmentItems.forEach(ai => ai.classList.remove('active'));
                
                // Add active class to clicked assignment item
                item.classList.add('active');
                
                // Render the selected assignment details
                this.renderAssignmentDetails(content, assignmentId);
            });
        });
        
        // Submit button click event
        const submitButton = content.querySelector('.btn-submit');
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                // Get form values
                const submissionText = content.querySelector('#submission-text').value;
                const submissionFile = content.querySelector('#submission-file').files[0];
                const aiUsage = content.querySelector('#submission-ai-usage').value;
                
                // Validate form
                if (!submissionText) {
                    showErrorMessage('אנא הזן תיאור להגשה שלך.');
                    return;
                }
                
                if (!submissionFile) {
                    showErrorMessage('אנא בחר קובץ להגשה.');
                    return;
                }
                
                // Submit assignment (would be implemented with actual API)
                console.log('Submitting assignment:', {
                    text: submissionText,
                    file: submissionFile,
                    aiUsage: aiUsage
                });
                
                showSuccessMessage('המשימה הוגשה בהצלחה!');
                
                // Refresh assignments data
                this.init().then(() => {
                    // Re-render the assignments list
                    this.renderAssignmentsList(content);
                });
            });
        }
        
        // Resubmit button click event
        const resubmitButton = content.querySelector('.btn-resubmit');
        if (resubmitButton) {
            resubmitButton.addEventListener('click', () => {
                // Get the active assignment
                const activeItem = content.querySelector('.assignment-item.active');
                if (!activeItem) return;
                
                const assignmentId = activeItem.dataset.assignmentId;
                const assignment = this.assignments.find(a => a.id === assignmentId);
                if (!assignment) return;
                
                // Update assignment status to allow resubmission
                assignment.status = 'in-progress';
                
                // Re-render the assignment details
                this.renderAssignmentDetails(content, assignmentId);
            });
        }
        
        // AI tool card click event
        const aiToolCards = content.querySelectorAll('.ai-tool-card');
        aiToolCards.forEach(card => {
            card.addEventListener('click', () => {
                const toolId = card.dataset.toolId;
                if (toolId) {
                    loadPage('ai-tools', { toolId });
                }
            });
        });
    }
}

// Export the component
window.Assignments = Assignments;
