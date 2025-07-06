/**
 * Yellowpages.com Business Scraper
 * =================================
 * 
 * This is a comprehensive, modular web scraper designed to extract detailed business information
 * from Yellowpages.com. The scraper features:
 * 
 * - Dynamic field detection and extraction
 * - Category and subcategory selection
 * - Parallel processing for efficiency
 * - Comprehensive error handling
 * - Detailed logging and progress tracking
 * - CSV export with dynamic headers
 * - Ad filtering and duplicate removal
 * 
 * @author: AI Assistant
 * @version: 2.0.0
 * @license: MIT
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Configure logging system
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLogLevel = LOG_LEVELS.INFO;
let logFile = null;
let sessionStartTime = null;

/**
 * LOGGING FUNCTIONS
 * ================
 * 
 * Comprehensive logging system that outputs to both console and file
 * with timestamps, log levels, and structured formatting.
 */

// Initialize logging system
function initializeLogging(searchTerm, zipCode) {
  sessionStartTime = new Date();
  const timestamp = sessionStartTime.toISOString().replace(/[:.]/g, '-');
  const logDir = 'logs';
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  logFile = path.join(logDir, `scrape_${searchTerm}_${zipCode}_${timestamp}.log`);
  
  // Write session header to log file
  const sessionHeader = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    YELLOWPAGES SCRAPER SESSION STARTED                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Session ID: ${timestamp}                                                    ║
║ Search Term: ${searchTerm}                                                  ║
║ Zip Code: ${zipCode}                                                        ║
║ Start Time: ${sessionStartTime.toLocaleString()}                            ║
║ Log File: ${logFile}                                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
  
  fs.appendFileSync(logFile, sessionHeader);
  console.log(sessionHeader);
}

// Log function with multiple levels and file output
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  const levelName = levelNames[level];
  
  // Only log if current level is sufficient
  if (level < currentLogLevel) return;
  
  // Format the log message
  let logMessage = `[${timestamp}] [${levelName}] ${message}`;
  
  // Add data if provided
  if (data) {
    if (typeof data === 'object') {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    } else {
      logMessage += ` | Data: ${data}`;
    }
  }
  
  // Output to console with color coding
  const colors = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m',  // Green
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m'  // Red
  };
  
  console.log(`${colors[levelName]}${logMessage}\x1b[0m`);
  
  // Write to log file
  if (logFile) {
    fs.appendFileSync(logFile, logMessage + '\n');
  }
}

// Convenience functions for different log levels
function logDebug(message, data = null) { log(LOG_LEVELS.DEBUG, message, data); }
function logInfo(message, data = null) { log(LOG_LEVELS.INFO, message, data); }
function logWarn(message, data = null) { log(LOG_LEVELS.WARN, message, data); }
function logError(message, data = null) { log(LOG_LEVELS.ERROR, message, data); }

// Log session completion
function logSessionCompletion(stats) {
  const endTime = new Date();
  const duration = endTime - sessionStartTime;
  const durationMinutes = Math.floor(duration / 60000);
  const durationSeconds = Math.floor((duration % 60000) / 1000);
  
  const sessionFooter = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    YELLOWPAGES SCRAPER SESSION COMPLETED                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ End Time: ${endTime.toLocaleString()}                                      ║
║ Duration: ${durationMinutes}m ${durationSeconds}s                          ║
║ Total Businesses Scraped: ${stats.totalBusinesses || 0}                    ║
║ Total Pages Processed: ${stats.totalPages || 0}                            ║
║ Successful Extractions: ${stats.successfulExtractions || 0}                ║
║ Failed Extractions: ${stats.failedExtractions || 0}                        ║
║ CSV File: ${stats.csvFile || 'N/A'}                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
  
  fs.appendFileSync(logFile, sessionFooter);
  console.log(sessionFooter);
}

/**
 * BUSINESS CATEGORIES CONFIGURATION
 * =================================
 * 
 * Comprehensive mapping of business categories and their corresponding search terms
 * used by Yellowpages.com. Each category includes:
 * - name: Display name for the category
 * - searchTerm: URL parameter used for searching
 * - subcategories: Nested categories with their own search terms
 * 
 * The structure supports both broad categories (e.g., "Restaurants") and specific
 * subcategories (e.g., "Italian Restaurants", "Pizza") to provide granular search
 * capabilities.
 */
const BUSINESS_CATEGORIES = {
  1: { name: 'Restaurants', searchTerm: 'restaurants', subcategories: {
    1: { name: 'All Restaurants', searchTerm: 'restaurants' },
    2: { name: 'Italian Restaurants', searchTerm: 'italian-restaurants' },
    3: { name: 'Chinese Restaurants', searchTerm: 'chinese-restaurants' },
    4: { name: 'Mexican Restaurants', searchTerm: 'mexican-restaurants' },
    5: { name: 'Pizza', searchTerm: 'pizza' },
    6: { name: 'Fast Food', searchTerm: 'fast-food-restaurants' },
    7: { name: 'Seafood Restaurants', searchTerm: 'seafood-restaurants' },
    8: { name: 'Steak Houses', searchTerm: 'steak-houses' },
    9: { name: 'Thai Restaurants', searchTerm: 'thai-restaurants' },
    10: { name: 'Japanese Restaurants', searchTerm: 'japanese-restaurants' },
    11: { name: 'Sushi Bars', searchTerm: 'sushi-bars' },
    12: { name: 'Indian Restaurants', searchTerm: 'indian-restaurants' },
    13: { name: 'Korean Restaurants', searchTerm: 'korean-restaurants' },
    14: { name: 'Mediterranean Restaurants', searchTerm: 'mediterranean-restaurants' },
    15: { name: 'Breakfast & Brunch', searchTerm: 'breakfast-brunch-lunch-restaurants' },
    16: { name: 'Cuban Restaurants', searchTerm: 'cuban-restaurants' },
    17: { name: 'Vegetarian Restaurants', searchTerm: 'vegetarian-restaurants' },
    18: { name: 'Barbecue Restaurants', searchTerm: 'barbecue-restaurants' },
    19: { name: 'Take Out Restaurants', searchTerm: 'take-out-restaurants' },
    20: { name: 'Family Style Restaurants', searchTerm: 'family-style-restaurants' },
    21: { name: 'Custom Restaurant Search', searchTerm: null }
  }},
  2: { name: 'Auto Services', searchTerm: 'auto-repair-service', subcategories: {
    1: { name: 'All Auto Services', searchTerm: 'auto-repair-service' },
    2: { name: 'Auto Body Shops', searchTerm: 'automobile-body-repairing-painting' },
    3: { name: 'Auto Glass Repair', searchTerm: 'windshield-repair' },
    4: { name: 'Auto Parts', searchTerm: 'automobile-parts-supplies' },
    5: { name: 'Car Detailing', searchTerm: 'automobile-detailing' },
    6: { name: 'Oil Change', searchTerm: 'auto-oil-lube' },
    7: { name: 'Tire Shops', searchTerm: 'tire-dealers' },
    8: { name: 'Towing', searchTerm: 'towing' },
    9: { name: 'Custom Auto Search', searchTerm: null }
  }},
  3: { name: 'Beauty & Personal Care', searchTerm: 'beauty-salons', subcategories: {
    1: { name: 'All Beauty Services', searchTerm: 'beauty-salons' },
    2: { name: 'Hair Salons', searchTerm: 'beauty-salons' },
    3: { name: 'Nail Salons', searchTerm: 'nail-salons' },
    4: { name: 'Barber Shops', searchTerm: 'barbers' },
    5: { name: 'Massage Therapy', searchTerm: 'massage-therapists' },
    6: { name: 'Day Spas', searchTerm: 'day-spas' },
    7: { name: 'Hair Removal', searchTerm: 'hair-removal' },
    8: { name: 'Custom Beauty Search', searchTerm: null }
  }},
  4: { name: 'Home Services', searchTerm: 'plumbers', subcategories: {
    1: { name: 'All Home Services', searchTerm: 'plumbers' },
    2: { name: 'Plumbers', searchTerm: 'plumbers' },
    3: { name: 'Electricians', searchTerm: 'electricians' },
    4: { name: 'AC Repair', searchTerm: 'air-conditioning-service-repair' },
    5: { name: 'Appliance Repair', searchTerm: 'major-appliance-refinishing-repair' },
    6: { name: 'Carpet Cleaning', searchTerm: 'carpet-rug-cleaners' },
    7: { name: 'Pest Control', searchTerm: 'pest-control-services' },
    8: { name: 'Moving Companies', searchTerm: 'movers' },
    9: { name: 'Custom Home Service Search', searchTerm: null }
  }},
  5: { name: 'Insurance', searchTerm: 'insurance', subcategories: {
    1: { name: 'All Insurance', searchTerm: 'insurance' },
    2: { name: 'Auto Insurance', searchTerm: 'auto-insurance' },
    3: { name: 'Home Insurance', searchTerm: 'homeowners-insurance' },
    4: { name: 'Life Insurance', searchTerm: 'life-insurance' },
    5: { name: 'Health Insurance', searchTerm: 'health-insurance' },
    6: { name: 'Business Insurance', searchTerm: 'business-commercial-insurance' },
    7: { name: 'Custom Insurance Search', searchTerm: null }
  }},
  6: { name: 'Legal Services', searchTerm: 'attorneys', subcategories: {
    1: { name: 'All Legal Services', searchTerm: 'attorneys' },
    2: { name: 'Personal Injury Lawyers', searchTerm: 'automobile-accident-attorneys' },
    3: { name: 'Family Law Attorneys', searchTerm: 'family-law-attorneys' },
    4: { name: 'Divorce Attorneys', searchTerm: 'divorce-attorneys' },
    5: { name: 'Criminal Defense Attorneys', searchTerm: 'criminal-law-attorneys' },
    6: { name: 'Real Estate Attorneys', searchTerm: 'real-estate-attorneys' },
    7: { name: 'Custom Legal Search', searchTerm: null }
  }},
  7: { name: 'Medical Services', searchTerm: 'physicians-surgeons', subcategories: {
    1: { name: 'All Medical Services', searchTerm: 'physicians-surgeons' },
    2: { name: 'Primary Care Doctors', searchTerm: 'physicians-surgeons-family-medicine' },
    3: { name: 'Dentists', searchTerm: 'dentists' },
    4: { name: 'Dermatologists', searchTerm: 'physicians-surgeons-dermatology' },
    5: { name: 'Cardiologists', searchTerm: 'physicians-surgeons-cardiovascular-diseases' },
    6: { name: 'Orthopedists', searchTerm: 'physicians-surgeons-orthopedics' },
    7: { name: 'Custom Medical Search', searchTerm: null }
  }},
  8: { name: 'Pet Services', searchTerm: 'veterinary-clinics-hospitals', subcategories: {
    1: { name: 'All Pet Services', searchTerm: 'veterinary-clinics-hospitals' },
    2: { name: 'Veterinarians', searchTerm: 'veterinary-clinics-hospitals' },
    3: { name: 'Pet Grooming', searchTerm: 'pet-grooming' },
    4: { name: 'Pet Boarding', searchTerm: 'pet-boarding-kennels' },
    5: { name: 'Dog Training', searchTerm: 'dog-training' },
    6: { name: 'Custom Pet Service Search', searchTerm: null }
  }},
  9: { name: 'Dentists', searchTerm: 'dentists' },
  10: { name: 'Electricians', searchTerm: 'electricians' },
  11: { name: 'Pest Control', searchTerm: 'pest-control-services' },
  12: { name: 'Moving Companies', searchTerm: 'movers' },
  13: { name: 'Real Estate', searchTerm: 'real-estate' },
  14: { name: 'Banks', searchTerm: 'banks' },
  15: { name: 'Schools', searchTerm: 'schools' },
  16: { name: 'Hotels', searchTerm: 'hotels' },
  17: { name: 'Gyms', searchTerm: 'health-clubs' },
  18: { name: 'Car Dealers', searchTerm: 'automobile-dealers' },
  19: { name: 'Pharmacies', searchTerm: 'pharmacies' },
  20: { name: 'Custom Search', searchTerm: null }
};



