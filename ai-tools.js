/**
 * AI Tools Component
 * Handles the AI tools and prompt library functionality
 */

class AITools {
    constructor() {
        this.template = document.getElementById('ai-tools-template');
        this.tools = [];
        this.prompts = [];
    }

    /**
     * Initialize the component with data
     * @param {Object} data - AI tools data
     */
    async init(data) {
        if (!data) {
            try {
                // Fetch AI tools data from API
                const toolsData = await API.aiTools.getTools();
                this.tools = toolsData.tools || [];
                this.prompts = toolsData.prompts || [];
            } catch (error) {
                console.error('Error loading AI tools data:', error);
                showErrorMessage('אירעה שגיאה בטעינת כלי ה-AI. אנא נסה שוב מאוחר יותר.');
                this.tools = [];
                this.prompts = [];
            }
        } else {
            this.tools = data.tools || [];
            this.prompts = data.prompts || [];
        }
    }

    /**
     * Render the AI tools view
     * @param {Object} params - Optional parameters (toolId, promptId)
     * @returns {HTMLElement} The rendered AI tools content
     */
    async render(params = {}) {
        // Initialize data if needed
        if (this.tools.length === 0) {
            await this.init();
        }
        
        // Clone the template content
        const content = this.template.content.cloneNode(true);
        
        // Render tools catalog
        this.renderToolsCatalog(content);
        
        // Render prompt library
        this.renderPromptLibrary(content);
        
        // Render selected tool or prompt if specified
        if (params.toolId) {
            this.renderToolInterface(content, params.toolId);
        } else if (params.promptId) {
            this.renderPromptDetails(content, params.promptId);
        } else if (this.tools.length > 0) {
            // Default to first tool if none specified
            this.renderToolInterface(content, this.tools[0].id);
        }
        
        // Setup event listeners
        this.setupEventListeners(content);
        
        return content;
    }
    
    /**
     * Render the AI tools catalog
     * @param {HTMLElement} content - The content element
     */
    renderToolsCatalog(content) {
        const toolsCatalog = content.querySelector('.tools-catalog');
        if (!toolsCatalog) return;
        
        toolsCatalog.innerHTML = '';
        
        // Group tools by category
        const groupedTools = {};
        this.tools.forEach(tool => {
            if (!groupedTools[tool.category]) {
                groupedTools[tool.category] = [];
            }
            groupedTools[tool.category].push(tool);
        });
        
        // Create tool categories
        Object.entries(groupedTools).forEach(([category, tools]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'tool-category';
            categoryElement.innerHTML = `<h3 class="category-title">${category}</h3>`;
            
            const toolsList = document.createElement('div');
            toolsList.className = 'tools-list';
            
            // Create tool cards
            tools.forEach(tool => {
                const toolCard = document.createElement('div');
                toolCard.className = 'tool-card';
                toolCard.dataset.toolId = tool.id;
                
                toolCard.innerHTML = `
                    <div class="tool-icon"><i class="fas ${tool.icon || 'fa-robot'}"></i></div>
                    <div class="tool-info">
                        <div class="tool-name">${tool.name}</div>
                        <div class="tool-description">${tool.shortDescription}</div>
                    </div>
                `;
                
                toolsList.appendChild(toolCard);
            });
            
            categoryElement.appendChild(toolsList);
            toolsCatalog.appendChild(categoryElement);
        });
    }
    
    /**
     * Render the prompt library
     * @param {HTMLElement} content - The content element
     */
    renderPromptLibrary(content) {
        const promptLibrary = content.querySelector('.prompt-library');
        if (!promptLibrary) return;
        
        promptLibrary.innerHTML = '';
        
        // Group prompts by category
        const groupedPrompts = {};
        this.prompts.forEach(prompt => {
            if (!groupedPrompts[prompt.category]) {
                groupedPrompts[prompt.category] = [];
            }
            groupedPrompts[prompt.category].push(prompt);
        });
        
        // Create prompt categories
        Object.entries(groupedPrompts).forEach(([category, prompts]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'prompt-category';
            categoryElement.innerHTML = `<h3 class="category-title">${category}</h3>`;
            
            const promptsList = document.createElement('div');
            promptsList.className = 'prompts-list';
            
            // Create prompt items
            prompts.forEach(prompt => {
                const promptItem = document.createElement('div');
                promptItem.className = 'prompt-item';
                promptItem.dataset.promptId = prompt.id;
                
                promptItem.innerHTML = `
                    <div class="prompt-title">${prompt.title}</div>
                    <div class="prompt-tags">
                        ${prompt.tags.map(tag => `<span class="prompt-tag">${tag}</span>`).join('')}
                    </div>
                `;
                
                promptsList.appendChild(promptItem);
            });
            
            categoryElement.appendChild(promptsList);
            promptLibrary.appendChild(categoryElement);
        });
    }
    
