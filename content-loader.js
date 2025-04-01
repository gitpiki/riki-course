/**
 * Content Loader
 * Handles loading and processing course content from markdown files
 */

class ContentLoader {
    constructor() {
        this.courseStructure = null;
        this.modules = [];
    }

    /**
     * Initialize the content loader
     */
    async init() {
        try {
            // Load course structure
            await this.loadCourseStructure();
            
            // Load modules content
            await this.loadModulesContent();
            
            console.log('Content loader initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing content loader:', error);
            return false;
        }
    }

    /**
     * Load course structure from course_structure.md
     */
    async loadCourseStructure() {
        try {
            const response = await fetch('/api/content/course-structure');
            const structureData = await response.json();
            
            this.courseStructure = structureData;
            
            // Extract modules information
            this.extractModulesFromStructure();
            
            return true;
        } catch (error) {
            console.error('Error loading course structure:', error);
            return false;
        }
    }

    /**
     * Extract modules information from course structure
     */
    extractModulesFromStructure() {
        if (!this.courseStructure) return;
        
        // Parse modules from course structure
        const moduleRegex = /### מודול (\d+): (.*?)\n- \*\*נושאים\*\*: (.*?)\n- \*\*פעילויות\*\*: (.*?)\n- \*\*תרגול\*\*: (.*?)(?=\n\n|$)/gs;
        
        let match;
        while ((match = moduleRegex.exec(this.courseStructure.content)) !== null) {
            const moduleNumber = parseInt(match[1]);
            const moduleTitle = match[2].trim();
            const topics = match[3].trim();
            const activities = match[4].trim();
            const exercises = match[5].trim();
            
            this.modules.push({
                id: `module${moduleNumber}`,
                number: moduleNumber,
                title: moduleTitle,
                topics: topics,
                activities: activities,
                exercises: exercises,
                units: [],
                progress: 0
            });
        }
        
        // Sort modules by number
        this.modules.sort((a, b) => a.number - b.number);
    }

    /**
     * Load content for all modules
     */
    async loadModulesContent() {
        const modulePromises = this.modules.map(module => this.loadModuleContent(module));
        await Promise.all(modulePromises);
    }

    /**
     * Load content for a specific module
     * @param {Object} module - The module object
     */
    async loadModuleContent(module) {
        try {
            const response = await fetch(`/api/content/modules/${module.id}`);
            const moduleData = await response.json();
            
            if (moduleData && moduleData.content) {
                // Extract units from module content
                this.extractUnitsFromModule(module, moduleData.content);
            }
            
            return true;
        } catch (error) {
            console.error(`Error loading content for module ${module.id}:`, error);
            return false;
        }
    }

    /**
     * Extract units from module content
     * @param {Object} module - The module object
     * @param {string} content - The module content
     */
    extractUnitsFromModule(module, content) {
        // Parse units from module content
        const unitRegex = /## (.*?)\n\n([\s\S]*?)(?=\n## |$)/g;
        
        let match;
        let unitIndex = 0;
        while ((match = unitRegex.exec(content)) !== null) {
            const unitTitle = match[1].trim();
            const unitContent = match[2].trim();
            
            // Skip if this is the module overview
            if (unitTitle.toLowerCase().includes('מבוא') || unitTitle.toLowerCase().includes('סקירה')) {
                continue;
            }
            
            // Create unit object
            const unit = {
                id: `${module.id}_unit${unitIndex}`,
                title: unitTitle,
                content: this.processMarkdownContent(unitContent),
                completed: false,
                resources: this.extractResourcesFromContent(unitContent),
                relatedAiTools: this.extractAiToolsFromContent(unitContent)
            };
            
            module.units.push(unit);
            unitIndex++;
        }
    }