/**
 * GLOBAL CONFIGURATION OBJECT
 * ===========================
 * 
 * Central configuration object that stores all user preferences and scraping parameters.
 * This object is populated during the user configuration phase and used throughout
 * the scraping process to maintain consistency.
 */
let config = {
  businessCategory: null,    // Selected business category name
  searchTerm: null,          // URL search term for Yellowpages
  zipCode: null,            // Target zip code for location-based search
  parallelPages: 20,        // Number of pages to process in parallel (performance optimization)
  maxPages: null            // Maximum pages to scrape (null = all available pages)
};

/**
 * STATISTICS TRACKING
 * ===================
 * 
 * Global statistics object to track scraping performance and results
 * throughout the session for comprehensive reporting.
 */
let scrapingStats = {
  totalBusinesses: 0,           // Total businesses found across all pages
  totalPages: 0,               // Total pages processed
  successfulExtractions: 0,    // Successful business data extractions
  failedExtractions: 0,        // Failed business data extractions
  startTime: null,             // Session start timestamp
  endTime: null,               // Session end timestamp
  csvFile: null,               // Output CSV filename
  errors: []                   // Array of error messages for debugging
};

/**
 * USER INTERFACE SETUP
 * ====================
 * 
 * Initialize readline interface for interactive user input.
 * This provides a command-line interface for configuration and user interaction.
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * ASK QUESTION FUNCTION
 * =====================
 * 
 * Promisified wrapper around readline.question to enable async/await syntax
 * for cleaner user input handling.
 * 
 * @param {string} question - The question to display to the user
 * @returns {Promise<string>} - User's response as a string
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * DISPLAY MENU FUNCTION
 * =====================
 * 
 * Renders a numbered menu of options and captures user selection.
 * This function provides a consistent interface for all menu interactions
 * throughout the application.
 * 
 * @param {string} title - Menu title to display
 * @param {Object} options - Object containing numbered options with name properties
 * @returns {Promise<number>} - User's numeric choice
 */
async function displayMenu(title, options) {
  logInfo(`Displaying menu: ${title}`);
  
  console.log(`\n=== ${title} ===`);
  Object.keys(options).forEach(key => {
    console.log(`${key}. ${options[key].name || options[key]}`);
  });
  
  const choice = await askQuestion('\nEnter your choice (number): ');
  const numericChoice = parseInt(choice);
  
  logDebug(`User selected menu option: ${numericChoice} from ${title}`);
  return numericChoice;
}

/**
 * USER CONFIGURATION FUNCTION
 * ===========================
 * 
 * Interactive configuration process that guides users through:
 * 1. Business category selection (with subcategory support)
 * 2. Custom search term input (if applicable)
 * 3. Zip code specification
 * 4. Performance settings (parallel processing)
 * 5. Configuration confirmation
 * 
 * This function populates the global config object and initializes
 * the logging system with the selected parameters.
 * 
 * @returns {Promise<void>}
 */
async function getUserConfiguration() {
  logInfo('Starting user configuration process');
  
  console.log('🚀 Yellowpages Scraper - Configuration\n');
  
  // STEP 1: Business Category Selection
  logInfo('Step 1: Business category selection');
  const categoryChoice = await displayMenu('Select Business Category', BUSINESS_CATEGORIES);
  
  if (categoryChoice === 20) {
    // Custom search option
    logInfo('User selected custom search option');
    config.searchTerm = await askQuestion('Enter custom search term: ');
    config.businessCategory = `Custom: ${config.searchTerm}`;
    logInfo(`Custom search term set: ${config.searchTerm}`);
  } else if (BUSINESS_CATEGORIES[categoryChoice]) {
    // Valid category selected
    config.businessCategory = BUSINESS_CATEGORIES[categoryChoice].name;
    logInfo(`Selected business category: ${config.businessCategory}`);
    
    // STEP 2: Subcategory Selection (if available)
    if (BUSINESS_CATEGORIES[categoryChoice].subcategories) {
      logInfo('Category has subcategories, prompting for subcategory selection');
      console.log(`\n📋 Selected: ${config.businessCategory}`);
      
      const subcategoryChoice = await displayMenu('Select Subcategory', BUSINESS_CATEGORIES[categoryChoice].subcategories);
      
      if (BUSINESS_CATEGORIES[categoryChoice].subcategories[subcategoryChoice]) {
        const subcategory = BUSINESS_CATEGORIES[categoryChoice].subcategories[subcategoryChoice];
        
        if (subcategory.searchTerm === null) {
          // Custom subcategory search
          logInfo('User selected custom subcategory search');
          config.searchTerm = await askQuestion(`Enter custom ${config.businessCategory.toLowerCase()} search term: `);
          logInfo(`Custom subcategory search term: ${config.searchTerm}`);
        } else {
          // Predefined subcategory
          config.searchTerm = subcategory.searchTerm;
          config.businessCategory = `${config.businessCategory} - ${subcategory.name}`;
          logInfo(`Selected subcategory: ${subcategory.name} (search term: ${config.searchTerm})`);
        }
      } else {
        // Invalid subcategory choice, use default
        logWarn('Invalid subcategory choice, using default category search term');
        console.log('Invalid subcategory choice. Using default.');
        config.searchTerm = BUSINESS_CATEGORIES[categoryChoice].searchTerm;
      }
    } else {
      // No subcategories, use main category
      config.searchTerm = BUSINESS_CATEGORIES[categoryChoice].searchTerm;
      logInfo(`Using main category search term: ${config.searchTerm}`);
    }
  } else {
    // Invalid category choice, use default
    logWarn('Invalid category choice, using default: Restaurants');
    console.log('Invalid choice. Using default: Restaurants');
    config.businessCategory = 'Restaurants';
    config.searchTerm = 'restaurants';
  }
  
  // STEP 3: Zip Code Input
  logInfo('Step 3: Zip code input');
  config.zipCode = await askQuestion('Enter your zip code: ');
  logInfo(`Zip code set: ${config.zipCode}`);
  
  // STEP 4: Performance Settings
  logInfo('Step 4: Performance settings configuration');
  const parallelChoice = await askQuestion('\nNumber of pages to scrape in parallel (default: 3): ');
  config.parallelPages = parallelChoice ? parseInt(parallelChoice) : 3;
  logInfo(`Parallel pages setting: ${config.parallelPages}`);
  
  // STEP 5: Configuration Summary and Confirmation
  logInfo('Step 5: Configuration summary and confirmation');
  console.log('\n📋 Configuration Summary:');
  console.log(`Business Category: ${config.businessCategory}`);
  console.log(`Search Term: ${config.searchTerm}`);
  console.log(`Zip Code: ${config.zipCode}`);
  console.log(`Parallel Pages: ${config.parallelPages}`);
  
  const confirm = await askQuestion('\nProceed with this configuration? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    logInfo('User cancelled configuration');
    console.log('Configuration cancelled.');
    process.exit(0);
  }
  
  // Initialize logging system with configuration
  logInfo('Initializing logging system');
  initializeLogging(config.searchTerm, config.zipCode);
  
  // Log final configuration
  logInfo('Configuration completed successfully', {
    businessCategory: config.businessCategory,
    searchTerm: config.searchTerm,
    zipCode: config.zipCode,
    parallelPages: config.parallelPages
  });
  
  rl.close();
}

/**
 * FIELD ANALYSIS FUNCTION
 * =======================
 * 
 * Analyzes the DOM structure of a business page to identify which data fields
 * are available for extraction. This function uses multiple CSS selectors to
 * locate the main business information container and then systematically checks
 * for the presence of various data fields.
 * 
 * The analysis covers:
 * - Basic business information (name, contact details)
 * - Ratings and reviews from multiple platforms
 * - Business details (hours, services, categories)
 * - Media content (photos, galleries)
 * - Social media links and external references
 * - Business-specific attributes (certifications, awards)
 * 
 * This dynamic field detection ensures the scraper can adapt to different
 * page layouts and extract maximum available information.
 * 
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object|null>} - Object containing available field mappings or null if no container found
 */
