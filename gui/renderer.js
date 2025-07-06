const { ipcRenderer } = require('electron');

// Global variables
let isScraping = false;
let autoScroll = true;
let logEntries = [];
let currentProjectFolder = null;

// DOM elements
const elements = {
    // Configuration
    categorySelect: document.getElementById('categorySelect'),
    subcategorySelect: document.getElementById('subcategorySelect'),
    customSearch: document.getElementById('customSearch'),
    zipCode: document.getElementById('zipCode'),
    parallelPages: document.getElementById('parallelPages'),
    
    // Checkboxes
    extractPhotos: document.getElementById('extractPhotos'),
    extractReviews: document.getElementById('extractReviews'),
    extractRatings: document.getElementById('extractRatings'),
    extractContact: document.getElementById('extractContact'),
    extractHours: document.getElementById('extractHours'),
    extractServices: document.getElementById('extractServices'),
    
    // Buttons
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    clearLogBtn: document.getElementById('clearLogBtn'),
    openFolderBtn: document.getElementById('openFolderBtn'),
    autoScrollBtn: document.getElementById('autoScrollBtn'),
    exportLogBtn: document.getElementById('exportLogBtn'),
    increaseParallel: document.getElementById('increaseParallel'),
    decreaseParallel: document.getElementById('decreaseParallel'),
    
    // Progress and Status
    progressText: document.getElementById('progressText'),
    progressPercent: document.getElementById('progressPercent'),
    progressFill: document.getElementById('progressFill'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    
    // Statistics
    pagesProcessed: document.getElementById('pagesProcessed'),
    businessesFound: document.getElementById('businessesFound'),
    dataFields: document.getElementById('dataFields'),
    successRate: document.getElementById('successRate'),
    
    // Log
    logContent: document.getElementById('logContent'),
    logContainer: document.getElementById('logContainer'),
    
    // Modal
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    addLogEntry('info', 'GUI initialized successfully');
});

// Initialize application
async function initializeApp() {
    try {
        // Load business categories
        const categories = await ipcRenderer.invoke('get-categories');
        populateCategories(categories);
        
        // Set default values
        elements.zipCode.value = '';
        elements.parallelPages.value = '3';
        
        addLogEntry('info', 'Categories loaded successfully');
    } catch (error) {
        addLogEntry('error', `Failed to initialize: ${error.message}`);
        showErrorModal('Initialization Error', error.message);
    }
}

// Populate categories dropdown
function populateCategories(categories) {
    elements.categorySelect.innerHTML = '<option value="">Select a category...</option>';
    
    Object.keys(categories).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.categorySelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Category selection
    elements.categorySelect.addEventListener('change', handleCategoryChange);
    
    // Custom search
    elements.customSearch.addEventListener('input', handleCustomSearch);
    
    // Buttons
    elements.startBtn.addEventListener('click', startScraping);
    elements.stopBtn.addEventListener('click', stopScraping);
    elements.clearLogBtn.addEventListener('click', clearLog);
    elements.openFolderBtn.addEventListener('click', openProjectFolder);
    elements.autoScrollBtn.addEventListener('click', toggleAutoScroll);
    elements.exportLogBtn.addEventListener('click', exportLog);
    
    // Parallel controls
    elements.increaseParallel.addEventListener('click', increaseParallelPages);
    elements.decreaseParallel.addEventListener('click', decreaseParallelPages);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeErrorModal);
    window.addEventListener('click', (event) => {
        if (event.target === elements.errorModal) {
            closeErrorModal();
        }
    });
    
    // IPC listeners
    ipcRenderer.on('log-message', handleLogMessage);
    ipcRenderer.on('update-progress', handleProgressUpdate);
    ipcRenderer.on('scraping-complete', handleScrapingComplete);
    ipcRenderer.on('scraping-error', handleScrapingError);
}

// Handle category change
function handleCategoryChange() {
    const selectedCategory = elements.categorySelect.value;
    const subcategorySelect = elements.subcategorySelect;
    
    if (selectedCategory) {
        // Enable subcategory selection
        subcategorySelect.disabled = false;
        subcategorySelect.innerHTML = '<option value="">Select a subcategory...</option>';
        
        // Get subcategories for selected category
        ipcRenderer.invoke('get-categories').then(categories => {
            const subcategories = categories[selectedCategory] || [];
            subcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory;
                option.textContent = subcategory;
                subcategorySelect.appendChild(option);
            });
        });
        
        addLogEntry('info', `Selected category: ${selectedCategory}`);
    } else {
        subcategorySelect.disabled = true;
        subcategorySelect.innerHTML = '<option value="">Select a subcategory...</option>';
    }
}

// Handle custom search input
function handleCustomSearch() {
    const customSearch = elements.customSearch.value;
    if (customSearch) {
        addLogEntry('info', `Custom search term: ${customSearch}`);
    }
}