    /**
     * Process markdown content to HTML
     * @param {string} markdown - The markdown content
     * @returns {string} The processed HTML content
     */
    processMarkdownContent(markdown) {
        // This is a simple markdown to HTML converter
        // In a real implementation, you would use a proper markdown library
        
        let html = markdown;
        
        // Convert headers
        html = html.replace(/### (.*?)$/gm, '<h3>$1</h3>');
        html = html.replace(/## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/# (.*?)$/gm, '<h1>$1</h1>');
        
        // Convert bold and italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert lists
        html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
        
        html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ol>$&</ol>');
        
        // Convert links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Convert paragraphs
        html = html.replace(/^(?!<[a-z])(.*?)$/gm, '<p>$1</p>');
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        
        return html;
    }

    /**
     * Extract resources from content
     * @param {string} content - The content to extract resources from
     * @returns {Array} Array of resource objects
     */
    extractResourcesFromContent(content) {
        const resources = [];
        
        // Look for resources section
        const resourcesSection = content.match(/## משאבים נוספים\n\n([\s\S]*?)(?=\n## |$)/);
        
        if (resourcesSection && resourcesSection[1]) {
            // Extract links
            const linkRegex = /\[(.*?)\]\((.*?)\)/g;
            let match;
            
            while ((match = linkRegex.exec(resourcesSection[1])) !== null) {
                const title = match[1].trim();
                const url = match[2].trim();
                
                // Determine resource type based on URL
                let type = 'link';
                if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
                    type = 'video';
                } else if (url.endsWith('.pdf')) {
                    type = 'pdf';
                } else if (url.includes('github.com')) {
                    type = 'code';
                }
                
                resources.push({
                    title,
                    url,
                    type
                });
            }
        }
        
        return resources;
    }

    /**
     * Extract AI tools from content
     * @param {string} content - The content to extract AI tools from
     * @returns {Array} Array of AI tool objects
     */
    extractAiToolsFromContent(content) {
        const aiTools = [];
        
        // Look for AI tools section
        const aiToolsSection = content.match(/## כלי AI רלוונטיים\n\n([\s\S]*?)(?=\n## |$)/);
        
        if (aiToolsSection && aiToolsSection[1]) {
            // Extract tool mentions
            const toolMentions = aiToolsSection[1].match(/- (.*?)(?=\n- |\n\n|$)/g);
            
            if (toolMentions) {
                toolMentions.forEach(mention => {
                    const toolName = mention.replace(/^- /, '').trim();
                    
                    // Map tool name to tool ID and icon
                    let toolId, icon;
                    
                    if (toolName.includes('ChatGPT')) {
                        toolId = 'chatgpt';
                        icon = 'fa-comment-dots';
                    } else if (toolName.includes('GitHub Copilot')) {
                        toolId = 'github-copilot';
                        icon = 'fa-code';
                    } else if (toolName.includes('Gemini')) {
                        toolId = 'gemini';
                        icon = 'fa-gem';
                    } else if (toolName.includes('Claude')) {
                        toolId = 'claude';
                        icon = 'fa-brain';
                    } else if (toolName.includes('CodeWhisperer')) {
                        toolId = 'codewhisperer';
                        icon = 'fa-code';
                    } else {
                        toolId = 'generic-ai';
                        icon = 'fa-robot';
                    }
                    
                    aiTools.push({
                        id: toolId,
                        name: toolName,
                        icon,
                        description: `כלי AI לשימוש ב${toolName}`
                    });
                });
            }
        }
        
        return aiTools;
    }

    /**
     * Get all modules
     * @returns {Array} Array of module objects
     */
    getModules() {
        return this.modules;
    }

    /**
     * Get a specific module by ID
     * @param {string} moduleId - The module ID
     * @returns {Object} The module object
     */
    getModule(moduleId) {
        return this.modules.find(module => module.id === moduleId);
    }

    /**
     * Get a specific unit by ID
     * @param {string} unitId - The unit ID
     * @returns {Object} The unit object
     */
    getUnit(unitId) {
        for (const module of this.modules) {
            const unit = module.units.find(unit => unit.id === unitId);
            if (unit) return unit;
        }
        return null;
    }

    /**
     * Update unit completion status
     * @param {string} unitId - The unit ID
     * @param {boolean} completed - The completion status
     */
    updateUnitCompletion(unitId, completed) {
        for (const module of this.modules) {
            const unit = module.units.find(unit => unit.id === unitId);
            if (unit) {
                unit.completed = completed;
                this.updateModuleProgress(module);
                return true;
            }
        }
        return false;
    }

    /**
     * Update module progress based on completed units
     * @param {Object} module - The module object
     */
    updateModuleProgress(module) {
        if (module.units.length === 0) {
            module.progress = 0;
            return;
        }
        
        const completedUnits = module.units.filter(unit => unit.completed).length;
        module.progress = Math.round((completedUnits / module.units.length) * 100);
    }
}

// Export the content loader
window.ContentLoader = new ContentLoader();