async function analyzeAvailableFields(page) {
  logDebug('Starting field analysis for business page');
  
  return await page.evaluate(() => {
    // STEP 1: Locate Main Business Information Container
    // Try multiple selectors to handle different page layouts and Yellowpages updates
    const mainContainer = document.querySelector('main.container.search-monitor') || 
                         document.querySelector('main') || 
                         document.querySelector('.business-info') || 
                         document.querySelector('.listing-details') ||
                         document.querySelector('.result-details');
    
    if (!mainContainer) {
      console.log('  ❌ No main container found - page structure may have changed');
      return null;
    }
    
    console.log('  ✅ Main container located successfully');
    
    const availableFields = {};
    
    // STEP 2: Define Field Detection Function
    // Helper function to check if element exists and add to available fields
    const checkField = (selector, fieldName) => {
      if (mainContainer.querySelector(selector)) {
        availableFields[fieldName] = true;
        console.log(`    ✅ Found field: ${fieldName} (selector: ${selector})`);
      }
    };
    
    // Check for basic business information
    checkField('h1', 'businessName');
    checkField('.business-name', 'businessNameAlt');
    checkField('.business-title', 'businessTitle');
    checkField('.company-name', 'companyName');
    
    // Check for contact information
    checkField('.phone, .phones', 'phone');
    checkField('.address, .adr', 'address');
    checkField('a[href*="http"]:not([href*="yellowpages.com"])', 'website');
    checkField('.contact-info', 'contactInfo');
    checkField('.phone-number', 'phoneNumber');
    checkField('.business-phone', 'businessPhone');
    
    // Check for categories
    checkField('.categories a, .category a', 'categories');
    checkField('.business-categories', 'businessCategories');
    checkField('.service-categories', 'serviceCategories');
    
    // Check for ratings
    checkField('.result-rating', 'ypRating');
    checkField('.rating-count', 'ypRatingCount');
    checkField('.ta-rating', 'taRating');
    checkField('.ta-count', 'taRatingCount');
    checkField('.google-rating', 'googleRating');
    checkField('.facebook-rating', 'facebookRating');
    checkField('.yelp-rating', 'yelpRating');
    
    // Check for business details
    checkField('.years-in-business', 'yearsInBusiness');
    checkField('.price-range', 'priceRange');
    checkField('.hours, .business-hours', 'hours');
    checkField('.established', 'established');
    checkField('.founded', 'founded');
    checkField('.in-business-since', 'inBusinessSince');
    
    // Check for services and features
    checkField('.services li, .amenities li', 'services');
    checkField('.payment-methods li, .payment li', 'paymentMethods');
    checkField('.features li, .highlights li', 'features');
    checkField('.specialties', 'specialties');
    checkField('.services-offered', 'servicesOffered');
    checkField('.amenities', 'amenities');
    checkField('.facilities', 'facilities');
    
    // Check for description
    checkField('.description, .about', 'description');
    checkField('.business-description', 'businessDescription');
    checkField('.company-description', 'companyDescription');
    checkField('.about-us', 'aboutUs');
    
    // Check for social media
    checkField('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]', 'socialMedia');
    checkField('.social-links', 'socialLinks');
    checkField('.social-media', 'socialMediaLinks');
    
    // Check for action links
    checkField('a[href*="directions"]', 'directionsLink');
    checkField('a[href*="reviews"]', 'reviewsLink');
    checkField('a[href*="website"]', 'websiteLink');
    checkField('a[href*="menu"]', 'menuLink');
    checkField('a[href*="order"]', 'orderOnlineLink');
    checkField('a[href*="quote"]', 'quoteLink');
    checkField('a[href*="contact"]', 'contactLink');
    checkField('a[href*="appointment"]', 'appointmentLink');
    
    // Check for business status
    checkField('.claimed-status', 'claimed');
    checkField('.verified-badge', 'verified');
    checkField('.business-status', 'businessStatus');
    checkField('.listing-status', 'listingStatus');
    
    // Check for additional contact
    checkField('a[href^="mailto:"]', 'email');
    checkField('.fax', 'fax');
    checkField('.email', 'emailAddress');
    checkField('.contact-email', 'contactEmail');
    
    // Check for business-specific fields
    checkField('.cuisine', 'cuisine');
    checkField('.delivery', 'delivery');
    checkField('.takeout', 'takeout');
    checkField('.dine-in', 'dineIn');
    checkField('.insurance', 'acceptsInsurance');
    checkField('.certifications', 'certifications');
    checkField('.warranty', 'warranty');
    checkField('.practice-areas', 'practiceAreas');
    checkField('.consultation', 'consultation');
    checkField('.licensed', 'licensed');
    checkField('.bonded', 'bonded');
    checkField('.insured', 'insured');
    checkField('.accredited', 'accredited');
    checkField('.memberships', 'memberships');
    checkField('.associations', 'associations');
    
    // Check for reviews - comprehensive review analysis
    checkField('.review, .testimonial, #reviews article, #ta-reviews-container article', 'reviews');
    checkField('.customer-reviews', 'customerReviews');
    checkField('.review-section', 'reviewSection');
    checkField('.reviews-container', 'reviewsContainer');
    checkField('.review-item', 'reviewItems');
    checkField('.review-author', 'reviewAuthors');
    checkField('.review-date', 'reviewDates');
    checkField('.review-rating', 'reviewRatings');
    checkField('.review-text', 'reviewTexts');
    checkField('.review-title', 'reviewTitles');
    checkField('.review-helpful', 'reviewHelpful');
    checkField('.review-response', 'reviewResponses');
    checkField('#reviews', 'reviewsSection');
    checkField('#ta-reviews-container', 'tripAdvisorReviews');
    checkField('.ta-tab', 'tripAdvisorTab');
    
    // Check for photos
    checkField('.media-thumbnail.collage-pic, .photos img, .gallery img, .business-photos img, .image-gallery img', 'photos');
    checkField('.business-photos', 'businessPhotos');
    checkField('.image-gallery', 'imageGallery');
    checkField('.photo-gallery', 'photoGallery');
    checkField('.carousel', 'photoCarousel');
    checkField('.collage-item', 'photoCollage');
    checkField('.media-thumbnail', 'mediaThumbnails');
    
    // Check for detailed hours
    checkField('.hours .day, .business-hours .day', 'detailedHours');
    checkField('.operating-hours', 'operatingHours');
    checkField('.business-hours', 'businessHours');
    checkField('.hours-of-operation', 'hoursOfOperation');
    
    // Check for location data
    checkField('.map', 'latitude');
    checkField('.map', 'longitude');
    checkField('.location', 'location');
    checkField('.coordinates', 'coordinates');
    checkField('.neighborhood', 'neighborhood');
    checkField('.area-served', 'areaServed');
    checkField('.service-area', 'serviceArea');
    
    // Check for business IDs
    checkField('[data-ypid]', 'businessId');
    checkField('[data-listing-id]', 'listingId');
    checkField('[data-business-id]', 'dataBusinessId');
    checkField('[data-company-id]', 'dataCompanyId');
    
    // Check for additional business info
    checkField('.employees', 'employees');
    checkField('.company-size', 'companySize');
    checkField('.annual-revenue', 'annualRevenue');
    checkField('.languages', 'languages');
    checkField('.languages-spoken', 'languagesSpoken');
    checkField('.accessibility', 'accessibility');
    checkField('.wheelchair-accessible', 'wheelchairAccessible');
    checkField('.parking', 'parking');
    checkField('.free-parking', 'freeParking');
    checkField('.wifi', 'wifi');
    checkField('.free-wifi', 'freeWifi');
    
    // Check for payment and pricing
    checkField('.payment-options', 'paymentOptions');
    checkField('.credit-cards', 'creditCards');
    checkField('.cash-only', 'cashOnly');
    checkField('.pricing', 'pricing');
    checkField('.rates', 'rates');
    checkField('.price-list', 'priceList');
    checkField('.service-prices', 'servicePrices');
    
    // Check for emergency services
    checkField('.emergency', 'emergency');
    checkField('[class*="24-hour"], [class*="24hr"], .twenty-four-hour', 'twentyFourHour');
    checkField('.after-hours', 'afterHours');
    checkField('.emergency-service', 'emergencyService');
    
    // Check for certifications and awards
    checkField('.awards', 'awards');
    checkField('.certifications-list', 'certificationsList');
    checkField('.accreditations', 'accreditations');
    checkField('.recognitions', 'recognitions');
    checkField('.badges', 'badges');
    
    // Check for additional links and buttons
    checkField('.call-button', 'callButton');
    checkField('.text-button', 'textButton');
    checkField('.email-button', 'emailButton');
    checkField('.chat-button', 'chatButton');
    checkField('.online-booking', 'onlineBooking');
    checkField('.appointment-scheduler', 'appointmentScheduler');
    
    const sectionNodes = mainContainer.querySelectorAll('section, div, article');
    sectionNodes.forEach(node => {
      if (node.id) {
        availableFields[node.id + 'Section'] = true;
      } else if (node.className) {
        availableFields[node.className.split(' ').join('_') + 'Section'] = true;
      }
    });
    
    return availableFields;
  });
}