/**
 * Increases the number of parallel pages for scraping
 * This function handles the "+" button click for parallel page control
 * It validates against the maximum limit (20) and provides user feedback
 * The function ensures the value stays within acceptable bounds for optimal performance
 */
function increaseParallelPages() {
    // Parse current value from input field, default to 3 if invalid
    const currentValue = parseInt(elements.parallelPages.value) || 3;
    // Get maximum allowed value from input attributes, default to 20
    const maxValue = parseInt(elements.parallelPages.max) || 20;
    
    // Check if we can increase the value without exceeding maximum
    if (currentValue < maxValue) {
        // Increment the parallel pages value
        elements.parallelPages.value = currentValue + 1;
        // Log the successful increase for user feedback
        addLogEntry('info', `Increased parallel pages to ${currentValue + 1}`);
    } else {
        // Warn user when maximum limit is reached
        addLogEntry('warning', `Maximum parallel pages (${maxValue}) reached`);
    }
}

/**
 * Decreases the number of parallel pages for scraping
 * This function handles the "-" button click for parallel page control
 * It validates against the minimum limit (1) and provides user feedback
 * The function ensures the value stays within acceptable bounds for optimal performance
 */
function decreaseParallelPages() {
    // Parse current value from input field, default to 3 if invalid
    const currentValue = parseInt(elements.parallelPages.value) || 3;
    // Get minimum allowed value from input attributes, default to 1
    const minValue = parseInt(elements.parallelPages.min) || 1;
    
    // Check if we can decrease the value without going below minimum
    if (currentValue > minValue) {
        // Decrement the parallel pages value
        elements.parallelPages.value = currentValue - 1;
        // Log the successful decrease for user feedback
        addLogEntry('info', `Decreased parallel pages to ${currentValue - 1}`);
    } else {
        // Warn user when minimum limit is reached
        addLogEntry('warning', `Minimum parallel pages (${minValue}) reached`);
    }
}

