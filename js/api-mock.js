/**
 * API Mock
 * Provides mock API endpoints for development and testing
 */

class APIMock {
    constructor() {
        this.initialized = false;
        this.userData = null;
        this.courseData = null;
        this.assignmentsData = null;
        this.analyticsData = null;
        this.aiToolsData = null;
    }

    /**
     * Initialize the API mock with data
     */
    async init() {
        if (this.initialized) return true;
        
        try {
            // Load mock data
            await this.loadMockData();
            
            // Initialize API endpoints
            this.initializeEndpoints();
            
            this.initialized = true;
            console.log('API Mock initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing API Mock:', error);
            return false;
        }
    }

    /**
     * Load mock data from markdown files
     */
    async loadMockData() {
        // Load course structure
        const courseStructure = await this.loadMarkdownFile('/upload/course_structure.md');
        const syllabus = await this.loadMarkdownFile('/upload/syllabus.md');
        
        // Create user data
        this.userData = {
            id: 'student1',
            name: 'טל ישראלי',
            email: 'tal@example.com',
            role: 'student',
            enrollmentDate: '2025-01-01'
        };
        
        // Create course data
        this.courseData = {
            id: 'gen-ai-cs',
            title: 'הטמעת כלי Gen AI בלימודי מדעי המחשב',
            description: this.extractDescription(syllabus),
            structure: courseStructure,
            modules: await this.createModulesData()
        };
        
        // Create assignments data
        this.assignmentsData = await this.createAssignmentsData(syllabus);
        
        // Create analytics data
        this.analyticsData = this.createAnalyticsData();
        
        // Create AI tools data
        this.aiToolsData = this.createAIToolsData();
    }

    /**
     * Load a markdown file
     * @param {string} path - The file path
     * @returns {string} The file content
     */
    async loadMarkdownFile(path) {
        try {
            const response = await fetch(path);
            return await response.text();
        } catch (error) {
            console.error(`Error loading markdown file ${path}:`, error);
            return '';
        }
    }