/**
 * BUSINESS DATA EXTRACTION FUNCTION
 * =================================
 * 
 * Extracts comprehensive business information from a Yellowpages business page
 * based on the available fields identified by analyzeAvailableFields().
 * 
 * This function performs the actual data extraction using the same container
 * selectors and field mappings to ensure consistency. It handles:
 * 
 * - Text extraction with proper cleaning and formatting
 * - Phone number normalization (removing "Call" text, etc.)
 * - URL extraction for websites and social media
 * - Structured data extraction (reviews, photos, hours)
 * - Boolean flag detection for features and services
 * - JSON serialization for complex data structures
 * 
 * The function is designed to be resilient to missing data and will
 * gracefully handle cases where expected elements are not present.
 * 
 * @param {Page} page - Puppeteer page object
 * @param {Object} availableFields - Object containing field availability mappings
 * @returns {Promise<Object|null>} - Extracted business data object or null if extraction fails
 */
async function extractBusinessData(page, availableFields) {
  logDebug('Starting business data extraction', { availableFieldsCount: Object.keys(availableFields).length });
  
  return await page.evaluate((fields) => {
    // STEP 1: Locate Main Business Information Container
    // Use same selectors as field analysis for consistency
    const mainContainer = document.querySelector('main.container.search-monitor') || 
                         document.querySelector('main') || 
                         document.querySelector('.business-info') || 
                         document.querySelector('.listing-details') ||
                         document.querySelector('.result-details');
    
    if (!mainContainer) {
      console.log('  ❌ No main container found during data extraction');
      return null;
    }
    
    console.log('  ✅ Main container found, beginning data extraction');
    
    const data = {};
    
    // STEP 2: Define Helper Functions for Safe Data Extraction
    // Helper function to safely extract text content
    const safeText = (element) => {
      if (!element) return null;
      const text = element.innerText?.trim();
      return text && text.length > 0 ? text : null;
    };
    
    // Helper function to safely extract attribute values
    const safeAttr = (element, attr) => {
      if (!element) return null;
      const value = element.getAttribute(attr);
      return value && value.length > 0 ? value : null;
    };
    
    // Only extract fields that are available
    if (fields.businessName) {
      data.businessName = safeText(mainContainer.querySelector('h1'));
    }
    if (fields.businessNameAlt) {
      data.businessNameAlt = safeText(mainContainer.querySelector('.business-name'));
    }
    if (fields.businessTitle) {
      data.businessTitle = safeText(mainContainer.querySelector('.business-title'));
    }
    if (fields.companyName) {
      data.companyName = safeText(mainContainer.querySelector('.company-name'));
    }
    if (fields.phone) {
      const phoneElement = mainContainer.querySelector('.phone') || mainContainer.querySelector('.phones');
      let phoneText = safeText(phoneElement);
      // Clean up phone number by removing "Call" text and extra whitespace
      if (phoneText) {
        phoneText = phoneText.replace(/Call\s*$/i, '').trim();
        // Also remove any other common suffixes
        phoneText = phoneText.replace(/\s*(Call|Text|SMS|Message)\s*$/i, '').trim();
      }
      data.phone = phoneText;
    }
    if (fields.phoneNumber) {
      let phoneText = safeText(mainContainer.querySelector('.phone-number'));
      // Clean up phone number by removing "Call" text and extra whitespace
      if (phoneText) {
        phoneText = phoneText.replace(/Call\s*$/i, '').trim();
        // Also remove any other common suffixes
        phoneText = phoneText.replace(/\s*(Call|Text|SMS|Message)\s*$/i, '').trim();
      }
      data.phoneNumber = phoneText;
    }
    if (fields.businessPhone) {
      let phoneText = safeText(mainContainer.querySelector('.business-phone'));
      // Clean up phone number by removing "Call" text and extra whitespace
      if (phoneText) {
        phoneText = phoneText.replace(/Call\s*$/i, '').trim();
        // Also remove any other common suffixes
        phoneText = phoneText.replace(/\s*(Call|Text|SMS|Message)\s*$/i, '').trim();
      }
      data.businessPhone = phoneText;
    }
    if (fields.address) {
      const addressElement = mainContainer.querySelector('.address') || mainContainer.querySelector('.adr');
      data.address = safeText(addressElement);
    }
    if (fields.website) {
      const websiteElement = mainContainer.querySelector('a[href*="http"]:not([href*="yellowpages.com"])');
      data.website = safeAttr(websiteElement, 'href');
    }
    if (fields.contactInfo) {
      data.contactInfo = safeText(mainContainer.querySelector('.contact-info'));
    }
    if (fields.categories) {
      const categories = Array.from(mainContainer.querySelectorAll('.categories a, .category a')).map(a => a.innerText.trim());
      data.categories = categories.join('; ');
    }
    if (fields.businessCategories) {
      data.businessCategories = safeText(mainContainer.querySelector('.business-categories'));
    }
    if (fields.serviceCategories) {
      data.serviceCategories = safeText(mainContainer.querySelector('.service-categories'));
    }
    if (fields.ypRating) {
      const ypRating = mainContainer.querySelector('.result-rating')?.className.match(/result-rating\s+(\w+)/)?.[1] || null;
      data.ypRating = ypRating;
    }
    if (fields.ypRatingCount) {
      data.ypRatingCount = mainContainer.querySelector('.rating-count')?.innerText?.replace(/[()]/g, '').trim() || null;
    }
    if (fields.taRating) {
      const taRating = mainContainer.querySelector('.ta-rating')?.className.match(/ta-(\d-\d)/)?.[1]?.replace('-', '.') || null;
      data.taRating = taRating;
    }
    if (fields.taRatingCount) {
      data.taRatingCount = mainContainer.querySelector('.ta-count')?.innerText?.replace(/[()]/g, '').trim() || null;
    }
    if (fields.googleRating) {
      data.googleRating = safeText(mainContainer.querySelector('.google-rating'));
    }
    if (fields.facebookRating) {
      data.facebookRating = safeText(mainContainer.querySelector('.facebook-rating'));
    }
    if (fields.yelpRating) {
      data.yelpRating = safeText(mainContainer.querySelector('.yelp-rating'));
    }
    if (fields.yearsInBusiness) {
      data.yearsInBusiness = mainContainer.querySelector('.years-in-business .count strong')?.innerText?.trim() || null;
    }
    if (fields.established) {
      data.established = safeText(mainContainer.querySelector('.established'));
    }
    if (fields.founded) {
      data.founded = safeText(mainContainer.querySelector('.founded'));
    }
    if (fields.inBusinessSince) {
      data.inBusinessSince = safeText(mainContainer.querySelector('.in-business-since'));
    }
    if (fields.priceRange) {
      data.priceRange = safeText(mainContainer.querySelector('.price-range'));
    }
    if (fields.hours) {
      const hoursElement = mainContainer.querySelector('.hours') || mainContainer.querySelector('.business-hours');
      data.hours = safeText(hoursElement);
    }
    if (fields.operatingHours) {
      data.operatingHours = safeText(mainContainer.querySelector('.operating-hours'));
    }
    if (fields.hoursOfOperation) {
      data.hoursOfOperation = safeText(mainContainer.querySelector('.hours-of-operation'));
    }
    if (fields.services) {
      const services = Array.from(mainContainer.querySelectorAll('.services li, .amenities li')).map(li => li.innerText.trim());
      data.services = services.join('; ');
    }
    if (fields.servicesOffered) {
      data.servicesOffered = safeText(mainContainer.querySelector('.services-offered'));
    }
    if (fields.amenities) {
      data.amenities = safeText(mainContainer.querySelector('.amenities'));
    }
    if (fields.facilities) {
      data.facilities = safeText(mainContainer.querySelector('.facilities'));
    }
    if (fields.paymentMethods) {
      const payments = Array.from(mainContainer.querySelectorAll('.payment-methods li, .payment li')).map(li => li.innerText.trim());
      data.paymentMethods = payments.join('; ');
    }
    if (fields.paymentOptions) {
      data.paymentOptions = safeText(mainContainer.querySelector('.payment-options'));
    }
    if (fields.creditCards) {
      data.creditCards = safeText(mainContainer.querySelector('.credit-cards'));
    }
    if (fields.cashOnly) {
      data.cashOnly = mainContainer.querySelector('.cash-only') !== null;
    }
    if (fields.features) {
      const features = Array.from(mainContainer.querySelectorAll('.features li, .highlights li')).map(li => li.innerText.trim());
      data.features = features.join('; ');
    }
    if (fields.description) {
      data.description = mainContainer.querySelector('.description')?.innerText?.trim() || 
                        mainContainer.querySelector('.about')?.innerText?.trim() || null;
    }
    if (fields.businessDescription) {
      data.businessDescription = safeText(mainContainer.querySelector('.business-description'));
    }
    if (fields.companyDescription) {
      data.companyDescription = safeText(mainContainer.querySelector('.company-description'));
    }
    if (fields.aboutUs) {
      data.aboutUs = safeText(mainContainer.querySelector('.about-us'));
    }
    if (fields.socialMedia) {
      const socialLinks = {};
      const socialElements = mainContainer.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]');
      socialElements.forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes('facebook')) socialLinks.facebook = href;
        if (href.includes('twitter')) socialLinks.twitter = href;
        if (href.includes('instagram')) socialLinks.instagram = href;
        if (href.includes('linkedin')) socialLinks.linkedin = href;
      });
      data.socialMedia = JSON.stringify(socialLinks);
    }
    if (fields.socialLinks) {
      data.socialLinks = safeText(mainContainer.querySelector('.social-links'));
    }
    if (fields.socialMediaLinks) {
      data.socialMediaLinks = safeText(mainContainer.querySelector('.social-media'));
    }
    if (fields.directionsLink) {
      data.directionsLink = safeAttr(mainContainer.querySelector('a[href*="directions"]'), 'href');
    }
    if (fields.reviewsLink) {
      data.reviewsLink = safeAttr(mainContainer.querySelector('a[href*="reviews"]'), 'href');
    }
    if (fields.websiteLink) {
      data.websiteLink = safeAttr(mainContainer.querySelector('a[href*="website"]'), 'href');
    }
    if (fields.menuLink) {
      data.menuLink = safeAttr(mainContainer.querySelector('a[href*="menu"]'), 'href');
    }
    if (fields.orderOnlineLink) {
      data.orderOnlineLink = safeAttr(mainContainer.querySelector('a[href*="order"]'), 'href');
    }
    if (fields.quoteLink) {
      data.quoteLink = safeAttr(mainContainer.querySelector('a[href*="quote"]'), 'href');
    }
    if (fields.contactLink) {
      data.contactLink = safeAttr(mainContainer.querySelector('a[href*="contact"]'), 'href');
    }
    if (fields.appointmentLink) {
      data.appointmentLink = safeAttr(mainContainer.querySelector('a[href*="appointment"]'), 'href');
    }
    if (fields.claimed) {
      data.claimed = safeText(mainContainer.querySelector('.claimed-status'));
    }
    if (fields.verified) {
      data.verified = mainContainer.querySelector('.verified-badge') !== null;
    }
    if (fields.businessStatus) {
      data.businessStatus = safeText(mainContainer.querySelector('.business-status'));
    }
    if (fields.listingStatus) {
      data.listingStatus = safeText(mainContainer.querySelector('.listing-status'));
    }
    if (fields.email) {
      data.email = mainContainer.querySelector('a[href^="mailto:"]')?.getAttribute('href')?.replace('mailto:', '') || null;
    }
    if (fields.emailAddress) {
      data.emailAddress = safeText(mainContainer.querySelector('.email'));
    }
    if (fields.contactEmail) {
      data.contactEmail = safeText(mainContainer.querySelector('.contact-email'));
    }
    if (fields.fax) {
      data.fax = safeText(mainContainer.querySelector('.fax'));
    }
    if (fields.cuisine) {
      data.cuisine = safeText(mainContainer.querySelector('.cuisine'));
    }
    if (fields.delivery) {
      data.delivery = mainContainer.querySelector('.delivery') !== null;
    }
    if (fields.takeout) {
      data.takeout = mainContainer.querySelector('.takeout') !== null;
    }
    if (fields.dineIn) {
      data.dineIn = mainContainer.querySelector('.dine-in') !== null;
    }
    if (fields.acceptsInsurance) {
      data.acceptsInsurance = mainContainer.querySelector('.insurance') !== null;
    }
    if (fields.specialties) {
      data.specialties = safeText(mainContainer.querySelector('.specialties'));
    }
    if (fields.certifications) {
      data.certifications = safeText(mainContainer.querySelector('.certifications'));
    }
    if (fields.certificationsList) {
      data.certificationsList = safeText(mainContainer.querySelector('.certifications-list'));
    }
    if (fields.accreditations) {
      data.accreditations = safeText(mainContainer.querySelector('.accreditations'));
    }
    if (fields.warranty) {
      data.warranty = safeText(mainContainer.querySelector('.warranty'));
    }
    if (fields.practiceAreas) {
      data.practiceAreas = safeText(mainContainer.querySelector('.practice-areas'));
    }
    if (fields.consultation) {
      data.consultation = safeText(mainContainer.querySelector('.consultation'));
    }
    if (fields.licensed) {
      data.licensed = mainContainer.querySelector('.licensed') !== null;
    }
    if (fields.bonded) {
      data.bonded = mainContainer.querySelector('.bonded') !== null;
    }
    if (fields.insured) {
      data.insured = mainContainer.querySelector('.insured') !== null;
    }
    if (fields.accredited) {
      data.accredited = mainContainer.querySelector('.accredited') !== null;
    }
    if (fields.memberships) {
      data.memberships = safeText(mainContainer.querySelector('.memberships'));
    }
    if (fields.associations) {
      data.associations = safeText(mainContainer.querySelector('.associations'));
    }
    if (fields.awards) {
      data.awards = safeText(mainContainer.querySelector('.awards'));
    }
    if (fields.recognitions) {
      data.recognitions = safeText(mainContainer.querySelector('.recognitions'));
    }
    if (fields.badges) {
      data.badges = safeText(mainContainer.querySelector('.badges'));
    }
    
    // Comprehensive review extraction
    if (fields.reviews) {
      const reviews = Array.from(mainContainer.querySelectorAll('.review, .testimonial, #reviews article, #ta-reviews-container article')).map(review => {
        const reviewData = {
          author: review.querySelector('.author, .review-author, .customer-name, .name')?.innerText?.trim() || null,
          rating: review.querySelector('.rating, .review-rating, .stars, .ta-rating')?.className?.match(/ta-(\d)/)?.[1] || 
                 review.querySelector('.rating, .review-rating, .stars')?.innerText?.trim() || null,
          date: review.querySelector('.date, .review-date, .post-date, .date-posted')?.innerText?.trim() || null,
          text: review.querySelector('.text, .content, .review-text, .review-content, .review-response p')?.innerText?.trim() || null,
          title: review.querySelector('.title, .review-title, .review-heading, .review-response header')?.innerText?.trim() || null,
          helpful: review.querySelector('.helpful, .review-helpful, .thumbs-up')?.innerText?.trim() || null,
          response: review.querySelector('.response, .review-response, .business-response')?.innerText?.trim() || null,
          verified: review.querySelector('.verified-badge, .verified-review') !== null,
          platform: review.querySelector('.platform, .source')?.innerText?.trim() || 
                   (review.closest('#ta-reviews-container') ? 'TripAdvisor' : null),
          location: review.querySelector('.location')?.innerText?.trim() || null,
          avatar: review.querySelector('img')?.getAttribute('src') || null
        };
        return reviewData;
      });
      
      // Create individual columns for each review (up to 10 reviews)
      reviews.forEach((review, index) => {
        if (index < 10) { // Limit to 10 reviews to avoid too many columns
          data[`review${index + 1}_author`] = review.author;
          data[`review${index + 1}_rating`] = review.rating;
          data[`review${index + 1}_date`] = review.date;
          data[`review${index + 1}_text`] = review.text;
          data[`review${index + 1}_title`] = review.title;
          data[`review${index + 1}_helpful`] = review.helpful;
          data[`review${index + 1}_response`] = review.response;
          data[`review${index + 1}_verified`] = review.verified;
          data[`review${index + 1}_platform`] = review.platform;
          data[`review${index + 1}_location`] = review.location;
          data[`review${index + 1}_avatar`] = review.avatar;
        }
      });
      
      // Also store the total count
      data.totalReviews = reviews.length;
    }
    
    if (fields.customerReviews) {
      data.customerReviews = safeText(mainContainer.querySelector('.customer-reviews'));
    }
    if (fields.reviewSection) {
      data.reviewSection = safeText(mainContainer.querySelector('.review-section'));
    }
    if (fields.reviewsContainer) {
      data.reviewsContainer = safeText(mainContainer.querySelector('.reviews-container'));
    }
    if (fields.reviewsSection) {
      data.reviewsSection = safeText(mainContainer.querySelector('#reviews'));
    }
    if (fields.tripAdvisorReviews) {
      data.tripAdvisorReviews = safeText(mainContainer.querySelector('#ta-reviews-container'));
    }
    if (fields.tripAdvisorTab) {
      data.tripAdvisorTab = safeText(mainContainer.querySelector('.ta-tab'));
    }
    
    if (fields.photos) {
      const photos = [];
      // Look for gallery images with data-media attributes
      const galleryItems = mainContainer.querySelectorAll('.media-thumbnail.collage-pic, .gallery img, .photos img, .business-photos img, .image-gallery img');
      
      galleryItems.forEach(item => {
        try {
          // Try to get full image URL from data-media attribute first
          const dataMedia = item.getAttribute('data-media');
          if (dataMedia) {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.fullImagePath) {
              photos.push(mediaData.fullImagePath);
              return;
            }
            if (mediaData.src) {
              photos.push(mediaData.src);
              return;
            }
          }
          
          // Fallback to data-url attribute
          const dataUrl = item.getAttribute('data-url');
          if (dataUrl) {
            photos.push(dataUrl);
            return;
          }
          
          // Fallback to img src attribute
          const imgSrc = item.getAttribute('src');
          if (imgSrc && !imgSrc.includes('_228x168_crop.jpg')) {
            // Remove thumbnail suffix to get full image
            const fullImageUrl = imgSrc.replace('_228x168_crop.jpg', '');
            photos.push(fullImageUrl);
          } else if (imgSrc) {
            photos.push(imgSrc);
          }
        } catch (error) {
          // Skip invalid JSON or other errors
          console.log(`  ⚠️  Error parsing photo data: ${error.message}`);
        }
      });
      
      // Create individual columns for each photo (up to 20 photos)
      photos.forEach((photo, index) => {
        if (index < 20) { // Limit to 20 photos to avoid too many columns
          data[`photo${index + 1}`] = photo;
        }
      });
      
      // Also store the total count
      data.totalPhotos = photos.length;
    }
    if (fields.businessPhotos) {
      // Extract photo URLs from business-photos section, not raw HTML
      const businessPhotos = [];
      const businessPhotoElements = mainContainer.querySelectorAll('.business-photos .media-thumbnail.collage-pic, .business-photos img');
      businessPhotoElements.forEach(item => {
        try {
          const dataMedia = item.getAttribute('data-media');
          if (dataMedia) {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.fullImagePath) {
              businessPhotos.push(mediaData.fullImagePath);
            } else if (mediaData.src) {
              businessPhotos.push(mediaData.src);
            }
          } else {
            const dataUrl = item.getAttribute('data-url');
            if (dataUrl) {
              businessPhotos.push(dataUrl);
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      });
      // Create individual columns for each business photo (up to 10 photos)
      businessPhotos.forEach((photo, index) => {
        if (index < 10) {
          data[`businessPhoto${index + 1}`] = photo;
        }
      });
      data.totalBusinessPhotos = businessPhotos.length;
    }
    if (fields.imageGallery) {
      // Extract photo URLs from image-gallery section, not raw HTML
      const imageGallery = [];
      const imageGalleryElements = mainContainer.querySelectorAll('.image-gallery .media-thumbnail.collage-pic, .image-gallery img');
      imageGalleryElements.forEach(item => {
        try {
          const dataMedia = item.getAttribute('data-media');
          if (dataMedia) {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.fullImagePath) {
              imageGallery.push(mediaData.fullImagePath);
            } else if (mediaData.src) {
              imageGallery.push(mediaData.src);
            }
          } else {
            const dataUrl = item.getAttribute('data-url');
            if (dataUrl) {
              imageGallery.push(dataUrl);
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      });
      // Create individual columns for each gallery image (up to 10 photos)
      imageGallery.forEach((photo, index) => {
        if (index < 10) {
          data[`galleryImage${index + 1}`] = photo;
        }
      });
      data.totalGalleryImages = imageGallery.length;
    }
    if (fields.photoGallery) {
      // Extract photo URLs from photo-gallery section, not raw HTML
      const photoGallery = [];
      const photoGalleryElements = mainContainer.querySelectorAll('.photo-gallery .media-thumbnail.collage-pic, .photo-gallery img');
      photoGalleryElements.forEach(item => {
        try {
          const dataMedia = item.getAttribute('data-media');
          if (dataMedia) {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.fullImagePath) {
              photoGallery.push(mediaData.fullImagePath);
            } else if (mediaData.src) {
              photoGallery.push(mediaData.src);
            }
          } else {
            const dataUrl = item.getAttribute('data-url');
            if (dataUrl) {
              photoGallery.push(dataUrl);
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      });
      // Create individual columns for each gallery photo (up to 10 photos)
      photoGallery.forEach((photo, index) => {
        if (index < 10) {
          data[`galleryPhoto${index + 1}`] = photo;
        }
      });
      data.totalGalleryPhotos = photoGallery.length;
    }
    if (fields.detailedHours) {
      const hoursData = {};
      const hoursElements = mainContainer.querySelectorAll('.hours .day, .business-hours .day, .operating-hours .day');
      hoursElements.forEach(day => {
        const dayName = day.querySelector('.day-name, .day')?.innerText?.trim() || null;
        const dayHours = day.querySelector('.day-hours, .hours')?.innerText?.trim() || null;
        if (dayName && dayHours) {
          hoursData[dayName] = dayHours;
        }
      });
      data.detailedHours = JSON.stringify(hoursData);
    }
    if (fields.latitude && fields.longitude) {
      const mapElement = mainContainer.querySelector('.map');
      if (mapElement) {
        data.latitude = mapElement.getAttribute('data-lat') || null;
        data.longitude = mapElement.getAttribute('data-lng') || null;
      }
    }
    if (fields.location) {
      data.location = safeText(mainContainer.querySelector('.location'));
    }
    if (fields.coordinates) {
      data.coordinates = safeText(mainContainer.querySelector('.coordinates'));
    }
    if (fields.neighborhood) {
      data.neighborhood = safeText(mainContainer.querySelector('.neighborhood'));
    }
    if (fields.areaServed) {
      data.areaServed = safeText(mainContainer.querySelector('.area-served'));
    }
    if (fields.serviceArea) {
      data.serviceArea = safeText(mainContainer.querySelector('.service-area'));
    }
    if (fields.businessId) {
      data.businessId = mainContainer.querySelector('[data-ypid]')?.getAttribute('data-ypid') || null;
    }
    if (fields.listingId) {
      data.listingId = mainContainer.querySelector('[data-listing-id]')?.getAttribute('data-listing-id') || null;
    }
    if (fields.dataBusinessId) {
      data.dataBusinessId = mainContainer.querySelector('[data-business-id]')?.getAttribute('data-business-id') || null;
    }
    if (fields.dataCompanyId) {
      data.dataCompanyId = mainContainer.querySelector('[data-company-id]')?.getAttribute('data-company-id') || null;
    }
    if (fields.employees) {
      data.employees = safeText(mainContainer.querySelector('.employees'));
    }
    if (fields.companySize) {
      data.companySize = safeText(mainContainer.querySelector('.company-size'));
    }
    if (fields.annualRevenue) {
      data.annualRevenue = safeText(mainContainer.querySelector('.annual-revenue'));
    }
    if (fields.languages) {
      data.languages = safeText(mainContainer.querySelector('.languages'));
    }
    if (fields.languagesSpoken) {
      data.languagesSpoken = safeText(mainContainer.querySelector('.languages-spoken'));
    }
    if (fields.accessibility) {
      data.accessibility = safeText(mainContainer.querySelector('.accessibility'));
    }
    if (fields.wheelchairAccessible) {
      data.wheelchairAccessible = mainContainer.querySelector('.wheelchair-accessible') !== null;
    }
    if (fields.parking) {
      data.parking = safeText(mainContainer.querySelector('.parking'));
    }
    if (fields.freeParking) {
      data.freeParking = mainContainer.querySelector('.free-parking') !== null;
    }
    if (fields.wifi) {
      data.wifi = mainContainer.querySelector('.wifi') !== null;
    }
    if (fields.freeWifi) {
      data.freeWifi = mainContainer.querySelector('.free-wifi') !== null;
    }
    if (fields.pricing) {
      data.pricing = safeText(mainContainer.querySelector('.pricing'));
    }
    if (fields.rates) {
      data.rates = safeText(mainContainer.querySelector('.rates'));
    }
    if (fields.priceList) {
      data.priceList = safeText(mainContainer.querySelector('.price-list'));
    }
    if (fields.servicePrices) {
      data.servicePrices = safeText(mainContainer.querySelector('.service-prices'));
    }
    if (fields.emergency) {
      data.emergency = mainContainer.querySelector('.emergency') !== null;
    }
    if (fields.twentyFourHour) {
      data.twentyFourHour = mainContainer.querySelector('[class*="24-hour"], [class*="24hr"], .twenty-four-hour') !== null;
    }
    if (fields.afterHours) {
      data.afterHours = mainContainer.querySelector('.after-hours') !== null;
    }
    if (fields.emergencyService) {
      data.emergencyService = mainContainer.querySelector('.emergency-service') !== null;
    }
    if (fields.callButton) {
      data.callButton = safeAttr(mainContainer.querySelector('.call-button'), 'href');
    }
    if (fields.textButton) {
      data.textButton = safeAttr(mainContainer.querySelector('.text-button'), 'href');
    }
    if (fields.emailButton) {
      data.emailButton = safeAttr(mainContainer.querySelector('.email-button'), 'href');
    }
    if (fields.chatButton) {
      data.chatButton = safeAttr(mainContainer.querySelector('.chat-button'), 'href');
    }
    if (fields.onlineBooking) {
      data.onlineBooking = safeAttr(mainContainer.querySelector('.online-booking'), 'href');
    }
    if (fields.appointmentScheduler) {
      data.appointmentScheduler = safeAttr(mainContainer.querySelector('.appointment-scheduler'), 'href');
    }
    
    // Handle photo-related fields that might contain HTML
    if (fields.photoCollage) {
      // Extract photo URLs from collage items, not raw HTML
      const photoCollage = [];
      const collageElements = mainContainer.querySelectorAll('.collage-item .media-thumbnail.collage-pic, .collage-item img');
      collageElements.forEach(item => {
        try {
          const dataMedia = item.getAttribute('data-media');
          if (dataMedia) {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.fullImagePath) {
              photoCollage.push(mediaData.fullImagePath);
            } else if (mediaData.src) {
              photoCollage.push(mediaData.src);
            }
          } else {
            const dataUrl = item.getAttribute('data-url');
            if (dataUrl) {
              photoCollage.push(dataUrl);
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      });
      // Create individual columns for each collage photo (up to 10 photos)
      photoCollage.forEach((photo, index) => {
        if (index < 10) {
          data[`collagePhoto${index + 1}`] = photo;
        }
      });
      data.totalCollagePhotos = photoCollage.length;
    }
    
    if (fields.photoCarousel) {
      // Extract photo URLs from carousel, not raw HTML
      const photoCarousel = [];
      const carouselElements = mainContainer.querySelectorAll('.carousel .media-thumbnail.collage-pic, .carousel img');
      carouselElements.forEach(item => {
        try {
          const dataMedia = item.getAttribute('data-media');
          if (dataMedia) {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.fullImagePath) {
              photoCarousel.push(mediaData.fullImagePath);
            } else if (mediaData.src) {
              photoCarousel.push(mediaData.src);
            }
          } else {
            const dataUrl = item.getAttribute('data-url');
            if (dataUrl) {
              photoCarousel.push(dataUrl);
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      });
      // Create individual columns for each carousel photo (up to 10 photos)
      photoCarousel.forEach((photo, index) => {
        if (index < 10) {
          data[`carouselPhoto${index + 1}`] = photo;
        }
      });
      data.totalCarouselPhotos = photoCarousel.length;
    }
    
    Object.keys(fields).forEach(field => {
      if (field.endsWith('Section')) {
        const selector = field.replace('Section', '');
        try {
          // Try ID selector first
          let node = mainContainer.querySelector('#' + selector);
          if (!node) {
            // Try class selector
            node = mainContainer.querySelector('.' + selector.replace(/_/g, ' '));
          }
          if (!node) {
            // Try attribute selector for complex IDs
            node = mainContainer.querySelector(`[id="${selector}"]`);
          }
          if (node) {
            data[field] = node.innerText || node.innerHTML;
          }
        } catch (error) {
          // Skip invalid selectors silently
          console.log(`  ⚠️  Skipping invalid selector: ${selector}`);
        }
      }
    });
    
    return data;
  }, availableFields);
}

/**
 * CSV CONVERSION FUNCTION
 * =======================
 * 
 * Converts the extracted business data array into a properly formatted CSV string
 * with dynamic headers based on all available fields across all businesses.
 * 
 * This function handles:
 * - Dynamic header generation from all unique field names
 * - Data normalization (filling missing values with empty strings)
 * - Proper CSV escaping (double quotes, commas, newlines)
 * - Consistent column ordering across all rows
 * 
 * The dynamic header approach ensures that if new fields are discovered
 * during scraping, they are automatically included in the CSV output
 * without requiring code changes.
 * 
 * @param {Array} data - Array of business data objects
 * @returns {string} - Properly formatted CSV string
 */
function convertToCSV(data) {
  logDebug('Starting CSV conversion', { dataLength: data.length });
  
  if (data.length === 0) {
    logWarn('No data to convert to CSV');
    return '';
  }
  
  // STEP 1: Collect All Unique Field Names
  // Create a Set to automatically handle duplicates
  const allKeys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  logInfo(`CSV headers generated: ${headers.length} unique fields`, { headers });
  
  // STEP 2: Normalize Data Structure
  // Ensure all rows have all columns by filling missing values
  const normalizedData = data.map((item, index) => {
    const normalizedItem = {};
    headers.forEach(header => {
      normalizedItem[header] = item[header] || ''; // Fill missing columns with empty string
    });
    return normalizedItem;
  });
  
  logDebug(`Data normalized: ${normalizedData.length} rows processed`);
  
  // STEP 3: Generate CSV Content
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows with proper escaping
  const dataRows = normalizedData.map(item => 
    headers.map(header => {
      const value = item[header] || '';
      // Escape double quotes by doubling them and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  logInfo('CSV conversion completed successfully', { 
    totalRows: dataRows.length + 1, 
    totalColumns: headers.length 
  });
  
  return csvContent;
}

/**
 * MAIN SCRAPING FUNCTION
 * ======================
 * 
 * Orchestrates the entire scraping process from start to finish. This function
 * coordinates all aspects of the scraping operation including:
 * 
 * - Browser initialization and configuration
 * - Page discovery and pagination analysis
 * - Parallel processing of search result pages
 * - Business link extraction and deduplication
 * - Individual business page scraping
 * - Data aggregation and CSV export
 * - Progress tracking and error handling
 * 
 * The function implements a two-phase approach:
 * 1. Extract business links from search result pages
 * 2. Visit each business page to extract detailed information
 * 
 * This approach maximizes efficiency while ensuring comprehensive data collection.
 * 
 * @returns {Promise<void>}
 */
async function scrapeYellowpages() {
  logInfo('Starting main scraping process');
  
  // Initialize tracking variables
  let allResults = [];
  let totalPages = null;
  let globalAvailableFields = {}; // Global field tracking across all pages
  
  // Update statistics
  scrapingStats.startTime = new Date();
  
  // STEP 1: Initialize Browser
  logInfo('Step 1: Initializing browser with stealth configuration');
  
  const browser = await puppeteer.launch({
    headless: true, // Headless for speed and resource efficiency
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--no-sandbox',                                    // Disable sandbox for stability
      '--disable-setuid-sandbox',                        // Disable setuid sandbox
      '--disable-blink-features=AutomationControlled',   // Hide automation indicators
      '--window-size=1280,800',                          // Set consistent window size
      '--disable-web-security',                          // Allow cross-origin requests
      '--disable-features=VizDisplayCompositor',         // Disable unnecessary features
      '--disable-dev-shm-usage',                         // Disable shared memory usage
      '--no-first-run',                                  // Skip first run setup
      '--no-default-browser-check',                      // Skip default browser check
      '--disable-default-apps',                          // Disable default apps
      '--disable-extensions',                            // Disable extensions for performance
      '--disable-plugins',                               // Disable plugins
      '--disable-images',                                // Disable images for speed
      '--disable-javascript',                            // Disable JavaScript (we'll enable selectively)
      '--disable-css',                                   // Disable CSS for speed
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
    },
  });
  
  logInfo('Browser initialized successfully');

  /**
   * RESOURCE BLOCKING FUNCTION
   * ==========================
   * 
   * Configures request interception to block unnecessary resources that
   * slow down page loading without contributing to data extraction.
   * 
   * Blocked resources include:
   * - Images: Not needed for text extraction
   * - Stylesheets: Not needed for data extraction
   * - Fonts: Not needed for text processing
   * 
   * This significantly improves scraping speed while maintaining
   * all necessary functionality for data extraction.
   * 
   * @param {Page} page - Puppeteer page object to configure
   */
  async function blockResources(page) {
    logDebug('Configuring resource blocking for page');
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // Block unnecessary resources for performance
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        logDebug(`Blocking resource: ${resourceType} - ${url.substring(0, 100)}...`);
        req.abort();
      } else {
        // Allow essential resources (HTML, JavaScript, XHR, etc.)
        req.continue();
      }
    });
    
    logDebug('Resource blocking configured successfully');
  }

  // STEP 2: Page Discovery and Pagination Analysis
  logInfo('Step 2: Analyzing pagination and total pages');
  
  // Create a temporary page for pagination analysis
  const page = await browser.newPage();
  await blockResources(page);
  
  // Configure page for stealth operation
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
  });

  // Construct search URL
  const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=1`;
  logInfo('Navigating to search results page', { url });
  
  console.log(`\n🔍 Starting scrape for: ${config.businessCategory} in ${config.zipCode}`);
  console.log(`URL: ${url}`);
  
  // Navigate to the search results page
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.search-results', { timeout: 10000 });

  // STEP 3: Analyze Pagination Structure
  logInfo('Step 3: Analyzing pagination structure to determine total pages');
  
  totalPages = await page.evaluate(() => {
    // Method 1: Parse "showing X-Y of Z" text
    const showingCount = document.querySelector('.showing-count');
    const showingMatch = showingCount ? showingCount.innerText.match(/(\d+)-(\d+) of (\d+)/) : null;
    
    if (showingMatch) {
      const totalResults = parseInt(showingMatch[3]);
      const perPage = parseInt(showingMatch[2]) - parseInt(showingMatch[1]) + 1;
      const calculatedPages = Math.ceil(totalResults / perPage);
      console.log(`  📊 Found pagination info: ${totalResults} total results, ${perPage} per page = ${calculatedPages} pages`);
      return calculatedPages;
    }
    
    // Method 2: Extract from pagination links (fallback)
    const pageLinks = Array.from(document.querySelectorAll('.pagination ul li a[data-page]'));
    const pageNumbers = pageLinks.map(a => parseInt(a.getAttribute('data-page'))).filter(Boolean);
    
    if (pageNumbers.length > 0) {
      const maxPage = Math.max(...pageNumbers);
      console.log(`  📊 Found ${pageNumbers.length} pagination links, max page: ${maxPage}`);
      return maxPage;
    }
    
    // Method 3: Default to single page if no pagination found
    console.log('  📊 No pagination found, defaulting to 1 page');
    return 1;
  });
  
  logInfo(`Pagination analysis complete: ${totalPages} total pages detected`);
  console.log(`📄 Detected total pages: ${totalPages}`);
  
  // Update statistics
  scrapingStats.totalPages = totalPages;
  
  await page.close();

  // STEP 4: Parallel Page Processing
  logInfo('Step 4: Beginning parallel page processing', { 
    totalPages, 
    parallelPages: config.parallelPages,
    batchSize: Math.min(config.parallelPages, totalPages)
  });
  
  // Process pages in parallel batches for optimal performance
  for (let batchStart = 1; batchStart <= totalPages; batchStart += config.parallelPages) {
    const batchEnd = Math.min(batchStart + config.parallelPages - 1, totalPages);
    const batchPages = [];
    
    // Create batch of page numbers to process
    for (let i = batchStart; i <= batchEnd; i++) {
      batchPages.push(i);
    }
    
    logInfo(`Processing batch: pages ${batchStart}-${batchEnd}`, { 
      batchPages, 
      batchSize: batchPages.length,
      progress: `${batchStart}-${batchEnd} of ${totalPages}`
    });
    
    console.log(`\n📊 Scraping pages: ${batchPages.join(', ')}`);
    
    // Process all pages in the current batch concurrently
    const results = await Promise.allSettled(batchPages.map(async (pageNum) => {
      const page = await browser.newPage();
      await blockResources(page);
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      );
      await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9',
      });
      const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=${pageNum}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.search-results', { timeout: 15000 });
        
        // STEP 5: Extract Business Links from Search Results
        logDebug(`Page ${pageNum}: Extracting business links from search results`);
        
        const ypLinks = await page.evaluate(() => {
          // Phase 1: Target Organic Results Only
          // Use specific selectors to target only organic (non-ad) business listings
          const listings = Array.from(document.querySelectorAll('.search-results.organic .result, .search-results.organic .srp-listing'));
          
          console.log(`    📋 Found ${listings.length} total listings on page`);
          
          // Phase 2: Filter Out Advertisements and Duplicates
          // Apply multiple filters to ensure we only get legitimate business listings
          const validListings = listings.filter(listing => {
            // Filter 1: Check for ad-related CSS classes
            const hasAdClass = listing.classList.contains('paid-listing') || 
                              listing.classList.contains('astro-tmc') ||
                              listing.querySelector('.ad-pill') !== null;
            
            // Filter 2: Check if listing is within ad containers
            const isInAdContainer = listing.closest('.center-ads') !== null ||
                                   listing.closest('.side-ads') !== null;
            
            // Filter 3: Check for sponsored content indicators
            const isSponsored = listing.querySelector('[class*="sponsored"], [class*="ad-"]') !== null;
            
            // Filter 4: Check for promotional content
            const isPromotional = listing.querySelector('[class*="promo"], [class*="featured"]') !== null;
            
            const isValid = !hasAdClass && !isInAdContainer && !isSponsored && !isPromotional;
            
            if (!isValid) {
              console.log(`      🚫 Filtered out ad/duplicate listing`);
            }
            
            return isValid;
          });
          
          console.log(`    ✅ ${validListings.length} valid listings after filtering`);
          
          // Phase 3: Extract and Deduplicate Business Links
          // Use Set for automatic deduplication and maintain order with array
          const ypLinks = new Set();
          const uniqueLinks = [];
          
          validListings.forEach((listing, index) => {
            // Extract the relative URL from the business name link
            const ypLinkRaw = listing.querySelector('.business-name')?.getAttribute('href') || null;
            
            if (ypLinkRaw) {
              // Convert relative URL to absolute URL
              const ypLink = `https://www.yellowpages.com${ypLinkRaw}`;
              
              // Check for duplicates using Set
              if (!ypLinks.has(ypLink)) {
                ypLinks.add(ypLink);
                uniqueLinks.push(ypLink);
                console.log(`      ✅ Added business link ${index + 1}: ${ypLinkRaw}`);
              } else {
                console.log(`      🔄 Skipped duplicate link: ${ypLinkRaw}`);
              }
            } else {
              console.log(`      ⚠️  No link found for listing ${index + 1}`);
            }
          });
          
          console.log(`    📊 Final result: ${uniqueLinks.length} unique business links extracted`);
          return uniqueLinks;
        });
        
        logInfo(`Page ${pageNum}: Business link extraction complete`, { 
          linksFound: ypLinks.length,
          pageUrl: url 
        });
        console.log(`Page ${pageNum}: Found ${ypLinks.length} YP links`);
        
        // STEP 6: Individual Business Page Scraping
        logInfo(`Page ${pageNum}: Beginning individual business page scraping`, { 
          businessCount: ypLinks.length 
        });
        
        const pageResults = [];
        let successfulExtractions = 0;
        let failedExtractions = 0;
        
        // Process each business link sequentially to avoid overwhelming the server
        for (let i = 0; i < ypLinks.length; i++) {
          const ypLink = ypLinks[i];
          const businessNumber = i + 1;
          
          logDebug(`Page ${pageNum}, Business ${businessNumber}/${ypLinks.length}: Processing ${ypLink}`);
          
          try {
            // STEP 6A: Create Dedicated Page for Business
            logDebug(`Creating dedicated page for business ${businessNumber}`);
            const businessPage = await browser.newPage();
            await blockResources(businessPage);
            
            // Configure page for stealth operation
            await businessPage.setUserAgent(
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            );
            await businessPage.setExtraHTTPHeaders({
              'accept-language': 'en-US,en;q=0.9',
              'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'cache-control': 'no-cache',
            });
            
            // STEP 6B: Navigate to Business Page
            logDebug(`Navigating to business page: ${ypLink}`);
            await businessPage.goto(ypLink, { 
              waitUntil: 'domcontentloaded', 
              timeout: 45000 
            });
            
            // STEP 6C: Wait for Page Content to Load
            logDebug('Waiting for main container to load');
            await businessPage.waitForSelector('main.container.search-monitor, main, .business-info, .listing-details', { 
              timeout: 15000 
            }).catch((error) => {
              logWarn(`Main container not found for: ${ypLink}`, { error: error.message });
              console.log(`  ⚠️  Main container not found for: ${ypLink}`);
            });
            
            // STEP 6D: Analyze Available Fields
            logDebug('Analyzing available fields on business page');
            const pageFields = await analyzeAvailableFields(businessPage);
            
            if (pageFields) {
              // Merge new fields with global available fields for consistency
              const newFields = Object.keys(pageFields).filter(field => !globalAvailableFields[field]);
              if (newFields.length > 0) {
                logInfo(`Found new fields on business page`, { newFields });
                console.log(`  🔍 Found new fields: ${newFields.join(', ')}`);
                globalAvailableFields = { ...globalAvailableFields, ...pageFields };
              }
            }
            
            // STEP 6E: Extract Business Data
            logDebug('Extracting business data using available fields');
            const businessData = globalAvailableFields && Object.keys(globalAvailableFields).length > 0 ? 
              await extractBusinessData(businessPage, globalAvailableFields) : null;
            
            if (businessData) {
              // Add metadata to business data
              businessData.ypLink = ypLink; // Original source link
              businessData.extractionTimestamp = new Date().toISOString();
              businessData.sourcePage = pageNum;
              businessData.businessIndex = businessNumber;
              
              pageResults.push(businessData);
              successfulExtractions++;
              
              logInfo(`Successfully extracted business data`, {
                businessName: businessData.businessName || 'Unknown',
                fieldCount: Object.keys(businessData).length,
                businessNumber,
                totalBusinesses: ypLinks.length
              });
              
              console.log(`  ✅ Extracted: ${businessData.businessName || 'Unknown'} (${Object.keys(businessData).length} fields)`);
            } else {
              failedExtractions++;
              logWarn(`No data extracted from business page`, { ypLink, businessNumber });
              console.log(`  ❌ No data extracted from: ${ypLink}`);
            }
            
            // STEP 6F: Cleanup and Rate Limiting
            await businessPage.close();
            
            // Add delay to avoid rate limiting and be respectful to the server
            const delay = 2000; // 2 seconds between requests
            logDebug(`Waiting ${delay}ms before next business page`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
          } catch (error) {
            failedExtractions++;
            logError(`Error processing business page`, { 
              ypLink, 
              businessNumber, 
              error: error.message,
              stack: error.stack 
            });
            console.log(`  ❌ Error processing ${ypLink}: ${error.message}`);
          }
        }
        
        // Log page completion statistics
        logInfo(`Page ${pageNum} processing complete`, {
          totalBusinesses: ypLinks.length,
          successfulExtractions,
          failedExtractions,
          successRate: `${((successfulExtractions / ypLinks.length) * 100).toFixed(1)}%`
        });
        
        return pageResults;
        
      } catch (err) {
        console.warn(`Page ${pageNum}: Failed to scrape:`, err.message);
        return [];
      } finally {
        await page.close();
      }
    }));
    
    // STEP 7: Results Aggregation and Progress Saving
    logInfo('Step 7: Aggregating batch results and saving progress');
    
    // Process batch results and handle any failures gracefully
    const flattenedResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
    
    // Count failed pages for statistics
    const failedPages = results.filter(result => result.status === 'rejected').length;
    if (failedPages > 0) {
      logWarn(`Batch had ${failedPages} failed pages`, { 
        batchPages, 
        failedPages,
        successfulPages: results.length - failedPages 
      });
    }
    
    // Add batch results to global results
    allResults = allResults.concat(flattenedResults);
    
    // Update global statistics
    scrapingStats.totalBusinesses = allResults.length;
    scrapingStats.successfulExtractions += flattenedResults.length;
    
    // STEP 8: Progress Saving and Checkpoint
    logInfo('Step 8: Saving progress checkpoint');
    
    // Generate CSV content for current progress
    const csvContent = convertToCSV(allResults);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${config.searchTerm}_${config.zipCode}_${timestamp}.csv`;
    
    // Save progress to file
    fs.writeFileSync(filename, csvContent, 'utf8');
    
    logInfo(`Progress checkpoint saved`, {
      filename,
      totalBusinesses: allResults.length,
      batchProgress: `${batchStart}-${batchEnd} of ${totalPages}`,
      overallProgress: `${Math.round((batchEnd / totalPages) * 100)}%`
    });
    
    console.log(`💾 Progress saved: ${allResults.length} businesses processed`);
  }

  // STEP 9: Final Processing and Cleanup
  logInfo('Step 9: Final processing and cleanup');
  
  console.log(`\n✅ Total scraped results: ${allResults.length}`);
  
  // Update final statistics
  scrapingStats.endTime = new Date();
  scrapingStats.totalBusinesses = allResults.length;
  scrapingStats.csvFile = `${config.searchTerm}_${config.zipCode}_${new Date().toISOString().split('T')[0]}.csv`;
  
  // STEP 10: Final CSV Export
  logInfo('Step 10: Generating final CSV export');
  
  const csvContent = convertToCSV(allResults);
  const filename = `${config.searchTerm}_${config.zipCode}_${new Date().toISOString().split('T')[0]}.csv`;
  fs.writeFileSync(filename, csvContent, 'utf8');
  
  logInfo(`Final CSV export completed`, {
    filename,
    totalRows: allResults.length + 1, // +1 for header row
    fileSize: `${(csvContent.length / 1024).toFixed(2)} KB`
  });
  
  console.log(`📁 Final data saved to: ${filename}`);

  // STEP 11: Browser Cleanup
  logInfo('Step 11: Closing browser and cleanup');
  await browser.close();
  
  // STEP 12: Session Completion Logging
  logInfo('Step 12: Logging session completion');
  logSessionCompletion(scrapingStats);
  
  console.log('\n🎉 Scraping completed successfully!');
}

/**
 * MAIN EXECUTION ENTRY POINT
 * ==========================
 * 
 * Self-executing async function that orchestrates the entire scraping process.
 * This is the main entry point that coordinates all phases of the application:
 * 
 * 1. User Configuration: Interactive setup of scraping parameters
 * 2. Scraping Execution: Main data extraction process
 * 3. Error Handling: Comprehensive error management and logging
 * 4. Process Termination: Clean exit with appropriate status codes
 * 
 * The function implements proper error handling to ensure that any issues
 * are logged and the process terminates gracefully with meaningful error messages.
 */
(async () => {
  try {
    logInfo('Yellowpages Scraper starting up');
    
    // Phase 1: User Configuration
    logInfo('Phase 1: Starting user configuration');
    await getUserConfiguration();
    
    // Phase 2: Main Scraping Process
    logInfo('Phase 2: Beginning main scraping process');
    await scrapeYellowpages();
    
    // Phase 3: Successful Completion
    logInfo('Yellowpages Scraper completed successfully');
    
  } catch (error) {
    // Comprehensive Error Handling
    logError('Fatal error occurred during scraping process', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    console.error('❌ Error:', error.message);
    
    // Log session completion with error status
    if (scrapingStats.startTime) {
      scrapingStats.endTime = new Date();
      scrapingStats.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      logSessionCompletion(scrapingStats);
    }
    
    // Exit with error code
    process.exit(1);
  }
})();
