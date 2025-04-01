/**
 * Search Functionality
 * Handles course content search and results display
 */

class SearchManager {
    constructor() {
        this.searchIndex = null;
        this.initialized = false;
    }

    /**
     * Initialize the search manager
     */
    async init() {
        if (this.initialized) return true;
        
        try {
            // Build search index
            await this.buildSearchIndex();
            
            // Set up search UI
            this.setupSearchUI();
            
            this.initialized = true;
            console.log('Search manager initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing search manager:', error);
            return false;
        }
    }

    /**
     * Build search index from course content
     */
    async buildSearchIndex() {
        // Create search index
        this.searchIndex = {
            modules: [],
            units: [],
            assignments: [],
            resources: [],
            aiTools: []
        };
        
        try {
            // Get modules data
            let modules = [];
            if (window.ContentLoader && window.ContentLoader.getModules) {
                modules = window.ContentLoader.getModules();
            } else if (window.API && window.API.course && window.API.course.getModules) {
                modules = await window.API.course.getModules();
            }
            
            // Index modules and units
            modules.forEach(module => {
                // Add module to index
                this.searchIndex.modules.push({
                    id: module.id,
                    title: module.title,
                    content: `${module.title} ${module.topics || ''} ${module.activities || ''} ${module.exercises || ''}`,
                    type: 'module'
                });
                
                // Add units to index
                if (module.units && Array.isArray(module.units)) {
                    module.units.forEach(unit => {
                        this.searchIndex.units.push({
                            id: unit.id,
                            moduleId: module.id,
                            title: unit.title,
                            content: this.stripHtml(unit.content || ''),
                            type: 'unit'
                        });
                        
                        // Add resources to index
                        if (unit.resources && Array.isArray(unit.resources)) {
                            unit.resources.forEach(resource => {
                                this.searchIndex.resources.push({
                                    id: `${unit.id}_resource_${this.searchIndex.resources.length}`,
                                    unitId: unit.id,
                                    moduleId: module.id,
                                    title: resource.title,
                                    content: resource.title,
                                    url: resource.url,
                                    resourceType: resource.type,
                                    type: 'resource'
                                });
                            });
                        }
                        
                        // Add AI tools to index
                        if (unit.relatedAiTools && Array.isArray(unit.relatedAiTools)) {
                            unit.relatedAiTools.forEach(tool => {
                                this.searchIndex.aiTools.push({
                                    id: tool.id,
                                    unitId: unit.id,
                                    moduleId: module.id,
                                    title: tool.name,
                                    content: `${tool.name} ${tool.description || ''}`,
                                    type: 'aiTool'
                                });
                            });
                        }
                    });
                }
            });
            
            // Get assignments data
            let assignments = [];
            if (window.API && window.API.assignments && window.API.assignments.getAssignments) {
                assignments = await window.API.assignments.getAssignments();
            }
            
            // Index assignments
            assignments.forEach(assignment => {
                this.searchIndex.assignments.push({
                    id: assignment.id,
                    title: assignment.title,
                    content: `${assignment.title} ${assignment.description || ''} ${assignment.type || ''}`,
                    dueDate: assignment.dueDate,
                    type: 'assignment'
                });
            });
            
            console.log('Search index built successfully');
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }

    /**
     * Set up search UI
     */
    setupSearchUI() {
        // Get search elements
        const searchInput = document.querySelector('#search-input');
        const searchButton = document.querySelector('#search-button');
        const searchResults = document.querySelector('#search-results');
        const searchOverlay = document.querySelector('#search-overlay');
        
        if (!searchInput || !searchButton) return;
        
        // Create search results container if it doesn't exist
        if (!searchResults) {
            const resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results';
            resultsContainer.className = 'search-results';
            document.body.appendChild(resultsContainer);
            searchResults = resultsContainer;
        }
        
        // Create search overlay if it doesn't exist
        if (!searchOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'search-overlay';
            overlay.className = 'search-overlay';
            document.body.appendChild(overlay);
            searchOverlay = overlay;
            
            // Add event listener to close search when clicking overlay
            searchOverlay.addEventListener('click', () => {
                this.closeSearch();
            });
        }
        
        // Add event listener for search input
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                this.performSearch(query);
            } else {
                this.closeSearch();
            }
        });
        
        // Add event listener for search button
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                this.performSearch(query);
            }
        });
        
        // Add event listener for Enter key in search input
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    this.performSearch(query);
                }
            } else if (event.key === 'Escape') {
                this.closeSearch();
            }
        });
    }

    /**
     * Perform search
     * @param {string} query - The search query
     */
    performSearch(query) {
        if (!query || query.length < 2 || !this.searchIndex) return;
        
        // Get search results container
        const searchResults = document.querySelector('#search-results');
        const searchOverlay = document.querySelector('#search-overlay');
        
        if (!searchResults || !searchOverlay) return;
        
        // Show search overlay
        searchOverlay.classList.add('active');
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        // Normalize query
        const normalizedQuery = query.toLowerCase();
        
        // Search in modules
        const moduleResults = this.searchIndex.modules.filter(item => 
            item.title.toLowerCase().includes(normalizedQuery) || 
            item.content.toLowerCase().includes(normalizedQuery)
        );
        
        // Search in units
        const unitResults = this.searchIndex.units.filter(item => 
            item.title.toLowerCase().includes(normalizedQuery) || 
            item.content.toLowerCase().includes(normalizedQuery)
        );
        
        // Search in assignments
        const assignmentResults = this.searchIndex.assignments.filter(item => 
            item.title.toLowerCase().includes(normalizedQuery) || 
            item.content.toLowerCase().includes(normalizedQuery)
        );
        
        // Search in resources
        const resourceResults = this.searchIndex.resources.filter(item => 
            item.title.toLowerCase().includes(normalizedQuery) || 
            item.content.toLowerCase().includes(normalizedQuery)
        );
        
        // Search in AI tools
        const aiToolResults = this.searchIndex.aiTools.filter(item => 
            item.title.toLowerCase().includes(normalizedQuery) || 
            item.content.toLowerCase().includes(normalizedQuery)
        );
        
        // Combine results
        const allResults = [
            ...moduleResults.map(item => ({ ...item, priority: 1 })),
            ...unitResults.map(item => ({ ...item, priority: 2 })),
            ...assignmentResults.map(item => ({ ...item, priority: 3 })),
            ...resourceResults.map(item => ({ ...item, priority: 4 })),
            ...aiToolResults.map(item => ({ ...item, priority: 5 }))
        ];
        
        // Sort results by priority and relevance
        allResults.sort((a, b) => {
            // First sort by priority
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            
            // Then sort by title match
            const aTitleMatch = a.title.toLowerCase().includes(normalizedQuery);
            const bTitleMatch = b.title.toLowerCase().includes(normalizedQuery);
            
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            
            // Then sort alphabetically
            return a.title.localeCompare(b.title);
        });
        
        // Limit results
        const limitedResults = allResults.slice(0, 10);
        
        // Show results
        if (limitedResults.length > 0) {
            // Create results header
            const resultsHeader = document.createElement('div');
            resultsHeader.className = 'results-header';
            resultsHeader.innerHTML = `
                <h3>תוצאות חיפוש עבור "${query}"</h3>
                <button class="close-search-btn">×</button>
            `;
            
            // Add event listener for close button
            const closeBtn = resultsHeader.querySelector('.close-search-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeSearch();
                });
            }
            
            searchResults.appendChild(resultsHeader);
            
            // Create results list
            const resultsList = document.createElement('ul');
            resultsList.className = 'results-list';
            
            limitedResults.forEach(result => {
                const resultItem = document.createElement('li');
                resultItem.className = 'result-item';
                resultItem.dataset.type = result.type;
                resultItem.dataset.id = result.id;
                
                // Create result content based on type
                switch (result.type) {
                    case 'module':
                        resultItem.innerHTML = `
                            <div class="result-icon"><i class="fas fa-book"></i></div>
                            <div class="result-content">
                                <div class="result-title">${result.title}</div>
                                <div class="result-type">מודול</div>
                            </div>
                        `;
                        break;
                    case 'unit':
                        resultItem.innerHTML = `
                            <div class="result-icon"><i class="fas fa-file-alt"></i></div>
                            <div class="result-content">
                                <div class="result-title">${result.title}</div>
                                <div class="result-type">יחידת לימוד</div>
                            </div>
                        `;
                        break;
                    case 'assignment':
                        resultItem.innerHTML = `
                            <div class="result-icon"><i class="fas fa-tasks"></i></div>
                            <div class="result-content">
                                <div class="result-title">${result.title}</div>
                                <div class="result-type">משימה</div>
                            </div>
                        `;
                        break;
                    case 'resource':
                        resultItem.innerHTML = `
                            <div class="result-icon"><i class="fas ${this.getResourceIcon(result.resourceType)}"></i></div>
                            <div class="result-content">
                                <div class="result-title">${result.title}</div>
                                <div class="result-type">משאב</div>
                            </div>
                        `;
                        break;
                    case 'aiTool':
                        resultItem.innerHTML = `
                            <div class="result-icon"><i class="fas fa-robot"></i></div>
                            <div class="result-content">
                                <div class="result-title">${result.title}</div>
                                <div class="result-type">כלי AI</div>
                            </div>
                        `;
                        break;
                }
                
                // Add event listener for result item click
                resultItem.addEventListener('click', () => {
                    this.handleResultClick(result);
                });
                
                resultsList.appendChild(resultItem);
            });
            
            searchResults.appendChild(resultsList);
            
            // Show results
            searchResults.classList.add('active');
        } else {
            // Show no results message
            searchResults.innerHTML = `
                <div class="results-header">
                    <h3>תוצאות חיפוש עבור "${query}"</h3>
                    <button class="close-search-btn">×</button>
                </div>
                <div class="no-results">לא נמצאו תוצאות</div>
            `;
            
            // Add event listener for close button
            const closeBtn = searchResults.querySelector('.close-search-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeSearch();
                });
            }
            
            // Show results
            searchResults.classList.add('active');
        }
    }

    /**
     * Handle result item click
     * @param {Object} result - The result item
     */
    handleResultClick(result) {
        // Close search
        this.closeSearch();
        
        // Navigate to result based on type
        switch (result.type) {
            case 'module':
                window.loadPage('course-content', { moduleId: result.id });
                break;
            case 'unit':
                window.loadPage('course-content', { moduleId: result.moduleId, unitId: result.id });
                break;
            case 'assignment':
                window.loadPage('assignments', { assignmentId: result.id });
                break;
            case 'resource':
                // Open resource in new tab
                if (result.url) {
                    window.open(result.url, '_blank');
                } else {
                    window.loadPage('course-content', { moduleId: result.moduleId, unitId: result.unitId });
                }
                break;
            case 'aiTool':
                window.loadPage('ai-tools', { toolId: result.id });
                break;
        }
    }

    /**
     * Close search results
     */
    closeSearch() {
        // Get search elements
        const searchResults = document.querySelector('#search-results');
        const searchOverlay = document.querySelector('#search-overlay');
        
        if (searchResults) {
            searchResults.classList.remove('active');
        }
        
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    }

    /**
     * Get icon for resource type
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
     * Strip HTML tags from string
     * @param {string} html - The HTML string
     * @returns {string} The plain text
     */
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
}

// Export the search manager
window.SearchManager = new SearchManager();