    /**
     * Render the interface for a specific AI tool
     * @param {HTMLElement} content - The content element
     * @param {string} toolId - The ID of the tool to render
     */
    renderToolInterface(content, toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;
        
        const toolInterface = content.querySelector('.tool-interface');
        if (!toolInterface) return;
        
        // Update tool interface
        toolInterface.innerHTML = `
            <div class="interface-header">
                <h2 class="interface-title">
                    <i class="fas ${tool.icon || 'fa-robot'}"></i>
                    <span>${tool.name}</span>
                </h2>
                <div class="interface-actions">
                    <a href="${tool.url}" target="_blank" class="btn btn-primary">פתח בחלון חדש</a>
                </div>
            </div>
            <div class="interface-description">
                <p>${tool.description}</p>
            </div>
            <div class="interface-content">
                <div class="interface-tabs">
                    <button class="tab-button active" data-tab="usage">שימוש</button>
                    <button class="tab-button" data-tab="examples">דוגמאות</button>
                    <button class="tab-button" data-tab="tips">טיפים</button>
                </div>
                <div class="interface-tab-content">
                    <div class="tab-pane active" id="usage">
                        <h3>כיצד להשתמש ב-${tool.name}</h3>
                        <div class="usage-steps">
                            ${tool.usageSteps.map((step, index) => `
                                <div class="usage-step">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-content">${step}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="tab-pane" id="examples">
                        <h3>דוגמאות לשימוש</h3>
                        <div class="examples-list">
                            ${tool.examples.map(example => `
                                <div class="example-item">
                                    <div class="example-title">${example.title}</div>
                                    <div class="example-description">${example.description}</div>
                                    <div class="example-prompt">
                                        <div class="prompt-header">פרומפט:</div>
                                        <div class="prompt-content">${example.prompt}</div>
                                        <button class="btn btn-copy" data-text="${example.prompt}">העתק</button>
                                    </div>
                                    ${example.result ? `
                                        <div class="example-result">
                                            <div class="result-header">תוצאה:</div>
                                            <div class="result-content">${example.result}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="tab-pane" id="tips">
                        <h3>טיפים לשימוש אפקטיבי</h3>
                        <ul class="tips-list">
                            ${tool.tips.map(tip => `<li class="tip-item">${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render the details of a specific prompt
     * @param {HTMLElement} content - The content element
     * @param {string} promptId - The ID of the prompt to render
     */
    renderPromptDetails(content, promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        const promptDetails = content.querySelector('.prompt-details');
        if (!promptDetails) return;
        
        // Update prompt details
        promptDetails.innerHTML = `
            <div class="details-header">
                <h2 class="details-title">${prompt.title}</h2>
                <div class="details-tags">
                    ${prompt.tags.map(tag => `<span class="prompt-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="details-description">
                <p>${prompt.description}</p>
            </div>
            <div class="details-content">
                <div class="prompt-text">
                    <div class="prompt-header">פרומפט:</div>
                    <div class="prompt-content">${prompt.text}</div>
                    <div class="prompt-actions">
                        <button class="btn btn-copy" data-text="${prompt.text}">העתק</button>
                        <button class="btn btn-use" data-prompt-id="${prompt.id}">השתמש</button>
                    </div>
                </div>
                ${prompt.example ? `
                    <div class="prompt-example">
                        <div class="example-header">דוגמה לתוצאה:</div>
                        <div class="example-content">${prompt.example}</div>
                    </div>
                ` : ''}
                <div class="prompt-tips">
                    <h3>טיפים לשימוש בפרומפט זה</h3>
                    <ul class="tips-list">
                        ${prompt.tips.map(tip => `<li class="tip-item">${tip}</li>`).join('')}
                    </ul>
                </div>
                <div class="prompt-related">
                    <h3>פרומפטים קשורים</h3>
                    <div class="related-prompts">
                        ${prompt.relatedPrompts.map(related => {
                            const relatedPrompt = this.prompts.find(p => p.id === related);
                            return relatedPrompt ? `
                                <div class="related-prompt-item" data-prompt-id="${relatedPrompt.id}">
                                    <div class="related-prompt-title">${relatedPrompt.title}</div>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event listeners for AI tools elements
     * @param {HTMLElement} content - The content element
     */
    setupEventListeners(content) {
        // Tool card click event
        const toolCards = content.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            card.addEventListener('click', () => {
                const toolId = card.dataset.toolId;
                
                // Remove active class from all tool cards
                toolCards.forEach(tc => tc.classList.remove('active'));
                
                // Add active class to clicked tool card
                card.classList.add('active');
                
                // Render the selected tool interface
                this.renderToolInterface(content, toolId);
            });
        });
        
        // Prompt item click event
        const promptItems = content.querySelectorAll('.prompt-item');
        promptItems.forEach(item => {
            item.addEventListener('click', () => {
                const promptId = item.dataset.promptId;
                
                // Remove active class from all prompt items
                promptItems.forEach(pi => pi.classList.remove('active'));
                
                // Add active class to clicked prompt item
                item.classList.add('active');
                
                // Render the selected prompt details
                this.renderPromptDetails(content, promptId);
            });
        });
        
        // Tab button click event
        const tabButtons = content.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Remove active class from all tab buttons and panes
                tabButtons.forEach(tb => tb.classList.remove('active'));
                content.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked tab button and corresponding pane
                button.classList.add('active');
                content.querySelector(`#${tabId}`).classList.add('active');
            });
        });
        
        // Copy button click event
        const copyButtons = content.querySelectorAll('.btn-copy');
        copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const text = button.dataset.text;
                
                // Copy text to clipboard
                navigator.clipboard.writeText(text).then(() => {
                    // Show success message
                    button.textContent = 'הועתק!';
                    setTimeout(() => {
                        button.textContent = 'העתק';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        });
        
        // Use prompt button click event
        const useButtons = content.querySelectorAll('.btn-use');
        useButtons.forEach(button => {
            button.addEventListener('click', () => {
                const promptId = button.dataset.promptId;
                const prompt = this.prompts.find(p => p.id === promptId);
                
                if (prompt && prompt.recommendedTool) {
                    // Navigate to the recommended tool with the prompt
                    const toolId = prompt.recommendedTool;
                    
                    // Remove active class from all tool cards
                    toolCards.forEach(tc => tc.classList.remove('active'));
                    
                    // Add active class to the recommended tool card
                    const recommendedToolCard = content.querySelector(`.tool-card[data-tool-id="${toolId}"]`);
                    if (recommendedToolCard) {
                        recommendedToolCard.classList.add('active');
                    }
                    
                    // Render the recommended tool interface
                    this.renderToolInterface(content, toolId);
                    
                    // Scroll to the tool interface
                    const toolInterface = content.querySelector('.tool-interface');
                    if (toolInterface) {
                        toolInterface.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
        
        // Related prompt item click event
        const relatedPromptItems = content.querySelectorAll('.related-prompt-item');
        relatedPromptItems.forEach(item => {
            item.addEventListener('click', () => {
                const promptId = item.dataset.promptId;
                
                // Remove active class from all prompt items
                promptItems.forEach(pi => pi.classList.remove('active'));
                
                // Add active class to the related prompt item in the library
                const relatedPromptInLibrary = content.querySelector(`.prompt-item[data-prompt-id="${promptId}"]`);
                if (relatedPromptInLibrary) {
                    relatedPromptInLibrary.classList.add('active');
                }
                
                // Render the selected prompt details
                this.renderPromptDetails(content, promptId);
            });
        });
    }
}

// Export the component
window.AITools = AITools;
