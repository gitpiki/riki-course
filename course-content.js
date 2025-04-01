/**
 * Course Content Component
 * Handles the course content view functionality
 */

class CourseContent {
    constructor() {
        this.template = document.getElementById('course-content-template');
        this.modules = [];
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Course content data
     */
    async init(data) {
        if (!data) {
            try {
                // Fetch course content data from API
                this.modules = await API.course.getModules();
            } catch (error) {
                console.error('Error loading course modules:', error);
                showErrorMessage('אירעה שגיאה בטעינת תוכן הקורס. אנא נסה שוב מאוחר יותר.');
                this.modules = [];
            }
        } else {
            this.modules = data.modules || [];
        }
    }

    /**
     * Render the course content view
     * @param {Object} params - Optional parameters (moduleId, unitId)
     * @returns {HTMLElement} The rendered course content
     */
    async render(params = {}) {
        // Initialize data if needed
        if (this.modules.length === 0) {
            await this.init();
        }
        
        // Clone the template content
        const content = this.template.content.cloneNode(true);
        
        // Render module navigation
        this.renderModuleNavigation(content, params.moduleId);
        
        // Render selected module content
        if (params.moduleId) {
            this.renderModuleContent(content, params.moduleId, params.unitId);
        } else if (this.modules.length > 0) {
            // Default to first module if none specified
            this.renderModuleContent(content, this.modules[0].id);
        }
        
        // Setup event listeners
        this.setupEventListeners(content);
        
        return content;
    }
    
    /**
     * Render the module navigation sidebar
     * @param {HTMLElement} content - The content element
     * @param {string} selectedModuleId - The ID of the selected module
     */
    renderModuleNavigation(content, selectedModuleId) {
        const moduleList = content.querySelector('.module-list');
        if (!moduleList) return;
        
        moduleList.innerHTML = '';
        
        this.modules.forEach(module => {
            const moduleItem = document.createElement('li');
            moduleItem.className = 'module-item';
            if (module.id === selectedModuleId) {
                moduleItem.classList.add('active');
            }
            
            // Calculate progress percentage
            const progressPercent = module.progress || 0;
            
            moduleItem.innerHTML = `
                <div class="module-header" data-module-id="${module.id}">
                    <div class="module-title">
                        <i class="fas fa-book-open module-icon"></i>
                        <span>${module.title}</span>
                    </div>
                    <div class="module-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                        <span class="progress-text">${progressPercent}%</span>
                    </div>
                </div>
                <ul class="unit-list" style="display: ${module.id === selectedModuleId ? 'block' : 'none'};">
                    ${module.units.map(unit => `
                        <li class="unit-item ${unit.id === (params?.unitId) ? 'active' : ''}" data-unit-id="${unit.id}">
                            <div class="unit-title">
                                <i class="fas ${unit.completed ? 'fa-check-circle' : 'fa-circle'} unit-icon"></i>
                                <span>${unit.title}</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
            
            moduleList.appendChild(moduleItem);
        });
    }
    
    /**
     * Render the content of a specific module
     * @param {HTMLElement} content - The content element
     * @param {string} moduleId - The ID of the module to render
     * @param {string} unitId - The ID of the unit to render (optional)
     */
    renderModuleContent(content, moduleId, unitId) {
        const module = this.modules.find(m => m.id === moduleId);
        if (!module) return;
        
        // Update module title
        const moduleTitleElement = content.querySelector('.content-title');
        if (moduleTitleElement) {
            moduleTitleElement.textContent = module.title;
        }
        
        // Find the unit to display
        let unit;
        if (unitId) {
            unit = module.units.find(u => u.id === unitId);
        } else if (module.units.length > 0) {
            // Default to first unit if none specified
            unit = module.units[0];
        }
        
        if (!unit) return;
        
        // Update unit content
        const unitContentElement = content.querySelector('.unit-content');
        if (unitContentElement) {
            unitContentElement.innerHTML = `
                <h2 class="unit-title">${unit.title}</h2>
                <div class="unit-description">${unit.description || ''}</div>
                <div class="unit-body">${unit.content || 'אין תוכן זמין ליחידה זו.'}</div>
            `;
            
            // Add related AI tools if available
            if (unit.relatedAiTools && unit.relatedAiTools.length > 0) {
                const aiToolsSection = document.createElement('div');
                aiToolsSection.className = 'related-ai-tools';
                aiToolsSection.innerHTML = `
                    <h3>כלי AI רלוונטיים</h3>
                    <div class="ai-tools-list">
                        ${unit.relatedAiTools.map(tool => `
                            <div class="ai-tool-card" data-tool-id="${tool.id}">
                                <div class="ai-tool-icon"><i class="fas ${tool.icon || 'fa-robot'}"></i></div>
                                <div class="ai-tool-info">
                                    <div class="ai-tool-name">${tool.name}</div>
                                    <div class="ai-tool-description">${tool.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                unitContentElement.appendChild(aiToolsSection);
            }
            
            // Add additional resources if available
            if (unit.resources && unit.resources.length > 0) {
                const resourcesSection = document.createElement('div');
                resourcesSection.className = 'additional-resources';
                resourcesSection.innerHTML = `
                    <h3>משאבים נוספים</h3>
                    <ul class="resources-list">
                        ${unit.resources.map(resource => `
                            <li class="resource-item">
                                <a href="${resource.url}" target="_blank" class="resource-link">
                                    <i class="fas ${this.getResourceIcon(resource.type)}"></i>
                                    <span>${resource.title}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                `;
                unitContentElement.appendChild(resourcesSection);
            }
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
     * Set up event listeners for course content elements
     * @param {HTMLElement} content - The content element
     */
    setupEventListeners(content) {
        // Module header click event (expand/collapse)
        const moduleHeaders = content.querySelectorAll('.module-header');
        moduleHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const moduleId = header.dataset.moduleId;
                const moduleItem = header.closest('.module-item');
                const unitList = moduleItem.querySelector('.unit-list');
                
                // Toggle active class
                moduleItem.classList.toggle('active');
                
                // Toggle unit list visibility
                if (unitList) {
                    unitList.style.display = unitList.style.display === 'none' ? 'block' : 'none';
                }
                
                // Load module content if it's being expanded
                if (moduleItem.classList.contains('active')) {
                    this.renderModuleContent(content, moduleId);
                }
            });
        });
        
        // Unit item click event
        const unitItems = content.querySelectorAll('.unit-item');
        unitItems.forEach(item => {
            item.addEventListener('click', () => {
                const unitId = item.dataset.unitId;
                const moduleItem = item.closest('.module-item');
                const moduleId = moduleItem.querySelector('.module-header').dataset.moduleId;
                
                // Remove active class from all unit items
                unitItems.forEach(ui => ui.classList.remove('active'));
                
                // Add active class to clicked unit item
                item.classList.add('active');
                
                // Render the selected unit content
                this.renderModuleContent(content, moduleId, unitId);
            });
        });
        
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
window.CourseContent = CourseContent;