    /**
     * Extract course description from syllabus
     * @param {string} syllabus - The syllabus content
     * @returns {string} The course description
     */
    extractDescription(syllabus) {
        const descriptionMatch = syllabus.match(/## תיאור הקורס\n\n([\s\S]*?)(?=\n\n## )/);
        return descriptionMatch ? descriptionMatch[1].trim() : '';
    }

    /**
     * Create modules data from module files
     * @returns {Array} Array of module objects
     */
    async createModulesData() {
        const modules = [];
        
        // Extract module information from course structure
        const moduleRegex = /### מודול (\d+): (.*?)\n- \*\*נושאים\*\*: (.*?)\n- \*\*פעילויות\*\*: (.*?)\n- \*\*תרגול\*\*: (.*?)(?=\n\n|$)/gs;
        
        let match;
        while ((match = moduleRegex.exec(this.courseData.structure)) !== null) {
            const moduleNumber = parseInt(match[1]);
            const moduleTitle = match[2].trim();
            const topics = match[3].trim();
            const activities = match[4].trim();
            const exercises = match[5].trim();
            
            // Create module object
            const module = {
                id: `module${moduleNumber}`,
                number: moduleNumber,
                title: moduleTitle,
                topics: topics,
                activities: activities,
                exercises: exercises,
                units: this.createUnitsForModule(moduleNumber, moduleTitle),
                progress: this.getRandomProgress(moduleNumber)
            };
            
            modules.push(module);
        }
        
        // Sort modules by number
        return modules.sort((a, b) => a.number - b.number);
    }

    /**
     * Create units for a module
     * @param {number} moduleNumber - The module number
     * @param {string} moduleTitle - The module title
     * @returns {Array} Array of unit objects
     */
    createUnitsForModule(moduleNumber, moduleTitle) {
        const units = [];
        const unitCount = 3 + Math.floor(Math.random() * 3); // 3-5 units per module
        
        for (let i = 0; i < unitCount; i++) {
            const unitNumber = i + 1;
            const unitTitle = this.generateUnitTitle(moduleNumber, unitNumber);
            
            // Create unit object
            const unit = {
                id: `module${moduleNumber}_unit${unitNumber}`,
                number: unitNumber,
                title: unitTitle,
                content: this.generateUnitContent(moduleTitle, unitTitle),
                completed: moduleNumber < 5 || (moduleNumber === 5 && unitNumber < 3),
                resources: this.generateResources(moduleNumber, unitNumber),
                relatedAiTools: this.generateRelatedAiTools(moduleNumber)
            };
            
            units.push(unit);
        }
        
        return units;
    }

    /**
     * Generate a unit title
     * @param {number} moduleNumber - The module number
     * @param {number} unitNumber - The unit number
     * @returns {string} The unit title
     */
    generateUnitTitle(moduleNumber, unitNumber) {
        const unitTitles = {
            1: ['מבוא ל-Gen AI', 'מודלי שפה גדולים', 'יישומים בתחום מדעי המחשב', 'אתגרים ומגבלות'],
            2: ['GitHub Copilot', 'Amazon CodeWhisperer', 'Replit Ghostwriter', 'אינטגרציה עם סביבות פיתוח'],
            3: ['עקרונות ניסוח פרומפטים', 'טכניקות מתקדמות', 'הנדסת פרומפטים', 'אופטימיזציה של תוצאות'],
            4: ['למידה עצמית באמצעות AI', 'הסברים מותאמים אישית', 'יצירת דוגמאות קוד', 'בניית מחברת למידה'],
            5: ['זיהוי שגיאות קוד', 'הבנת הודעות שגיאה', 'אסטרטגיות דיבוג', 'אופטימיזציה של קוד'],
            6: ['הערכת פלט AI', 'זיהוי שגיאות ומגבלות', 'אימות תוצאות', 'שיפור איטרטיבי'],
            7: ['יושרה אקדמית', 'ציטוט וייחוס', 'גבולות השימוש המותר', 'פיתוח קוד אתי'],
            8: ['שילוב AI בתכנון פרויקט', 'פיתוח אב-טיפוס', 'ניהול פרויקט בעזרת AI', 'תיעוד ובדיקות'],
            9: ['שימושים תעשייתיים', 'מגמות עתידיות', 'השפעה על שוק העבודה', 'הכנה לקריירה'],
            10: ['תכנון פרויקט מסכם', 'פיתוח הפרויקט', 'הצגת הפרויקט', 'רפלקציה וסיכום']
        };
        
        return unitTitles[moduleNumber][unitNumber - 1] || `יחידה ${unitNumber} במודול ${moduleNumber}`;
    }

    /**
     * Generate unit content
     * @param {string} moduleTitle - The module title
     * @param {string} unitTitle - The unit title
     * @returns {string} The unit content in HTML format
     */
    generateUnitContent(moduleTitle, unitTitle) {
        return `
            <h2>${unitTitle}</h2>
            <p>תוכן היחידה עבור ${unitTitle} במודול ${moduleTitle}. כאן יופיע תוכן מפורט של היחידה, כולל הסברים, דוגמאות, ותרגילים.</p>
            <h3>מטרות היחידה</h3>
            <ul>
                <li>להבין את המושגים המרכזיים הקשורים ל${unitTitle}</li>
                <li>לרכוש מיומנויות מעשיות בשימוש בכלים רלוונטיים</li>
                <li>לפתח חשיבה ביקורתית בהקשר של ${unitTitle}</li>
            </ul>
            <h3>תוכן מרכזי</h3>
            <p>כאן יופיע התוכן המרכזי של היחידה, כולל הסברים מפורטים, דוגמאות קוד, ותרשימים.</p>
            <p>התוכן יכלול הסברים על ${unitTitle} והקשר שלו לתחום מדעי המחשב ולשימוש בכלי Gen AI.</p>
            <h3>דוגמאות</h3>
            <p>כאן יופיעו דוגמאות מעשיות הממחישות את הנושאים שנלמדו ביחידה זו.</p>
            <h3>תרגול</h3>
            <p>כאן יופיעו תרגילים ומשימות לתרגול החומר הנלמד ביחידה זו.</p>
        `;
    }

    /**
     * Generate resources for a unit
     * @param {number} moduleNumber - The module number
     * @param {number} unitNumber - The unit number
     * @returns {Array} Array of resource objects
     */
    generateResources(moduleNumber, unitNumber) {
        const resources = [];
        const resourceCount = 2 + Math.floor(Math.random() * 3); // 2-4 resources per unit
        
        const resourceTypes = ['video', 'article', 'pdf', 'code', 'link'];
        
        for (let i = 0; i < resourceCount; i++) {
            const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            let url, title;
            
            switch (type) {
                case 'video':
                    url = 'https://www.youtube.com/watch?v=example';
                    title = `סרטון הדרכה: ${this.generateUnitTitle(moduleNumber, unitNumber)}`;
                    break;
                case 'article':
                    url = 'https://example.com/article';
                    title = `מאמר: ${this.generateUnitTitle(moduleNumber, unitNumber)}`;
                    break;
                case 'pdf':
                    url = 'https://example.com/document.pdf';
                    title = `מסמך: ${this.generateUnitTitle(moduleNumber, unitNumber)}`;
                    break;
                case 'code':
                    url = 'https://github.com/example/repo';
                    title = `קוד דוגמה: ${this.generateUnitTitle(moduleNumber, unitNumber)}`;
                    break;
                default:
                    url = 'https://example.com/resource';
                    title = `משאב נוסף: ${this.generateUnitTitle(moduleNumber, unitNumber)}`;
            }
            
            resources.push({
                title,
                url,
                type
            });
        }
        
        return resources;
    }

    /**
     * Generate related AI tools for a module
     * @param {number} moduleNumber - The module number
     * @returns {Array} Array of AI tool objects
     */
    generateRelatedAiTools(moduleNumber) {
        const tools = [];
        const toolCount = 1 + Math.floor(Math.random() * 3); // 1-3 tools per module
        
        const allTools = [
            { id: 'chatgpt', name: 'ChatGPT', icon: 'fa-comment-dots', description: 'מודל שפה גדול מבית OpenAI' },
            { id: 'github-copilot', name: 'GitHub Copilot', icon: 'fa-code', description: 'עוזר קוד מבוסס AI' },
            { id: 'gemini', name: 'Google Gemini', icon: 'fa-gem', description: 'מודל שפה גדול מבית Google' },
            { id: 'claude', name: 'Claude', icon: 'fa-brain', description: 'מודל שפה גדול מבית Anthropic' },
            { id: 'codewhisperer', name: 'Amazon CodeWhisperer', icon: 'fa-code', description: 'עוזר קוד מבוסס AI מבית Amazon' }
        ];
        
        // Select random tools
        const selectedTools = [];
        while (selectedTools.length < toolCount) {
            const randomIndex = Math.floor(Math.random() * allTools.length);
            const tool = allTools[randomIndex];
            
            if (!selectedTools.find(t => t.id === tool.id)) {
                selectedTools.push(tool);
            }
        }
        
        return selectedTools;
    }

    /**
     * Create assignments data
     * @param {string} syllabus - The syllabus content
     * @returns {Array} Array of assignment objects
     */
    async createAssignmentsData(syllabus) {
        const assignments = [];
        
        // Extract assignments from syllabus
        const assignmentsMatch = syllabus.match(/## לוח זמנים להגשות\n\n\| שבוע \| משימה \| תאריך הגשה \|\n\|.*\|\n([\s\S]*?)(?=\n\n|$)/);
        
        if (assignmentsMatch && assignmentsMatch[1]) {
            const assignmentRows = assignmentsMatch[1].split('\n');
            
            assignmentRows.forEach(row => {
                const columns = row.split('|').map(col => col.trim());
                
                if (columns.length >= 4) {
                    const week = columns[1];
                    const title = columns[2];
                    const dueDate = columns[3];
                    
                    if (week && title && dueDate) {
                        // Determine assignment type
                        let type = 'weekly';
                        if (title.includes('פרויקט אמצע')) {
                            type = 'midterm';
                        } else if (title.includes('פרויקט מסכם')) {
                            type = 'final';
                        }
                        
                        // Determine assignment status
                        let status = 'not-started';
                        const dueDateObj = new Date(dueDate);
                        const today = new Date();
                        
                        if (dueDateObj < today) {
                            if (Math.random() > 0.3) {
                                status = 'completed';
                            } else {
                                status = 'overdue';
                            }
                        } else if (Math.random() > 0.7) {
                            status = 'in-progress';
                        }
                        
                        // Create assignment object
                        const assignment = {
                            id: `assignment_${assignments.length + 1}`,
                            title,
                            type,
                            dueDate,
                            status,
                            description: this.generateAssignmentDescription(title, type),
                            requirements: this.generateAssignmentRequirements(type),
                            resources: this.generateResources(0, 0),
                            recommendedAiTools: this.generateRelatedAiTools(0)
                        };
                        
                        // Add submission data if completed
                        if (status === 'completed') {
                            assignment.submissionDate = new Date(dueDateObj.getTime() - Math.random() * 86400000 * 3).toISOString();
                            assignment.grade = 70 + Math.floor(Math.random() * 30);
                            assignment.feedback = this.generateFeedback(assignment.grade);
                        }
                        
                        assignments.push(assignment);
                    }
                }
            });
        }
        
        return assignments;
    }

    /**
     * Generate assignment description
     * @param {string} title - The assignment title
     * @param {string} type - The assignment type
     * @returns {string} The assignment description
     */
    generateAssignmentDescription(title, type) {
        let description = '';
        
        switch (type) {
            case 'weekly':
                description = `משימה שבועית: ${title}. במשימה זו תתבקשו ליישם את החומר שנלמד בשבוע האחרון. המשימה כוללת תרגילים מעשיים ושאלות תיאורטיות.`;
                break;
            case 'midterm':
                description = `פרויקט אמצע: ${title}. בפרויקט זה תתבקשו לפתח כלי עזר פשוט המשלב AI לפתרון בעיה ספציפית. הפרויקט יכלול תכנון, פיתוח, ותיעוד של הכלי.`;
                break;
            case 'final':
                description = `פרויקט מסכם: ${title}. בפרויקט זה תתבקשו לפתח אפליקציה מקיפה המשלבת כלי AI לפתרון בעיה משמעותית. הפרויקט יכלול תכנון, פיתוח, תיעוד, והצגה של האפליקציה.`;
                break;
        }
        
        return description;
    }

    /**
     * Generate assignment requirements
     * @param {string} type - The assignment type
     * @returns {Array} Array of requirement strings
     */
    generateAssignmentRequirements(type) {
        const requirements = [];
        
        switch (type) {
            case 'weekly':
                requirements.push('השלמת כל התרגילים המעשיים');
                requirements.push('מענה על כל השאלות התיאורטיות');
                requirements.push('תיעוד השימוש בכלי AI');
                break;
            case 'midterm':
                requirements.push('תכנון מפורט של הכלי');
                requirements.push('פיתוח הכלי בהתאם לתכנון');
                requirements.push('תיעוד מלא של הכלי');
                requirements.push('הסבר על השימוש בכלי AI בתהליך הפיתוח');
                requirements.push('הגשת קוד מקור וקובץ README');
                break;
            case 'final':
                requirements.push('תכנון מפורט של האפליקציה');
                requirements.push('פיתוח האפליקציה בהתאם לתכנון');
                requirements.push('תיעוד מלא של האפליקציה');
                requirements.push('הסבר על השימוש בכלי AI בתהליך הפיתוח');
                requirements.push('הגשת קוד מקור וקובץ README');
                requirements.push('הכנת מצגת להצגת הפרויקט');
                requirements.push('הצגת הפרויקט בפני הכיתה');
                break;
        }
        
        return requirements;
    }

    /**
     * Generate feedback based on grade
     * @param {number} grade - The assignment grade
     * @returns {string} The feedback
     */
    generateFeedback(grade) {
        if (grade >= 90) {
            return 'עבודה מצוינת! הפגנת הבנה מעמיקה של החומר והשתמשת בכלי AI באופן יעיל ויצירתי. המשך כך!';
        } else if (grade >= 80) {
            return 'עבודה טובה מאוד. הפגנת הבנה טובה של החומר והשתמשת בכלי AI באופן יעיל. יש מספר נקודות קטנות לשיפור.';
        } else if (grade >= 70) {
            return 'עבודה טובה. הפגנת הבנה בסיסית של החומר והשתמשת בכלי AI, אך יש מקום לשיפור בשימוש יעיל יותר בכלים אלה.';
        } else {
            return 'העבודה עומדת בדרישות הבסיסיות, אך יש מקום לשיפור משמעותי. מומלץ לפנות לשעות הקבלה לקבלת עזרה נוספת.';
        }
    }

    /**
     * Create analytics data
     * @returns {Object} Analytics data object
     */
    createAnalyticsData() {
        return {
            summary: {
                overallProgress: 65,
                averageGrade: 85,
                completedAssignments: 7,
                totalAssignments: 12,
                totalHours: 42,
                classRank: 5,
                totalStudents: 30
            },
            progressOverTime: {
                labels: ['שבוע 1', 'שבוע 2', 'שבוע 3', 'שבוע 4', 'שבוע 5', 'שבוע 6', 'שבוע 7'],
                values: [10, 20, 30, 40, 50, 60, 65]
            },
            modulePerformance: {
                modules: ['מודול 1', 'מודול 2', 'מודול 3', 'מודול 4', 'מודול 5'],
                grades: [90, 85, 88, 82, 80]
            },
            skillsHeatMap: [
                { name: 'שימוש ב-ChatGPT', level: 85 },
                { name: 'ניסוח פרומפטים', level: 78 },
                { name: 'שימוש ב-GitHub Copilot', level: 92 },
                { name: 'דיבוג קוד', level: 65 },
                { name: 'חשיבה ביקורתית', level: 75 },
                { name: 'אתיקה בשימוש ב-AI', level: 88 }
            ],
            timeSpentAnalysis: {
                categories: ['צפייה בתוכן', 'תרגול', 'משימות', 'פרויקטים', 'דיונים'],
                hours: [12, 8, 10, 8, 4]
            }
        };
    }

    /**
     * Create AI tools data
     * @returns {Object} AI tools data object
     */
    createAIToolsData() {
        return {
            tools: [
                {
                    id: 'chatgpt',
                    name: 'ChatGPT',
                    category: 'מודלי שפה גדולים',
                    icon: 'fa-comment-dots',
                    shortDescription: 'מודל שפה גדול מבית OpenAI',
                    description: 'ChatGPT הוא מודל שפה גדול (LLM) מבית OpenAI המאפשר שיחות טבעיות ומגוונות. הוא יכול לסייע בכתיבת קוד, הסבר מושגים, פתרון בעיות, ועוד.',
                    url: 'https://chat.openai.com/',
                    usageSteps: [
                        'היכנס לאתר ChatGPT והתחבר לחשבון שלך',
                        'הקלד את השאילתה שלך בתיבת הטקסט',
                        'לחץ על Enter או על כפתור השליחה',
                        'קרא את התשובה והמשך את השיחה לפי הצורך'
                    ],
                    examples: [
                        {
                            title: 'הסבר מושג תכנותי',
                            description: 'שימוש ב-ChatGPT להסבר מושג תכנותי מורכב',
                            prompt: 'הסבר לי מהו Polymorphism בתכנות מונחה עצמים, עם דוגמאות קוד בפייתון',
                            result: 'פולימורפיזם (Polymorphism) הוא אחד מעקרונות היסוד בתכנות מונחה עצמים...'
                        },
                        {
                            title: 'דיבוג קוד',
                            description: 'שימוש ב-ChatGPT לאיתור ותיקון באגים בקוד',
                            prompt: 'יש לי באג בקוד הבא בפייתון: [קוד עם באג]. מה הבעיה וכיצד אפשר לתקן אותה?',
                            result: 'הבעיה בקוד שלך היא...'
                        }
                    ],
                    tips: [
                        'היה ספציפי ככל האפשר בשאילתות שלך',
                        'חלק משימות מורכבות למספר שאילתות קטנות יותר',
                        'בקש מ-ChatGPT להסביר את הקוד שהוא מייצר',
                        'השתמש בהקשר השיחה להמשך דיון על אותו נושא',
                        'בדוק תמיד את הקוד שמיוצר על ידי ChatGPT לפני שימוש בו'
                    ]
                },
                {
                    id: 'github-copilot',
                    name: 'GitHub Copilot',
                    category: 'כלי פיתוח קוד',
                    icon: 'fa-code',
                    shortDescription: 'עוזר קוד מבוסס AI',
                    description: 'GitHub Copilot הוא כלי עזר לפיתוח קוד המבוסס על AI. הוא משתלב בסביבות פיתוח כמו VS Code ומציע השלמות קוד חכמות בזמן אמת.',
                    url: 'https://github.com/features/copilot',
                    usageSteps: [
                        'התקן את התוסף של GitHub Copilot בסביבת הפיתוח שלך',
                        'התחבר לחשבון GitHub שלך',
                        'התחל לכתוב קוד או תיעוד בקוד',
                        'Copilot יציע השלמות קוד בזמן אמת',
                        'לחץ על Tab לקבלת ההצעה או המשך לכתוב'
                    ],
                    examples: [
                        {
                            title: 'כתיבת פונקציה',
                            description: 'שימוש ב-Copilot לכתיבת פונקציה',
                            prompt: '// פונקציה שממיינת מערך של מספרים בסדר עולה',
                            result: 'function sortNumbers(numbers) {\n  return numbers.sort((a, b) => a - b);\n}'
                        },
                        {
                            title: 'יצירת מחלקה',
                            description: 'שימוש ב-Copilot ליצירת מחלקה',
                            prompt: '// מחלקה המייצגת ספר עם שם, מחבר ושנת הוצאה',
                            result: 'class Book {\n  constructor(title, author, year) {\n    this.title = title;\n    this.author = author;\n    this.year = year;\n  }\n\n  getSummary() {\n    return `${this.title} was written by ${this.author} in ${this.year}`;\n  }\n}'
                        }
                    ],
                    tips: [
                        'כתוב תיעוד ברור לפני הקוד כדי לקבל הצעות טובות יותר',
                        'השתמש בשמות משתנים ופונקציות משמעותיים',
                        'בדוק תמיד את הקוד שמיוצר על ידי Copilot',
                        'לחץ על Alt+] או Alt+[ כדי לראות הצעות נוספות',
                        'השתמש ב-Copilot כעוזר, לא כמחליף לחשיבה שלך'
                    ]
                },
                {
                    id: 'gemini',
                    name: 'Google Gemini',
                    category: 'מודלי שפה גדולים',
                    icon: 'fa-gem',
                    shortDescription: 'מודל שפה גדול מבית Google',
                    description: 'Google Gemini הוא מודל שפה גדול (LLM) מבית Google המאפשר שיחות טבעיות ומגוונות. הוא יכול לסייע בכתיבת קוד, הסבר מושגים, פתרון בעיות, ועוד.',
                    url: 'https://gemini.google.com/',
                    usageSteps: [
                        'היכנס לאתר Google Gemini והתחבר לחשבון Google שלך',
                        'הקלד את השאילתה שלך בתיבת הטקסט',
                        'לחץ על Enter או על כפתור השליחה',
                        'קרא את התשובה והמשך את השיחה לפי הצורך'
                    ],
                    examples: [
                        {
                            title: 'הסבר אלגוריתם',
                            description: 'שימוש ב-Gemini להסבר אלגוריתם',
                            prompt: 'הסבר לי את אלגוריתם מיון מהיר (Quick Sort) עם דוגמאות קוד בפייתון',
                            result: 'מיון מהיר (Quick Sort) הוא אלגוריתם מיון יעיל המבוסס על אסטרטגיית "הפרד ומשול"...'
                        },
                        {
                            title: 'פתרון בעיה מתמטית',
                            description: 'שימוש ב-Gemini לפתרון בעיה מתמטית',
                            prompt: 'כיצד אפשר לפתור את המשוואה הבאה: 3x^2 + 5x - 2 = 0?',
                            result: 'כדי לפתור את המשוואה הריבועית 3x^2 + 5x - 2 = 0, נשתמש בנוסחת הפתרון למשוואה ריבועית...'
                        }
                    ],
                    tips: [
                        'היה ספציפי ככל האפשר בשאילתות שלך',
                        'השתמש ביכולת העלאת תמונות לניתוח ויזואלי',
                        'בקש מ-Gemini להסביר את הקוד שהוא מייצר',
                        'השתמש בהקשר השיחה להמשך דיון על אותו נושא',
                        'בדוק תמיד את המידע שמסופק על ידי Gemini'
                    ]
                },
                {
                    id: 'claude',
                    name: 'Claude',
                    category: 'מודלי שפה גדולים',
                    icon: 'fa-brain',
                    shortDescription: 'מודל שפה גדול מבית Anthropic',
                    description: 'Claude הוא מודל שפה גדול (LLM) מבית Anthropic המאפשר שיחות טבעיות ומגוונות. הוא ידוע ביכולתו לנהל שיחות ארוכות ולעבד מסמכים ארוכים.',
                    url: 'https://claude.ai/',
                    usageSteps: [
                        'היכנס לאתר Claude והתחבר לחשבון שלך',
                        'הקלד את השאילתה שלך בתיבת הטקסט',
                        'לחץ על Enter או על כפתור השליחה',
                        'קרא את התשובה והמשך את השיחה לפי הצורך'
                    ],
                    examples: [
                        {
                            title: 'ניתוח מסמך ארוך',
                            description: 'שימוש ב-Claude לניתוח מסמך ארוך',
                            prompt: 'אנא נתח את המסמך הבא ותן לי סיכום של הנקודות העיקריות: [מסמך ארוך]',
                            result: 'להלן סיכום הנקודות העיקריות מהמסמך...'
                        },
                        {
                            title: 'כתיבת תוכנית לימודים',
                            description: 'שימוש ב-Claude לכתיבת תוכנית לימודים',
                            prompt: 'עזור לי לכתוב תוכנית לימודים לקורס בנושא בינה מלאכותית לסטודנטים בשנה ראשונה',
                            result: 'להלן תוכנית לימודים מוצעת לקורס בנושא בינה מלאכותית...'
                        }
                    ],
                    tips: [
                        'נצל את היכולת של Claude לעבד מסמכים ארוכים',
                        'השתמש בהוראות ברורות ומפורטות',
                        'חלק משימות מורכבות למספר שאילתות קטנות יותר',
                        'בקש מ-Claude להסביר את החשיבה שלו',
                        'השתמש ב-Claude לסיעור מוחות ולפיתוח רעיונות'
                    ]
                },
                {
                    id: 'codewhisperer',
                    name: 'Amazon CodeWhisperer',
                    category: 'כלי פיתוח קוד',
                    icon: 'fa-code',
                    shortDescription: 'עוזר קוד מבוסס AI מבית Amazon',
                    description: 'Amazon CodeWhisperer הוא כלי עזר לפיתוח קוד המבוסס על AI. הוא משתלב בסביבות פיתוח שונות ומציע השלמות קוד חכמות בזמן אמת.',
                    url: 'https://aws.amazon.com/codewhisperer/',
                    usageSteps: [
                        'התקן את התוסף של CodeWhisperer בסביבת הפיתוח שלך',
                        'התחבר לחשבון AWS שלך או צור חשבון חינמי',
                        'התחל לכתוב קוד או תיעוד בקוד',
                        'CodeWhisperer יציע השלמות קוד בזמן אמת',
                        'לחץ על Tab לקבלת ההצעה או המשך לכתוב'
                    ],
                    examples: [
                        {
                            title: 'כתיבת פונקציה לעבודה עם AWS',
                            description: 'שימוש ב-CodeWhisperer לכתיבת פונקציה לעבודה עם AWS',
                            prompt: '// פונקציה להעלאת קובץ ל-S3',
                            result: 'function uploadToS3(bucket, key, body) {\n  const s3 = new AWS.S3();\n  return s3.upload({\n    Bucket: bucket,\n    Key: key,\n    Body: body\n  }).promise();\n}'
                        },
                        {
                            title: 'יצירת API בסיסי',
                            description: 'שימוש ב-CodeWhisperer ליצירת API בסיסי',
                            prompt: '// יצירת API בסיסי עם Express',
                            result: 'const express = require(\'express\');\nconst app = express();\nconst port = 3000;\n\napp.get(\'/\', (req, res) => {\n  res.send(\'Hello World!\');\n});\n\napp.listen(port, () => {\n  console.log(`Server running at http://localhost:${port}`);\n});'
                        }
                    ],
                    tips: [
                        'כתוב תיעוד ברור לפני הקוד כדי לקבל הצעות טובות יותר',
                        'השתמש בשמות משתנים ופונקציות משמעותיים',
                        'בדוק תמיד את הקוד שמיוצר על ידי CodeWhisperer',
                        'CodeWhisperer מצטיין במיוחד בקוד הקשור לשירותי AWS',
                        'השתמש ב-CodeWhisperer כעוזר, לא כמחליף לחשיבה שלך'
                    ]
                }
            ],
            prompts: [
                {
                    id: 'prompt1',
                    title: 'הסבר מושג תכנותי',
                    category: 'למידה',
                    tags: ['למידה', 'תכנות', 'הסבר'],
                    description: 'פרומפט להסבר מושג תכנותי באופן ברור ומפורט',
                    text: 'הסבר לי את המושג [מושג תכנותי] כאילו אני סטודנט שנה ראשונה במדעי המחשב. כלול בהסבר:\n1. הגדרה בסיסית\n2. מדוע המושג חשוב\n3. דוגמאות קוד פשוטות\n4. שימושים נפוצים\n5. טעויות נפוצות שיש להימנע מהן',
                    example: 'הסבר על מושג הרקורסיה בתכנות, כולל דוגמאות קוד והסבר על מקרי בסיס ומקרי רקורסיה...',
                    tips: [
                        'החלף את [מושג תכנותי] במושג הספציפי שאתה מעוניין ללמוד עליו',
                        'אם ההסבר מורכב מדי, בקש הסבר פשוט יותר',
                        'אם ההסבר פשוט מדי, בקש הסבר מעמיק יותר'
                    ],
                    relatedPrompts: ['prompt2', 'prompt5'],
                    recommendedTool: 'chatgpt'
                },
                {
                    id: 'prompt2',
                    title: 'דיבוג קוד',
                    category: 'פיתוח',
                    tags: ['דיבוג', 'קוד', 'פתרון בעיות'],
                    description: 'פרומפט לאיתור ותיקון באגים בקוד',
                    text: 'יש לי באג בקוד הבא:\n\n```\n[הכנס את הקוד כאן]\n```\n\nהשגיאה שאני מקבל היא:\n[הכנס את הודעת השגיאה כאן]\n\nאנא:\n1. הסבר מה הבעיה בקוד\n2. הצע תיקון לקוד\n3. הסבר מדוע התיקון פותר את הבעיה\n4. הצע דרכים למנוע בעיות דומות בעתיד',
                    example: 'ניתוח של באג בקוד פייתון, כולל הסבר על בעיית אינדקס מחוץ לטווח והצעה לתיקון...',
                    tips: [
                        'כלול את כל הקוד הרלוונטי, לא רק את השורה עם הבאג',
                        'העתק את הודעת השגיאה המדויקת',
                        'ציין את השפה והגרסה שבה אתה משתמש'
                    ],
                    relatedPrompts: ['prompt1', 'prompt3'],
                    recommendedTool: 'github-copilot'
                },
                {
                    id: 'prompt3',
                    title: 'יצירת תוכנית לימודים',
                    category: 'חינוך',
                    tags: ['חינוך', 'תכנון', 'למידה'],
                    description: 'פרומפט ליצירת תוכנית לימודים מפורטת',
                    text: 'אנא צור תוכנית לימודים מפורטת לקורס בנושא [נושא] לסטודנטים [רמה]. התוכנית צריכה לכלול:\n\n1. מטרות הקורס\n2. יעדי למידה\n3. מבנה הקורס (10-14 שיעורים)\n4. תיאור קצר של כל שיעור\n5. משימות ופרויקטים מוצעים\n6. שיטות הערכה\n7. משאבים מומלצים\n\nהתוכנית צריכה להיות מותאמת לרמת הסטודנטים ולהתמקד בלמידה מעשית ותיאורטית.',
                    example: 'תוכנית לימודים מפורטת לקורס בנושא בינה מלאכותית, כולל מטרות, יעדים, מבנה, ומשימות...',
                    tips: [
                        'ציין את הנושא המדויק של הקורס',
                        'הגדר את רמת הסטודנטים (מתחילים, מתקדמים, וכו\')',
                        'אם יש לך דרישות ספציפיות, כלול אותן בפרומפט'
                    ],
                    relatedPrompts: ['prompt1', 'prompt4'],
                    recommendedTool: 'claude'
                },
                {
                    id: 'prompt4',
                    title: 'יצירת פונקציה',
                    category: 'פיתוח',
                    tags: ['קוד', 'פיתוח', 'פונקציה'],
                    description: 'פרומפט ליצירת פונקציה בשפת תכנות ספציפית',
                    text: 'אנא כתוב פונקציה ב[שפת תכנות] שמבצעת את הפעולה הבאה:\n\n[תיאור הפעולה]\n\nדרישות:\n1. הפונקציה צריכה לקבל את הפרמטרים הבאים: [פרמטרים]\n2. הפונקציה צריכה להחזיר: [ערך החזרה]\n3. הפונקציה צריכה לטפל במקרי קצה הבאים: [מקרי קצה]\n4. הוסף תיעוד מפורט לפונקציה\n5. הוסף דוגמאות שימוש',
                    example: 'פונקציה בפייתון שממיינת מערך של מספרים בסדר עולה, כולל תיעוד ודוגמאות שימוש...',
                    tips: [
                        'ציין את שפת התכנות הספציפית',
                        'תאר את הפעולה באופן ברור ומפורט',
                        'ציין את כל הדרישות והמגבלות'
                    ],
                    relatedPrompts: ['prompt2', 'prompt5'],
                    recommendedTool: 'github-copilot'
                },
                {
                    id: 'prompt5',
                    title: 'ניתוח אלגוריתם',
                    category: 'למידה',
                    tags: ['אלגוריתמים', 'ניתוח', 'סיבוכיות'],
                    description: 'פרומפט לניתוח אלגוריתם וסיבוכיות הזמן והמקום שלו',
                    text: 'אנא נתח את האלגוריתם הבא:\n\n```\n[הכנס את האלגוריתם כאן]\n```\n\nבניתוח שלך, כלול:\n1. הסבר כללי על מה האלגוריתם עושה\n2. ניתוח סיבוכיות זמן (במקרה הטוב, הממוצע, והגרוע)\n3. ניתוח סיבוכיות מקום\n4. יתרונות וחסרונות של האלגוריתם\n5. מקרים שבהם האלגוריתם מתאים במיוחד\n6. אלגוריתמים חלופיים שיכולים לפתור את אותה בעיה',
                    example: 'ניתוח של אלגוריתם מיון מהיר (Quick Sort), כולל סיבוכיות זמן ומקום, יתרונות וחסרונות...',
                    tips: [
                        'הצג את האלגוריתם בצורה ברורה, עדיף כקוד או פסאודו-קוד',
                        'אם יש לך שאלות ספציפיות על האלגוריתם, כלול אותן בפרומפט',
                        'ציין את ההקשר שבו האלגוריתם משמש'
                    ],
                    relatedPrompts: ['prompt1', 'prompt4'],
                    recommendedTool: 'gemini'
                }
            ]
        };
    }

    /**
     * Get a random progress value based on module number
     * @param {number} moduleNumber - The module number
     * @returns {number} A random progress value
     */
    getRandomProgress(moduleNumber) {
        if (moduleNumber <= 4) {
            return 100; // Completed modules
        } else if (moduleNumber === 5) {
            return 80; // Current module
        } else if (moduleNumber === 6) {
            return 40; // Just started
        } else if (moduleNumber === 7) {
            return 10; // Just started
        } else {
            return 0; // Not started
        }
    }

    /**
     * Initialize API endpoints
     */
    initializeEndpoints() {
        // User API
        this.user = {
            getUser: async () => {
                return this.userData;
            }
        };
        
        // Dashboard API
        this.dashboard = {
            getDashboardData: async () => {
                return {
                    overallProgress: 65,
                    currentModules: [
                        { id: 'module5', title: 'פתרון בעיות ודיבוג בעזרת Gen AI', progress: 80 },
                        { id: 'module6', title: 'חשיבה ביקורתית וכלי Gen AI', progress: 40 }
                    ],
                    upcomingAssignments: this.assignmentsData.filter(a => a.status !== 'completed').slice(0, 3),
                    recentNotifications: [
                        { id: 'notification1', title: 'משימה חדשה נוספה: ניתוח ביקורתי של פלט AI', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
                        { id: 'notification2', title: 'תזכורת: הגשת פרויקט אמצע עד יום שישי', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
                        { id: 'notification3', title: 'שיעור חדש זמין: חשיבה ביקורתית וכלי Gen AI', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true }
                    ],
                    recentActivities: [
                        { id: 'activity1', title: 'השלמת יחידת לימוד: זיהוי שגיאות קוד', type: 'content', timestamp: new Date(Date.now() - 7200000).toISOString() },
                        { id: 'activity2', title: 'הגשת משימה: תרגיל 5.2', type: 'assignment', timestamp: new Date(Date.now() - 86400000).toISOString() },
                        { id: 'activity3', title: 'תגובה בפורום: שימוש ב-GitHub Copilot', type: 'forum', timestamp: new Date(Date.now() - 172800000).toISOString() }
                    ],
                    performance: {
                        averageGrade: 85,
                        trend: 'rising'
                    },
                    popularAiTools: [
                        { id: 'chatgpt', name: 'ChatGPT', icon: 'fa-comment-dots', description: 'מודל שפה גדול מבית OpenAI' },
                        { id: 'github-copilot', name: 'GitHub Copilot', icon: 'fa-code', description: 'עוזר קוד מבוסס AI' },
                        { id: 'gemini', name: 'Google Gemini', icon: 'fa-gem', description: 'מודל שפה גדול מבית Google' }
                    ]
                };
            }
        };
        
        // Course API
        this.course = {
            getModules: async () => {
                return this.courseData.modules;
            },
            getModule: async (moduleId) => {
                return this.courseData.modules.find(m => m.id === moduleId);
            }
        };
        
        // Assignments API
        this.assignments = {
            getAssignments: async () => {
                return this.assignmentsData;
            },
            getAssignment: async (assignmentId) => {
                return this.assignmentsData.find(a => a.id === assignmentId);
            },
            submitAssignment: async (assignmentId, submission) => {
                const assignment = this.assignmentsData.find(a => a.id === assignmentId);
                if (assignment) {
                    assignment.status = 'completed';
                    assignment.submissionDate = new Date().toISOString();
                    return { success: true, message: 'המשימה הוגשה בהצלחה' };
                }
                return { success: false, message: 'לא נמצאה משימה עם המזהה שצוין' };
            }
        };
        
        // Analytics API
        this.analytics = {
            getAnalyticsData: async () => {
                return this.analyticsData;
            }
        };
        
        // AI Tools API
        this.aiTools = {
            getTools: async () => {
                return this.aiToolsData;
            },
            getTool: async (toolId) => {
                return this.aiToolsData.tools.find(t => t.id === toolId);
            },
            getPrompt: async (promptId) => {
                return this.aiToolsData.prompts.find(p => p.id === promptId);
            }
        };
        
        // Content API
        this.content = {
            getCourseStructure: async () => {
                return { content: this.courseData.structure };
            },
            getModuleContent: async (moduleId) => {
                const module = this.courseData.modules.find(m => m.id === moduleId);
                if (module) {
                    return { content: this.generateModuleContent(module) };
                }
                return { content: '' };
            }
        };
    }

    /**
     * Generate module content
     * @param {Object} module - The module object
     * @returns {string} The module content
     */
    generateModuleContent(module) {
        return `# ${module.title}

## מבוא

מודול זה עוסק ב${module.title}. במהלך המודול נלמד על ${module.topics}.

## נושאים מרכזיים

${module.units.map(unit => `## ${unit.title}

${unit.content}

`).join('\n')}

## משאבים נוספים

${module.units.flatMap(unit => unit.resources).map(resource => `- [${resource.title}](${resource.url})`).join('\n')}

## כלי AI רלוונטיים

${module.units.flatMap(unit => unit.relatedAiTools).map(tool => `- ${tool.name}`).join('\n')}
`;
    }
}

// Initialize and export the API mock
window.API = new APIMock();