// Start scraping
async function startScraping() {
    if (isScraping) {
        addLogEntry('warning', 'Scraping is already in progress');
        return;
    }
    
    // Validate inputs
    const zipCode = elements.zipCode.value.trim();
    if (!zipCode) {
        showErrorModal('Validation Error', 'Please enter a zip code');
        return;
    }
    
    const category = elements.categorySelect.value;
    const subcategory = elements.subcategorySelect.value;
    const customSearch = elements.customSearch.value.trim();
    
    if (!category && !customSearch) {
        showErrorModal('Validation Error', 'Please select a category or enter a custom search term');
        return;
    }
    
    // Prepare configuration
    const scrapingConfig = {
        category: subcategory || category,
        searchTerm: customSearch || category,
        zipCode: zipCode,
        parallelPages: elements.parallelPages.value,
        options: {
            extractPhotos: elements.extractPhotos.checked,
            extractReviews: elements.extractReviews.checked,
            extractRatings: elements.extractRatings.checked,
            extractContact: elements.extractContact.checked,
            extractHours: elements.extractHours.checked,
            extractServices: elements.extractServices.checked
        }
    };
    
    try {
        // Update UI state
        setScrapingState(true);
        addLogEntry('info', 'Starting scraping process...');
        
        // Start scraping
        const result = await ipcRenderer.invoke('start-scraping', scrapingConfig);
        
        if (result.success) {
            addLogEntry('success', result.message);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        addLogEntry('error', `Failed to start scraping: ${error.message}`);
        setScrapingState(false);
        showErrorModal('Scraping Error', error.message);
    }
}

// Stop scraping
async function stopScraping() {
    try {
        const result = await ipcRenderer.invoke('stop-scraping');
        
        if (result.success) {
            addLogEntry('warning', result.message);
            setScrapingState(false);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        addLogEntry('error', `Failed to stop scraping: ${error.message}`);
        showErrorModal('Stop Error', error.message);
    }
}

// Set scraping state
function setScrapingState(scraping) {
    isScraping = scraping;
    
    // Update buttons
    elements.startBtn.disabled = scraping;
    elements.stopBtn.disabled = !scraping;
    elements.openFolderBtn.disabled = true;
    
    // Update status
    const statusIndicator = elements.statusIndicator;
    const statusText = elements.statusText;
    
    if (scraping) {
        statusIndicator.className = 'status-indicator running';
        statusText.textContent = 'Running';
    } else {
        statusIndicator.className = 'status-indicator ready';
        statusText.textContent = 'Ready';
    }
    
    // Disable/enable form controls
    const formControls = [
        elements.categorySelect,
        elements.subcategorySelect,
        elements.customSearch,
        elements.zipCode,
        elements.parallelPages
    ];
    
    formControls.forEach(control => {
        control.disabled = scraping;
    });
}

// Clear log
function clearLog() {
    elements.logContent.innerHTML = '';
    logEntries = [];
    addLogEntry('info', 'Log cleared');
}

// Open project folder
async function openProjectFolder() {
    if (!currentProjectFolder) {
        addLogEntry('warning', 'No project folder available');
        return;
    }
    
    try {
        const result = await ipcRenderer.invoke('open-project-folder', currentProjectFolder);
        
        if (result.success) {
            addLogEntry('success', 'Project folder opened');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        addLogEntry('error', `Failed to open project folder: ${error.message}`);
        showErrorModal('Folder Error', error.message);
    }
}

// Toggle auto-scroll
function toggleAutoScroll() {
    autoScroll = !autoScroll;
    elements.autoScrollBtn.classList.toggle('active', autoScroll);
    addLogEntry('info', `Auto-scroll ${autoScroll ? 'enabled' : 'disabled'}`);
}

// Export log
function exportLog() {
    if (logEntries.length === 0) {
        addLogEntry('warning', 'No log entries to export');
        return;
    }
    
    try {
        const logText = logEntries.map(entry => 
            `[${entry.timestamp}] ${entry.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraper-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addLogEntry('success', 'Log exported successfully');
    } catch (error) {
        addLogEntry('error', `Failed to export log: ${error.message}`);
    }
}

// Handle log message from main process
function handleLogMessage(event, data) {
    addLogEntry('info', data.message, data.timestamp);
}

// Handle progress update
function handleProgressUpdate(event, data) {
    const { current, total, percentage } = data;
    
    elements.progressText.textContent = `Page ${current} of ${total}`;
    elements.progressPercent.textContent = `${percentage}%`;
    elements.progressFill.style.width = `${percentage}%`;
    
    // Update statistics
    elements.pagesProcessed.textContent = current;
    
    if (percentage === 100) {
        elements.statusIndicator.className = 'status-indicator complete';
        elements.statusText.textContent = 'Complete';
    }
}

// Handle scraping complete
function handleScrapingComplete(event, data) {
    setScrapingState(false);
    currentProjectFolder = data.projectFolder;
    
    elements.openFolderBtn.disabled = false;
    elements.statusIndicator.className = 'status-indicator complete';
    elements.statusText.textContent = 'Complete';
    
    addLogEntry('success', 'Scraping completed successfully!');
    addLogEntry('info', `Project folder: ${data.projectFolder}`);
}

// Handle scraping error
function handleScrapingError(event, data) {
    setScrapingState(false);
    addLogEntry('error', `Scraping error: ${data.error}`);
    showErrorModal('Scraping Error', data.error);
}

// Add log entry
function addLogEntry(type, message, timestamp = null) {
    const entry = {
        type: type,
        message: message,
        timestamp: timestamp || new Date().toISOString()
    };
    
    logEntries.push(entry);
    
    // Create log entry element
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    const timeStr = new Date(entry.timestamp).toLocaleTimeString();
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timeStr}]</span>
        <span class="log-message">${entry.message}</span>
    `;
    
    elements.logContent.appendChild(logEntry);
    
    // Auto-scroll
    if (autoScroll) {
        elements.logContent.scrollTop = elements.logContent.scrollHeight;
    }
    
    // Update statistics based on log content
    updateStatistics();
}

// Update statistics
function updateStatistics() {
    const totalEntries = logEntries.length;
    const successEntries = logEntries.filter(entry => entry.type === 'success').length;
    const errorEntries = logEntries.filter(entry => entry.type === 'error').length;
    
    // Extract business count from log messages
    const businessMatches = logEntries
        .filter(entry => entry.message.includes('businesses processed'))
        .map(entry => {
            const match = entry.message.match(/(\d+) businesses processed/);
            return match ? parseInt(match[1]) : 0;
        });
    
    const maxBusinesses = businessMatches.length > 0 ? Math.max(...businessMatches) : 0;
    elements.businessesFound.textContent = maxBusinesses;
    
    // Calculate success rate
    const successRate = totalEntries > 0 ? Math.round((successEntries / totalEntries) * 100) : 0;
    elements.successRate.textContent = `${successRate}%`;
    
    // Extract data fields count
    const fieldMatches = logEntries
        .filter(entry => entry.message.includes('Data Fields:'))
        .map(entry => {
            const match = entry.message.match(/Data Fields: (\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
    
    const maxFields = fieldMatches.length > 0 ? Math.max(...fieldMatches) : 0;
    elements.dataFields.textContent = maxFields;
}

// Show error modal
function showErrorModal(title, message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.style.display = 'block';
}

// Close error modal
function closeErrorModal() {
    elements.errorModal.style.display = 'none';
}

// Global function for modal close (called from HTML)
window.closeErrorModal = closeErrorModal; 