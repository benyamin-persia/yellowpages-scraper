const { getUserConfiguration, config } = require('./config');
const { analyzeAvailableFields, extractBusinessData } = require('./dataExtractor');
const { convertToCSV, saveToCSV } = require('./csvUtils');
const { launchBrowser, setupPage } = require('./browserManager');
const { extractYPLinks, getTotalPages } = require('./linkExtractor');
const fs = require('fs');
const path = require('path');

// ==========================
// Yellowpages.com Scraper - Main Orchestration Module
// ==========================
// This script coordinates the entire scraping process, including configuration, browser management, link extraction, data extraction, CSV export, and logging.
// It is designed to be modular, maintainable, and easy to debug or extend.
//
// Key Steps:
// 1. Load user configuration (category, search term, zip code, parallelism)
// 2. Create project-specific folder for all outputs
// 3. Launch browser and determine total number of result pages
// 4. For each batch of pages, extract business links in parallel
// 5. For each business link, extract all available data fields sequentially (to allow dynamic field discovery)
// 6. Normalize and save results to CSV after each batch within the project folder
// 7. At the end, save a log file summarizing the run within the project folder
//
// All major actions and errors are logged to the console and to a log file for debugging and auditing.

// Main scraping function
async function scrapeYellowpages() {
  let allResults = [];
  let totalPages = null;
  let globalAvailableFields = {}; // Global field tracking across all pages
  const logEntries = []; // Array to collect log entries for the log file

  // Create project-specific folder for this scraping session
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const projectFolderName = `${config.searchTerm}_${config.zipCode}_${timestamp}`;
  const projectFolderPath = path.join(process.cwd(), projectFolderName);
  
  // Create the project folder if it doesn't exist
  if (!fs.existsSync(projectFolderPath)) {
    fs.mkdirSync(projectFolderPath, { recursive: true });
    console.log(`📁 Created project folder: ${projectFolderName}`);
    logEntries.push(`[INFO] Created project folder: ${projectFolderName}`);
  }

  // Launch a new browser instance using Puppeteer with stealth plugin
  const browser = await launchBrowser();
  logEntries.push(`[INFO] Browser launched at ${new Date().toISOString()}`);

  // Set up a single page to get total number of pages
  const page = await browser.newPage();
  await setupPage(page);

  // Construct the initial search URL based on user config
  const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=1`;
  console.log(`\n🔍 Starting scrape for: ${config.businessCategory} in ${config.zipCode}`);
  console.log(`📁 Project folder: ${projectFolderName}`);
  console.log(`URL: ${url}`);
  logEntries.push(`[INFO] Scraping started for: ${config.businessCategory} in ${config.zipCode} | Project folder: ${projectFolderName} | URL: ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.search-results', { timeout: 10000 });

  // Get total pages from pagination
  totalPages = await getTotalPages(page);
  console.log(`📄 Detected total pages: ${totalPages}`);
  logEntries.push(`[INFO] Detected total pages: ${totalPages}`);
  await page.close();

  // Scrape in parallel batches
  for (let batchStart = 1; batchStart <= totalPages; batchStart += config.parallelPages) {
    const batchEnd = Math.min(batchStart + config.parallelPages - 1, totalPages);
    const batchPages = [];
    for (let i = batchStart; i <= batchEnd; i++) {
      batchPages.push(i);
    }
    console.log(`\n📊 Scraping pages: ${batchPages.join(', ')}`);
    logEntries.push(`[INFO] Scraping pages: ${batchPages.join(', ')}`);
    const results = await Promise.allSettled(batchPages.map(async (pageNum) => {
      const page = await browser.newPage();
      await setupPage(page);
      const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=${pageNum}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.search-results', { timeout: 15000 });
        
        // Extract YP links from search results
        const ypLinks = await extractYPLinks(page);
        console.log(`Page ${pageNum}: Found ${ypLinks.length} YP links`);
        logEntries.push(`[INFO] Page ${pageNum}: Found ${ypLinks.length} YP links`);
        
        // Now visit each YP link and extract detailed data
        const pageResults = [];
        // Use global available fields to maintain consistency across all pages
        
        for (const ypLink of ypLinks) {
          try {
            // Create new page for each business
            const businessPage = await browser.newPage();
            await setupPage(businessPage);
            
            await businessPage.goto(ypLink, { 
              waitUntil: 'domcontentloaded', 
              timeout: 45000 
            });
            
            // Wait for main container to load with more flexible selector
            await businessPage.waitForSelector('main.container.search-monitor, main, .business-info, .listing-details', { 
              timeout: 15000 
            }).catch(() => {
              console.log(`  ⚠️  Main container not found for: ${ypLink}`);
              logEntries.push(`[WARN] Main container not found for: ${ypLink}`);
            });
            
            // Analyze available fields on THIS page
            const pageFields = await analyzeAvailableFields(businessPage);
            
            if (pageFields) {
              // Merge new fields with global available fields
              const newFields = Object.keys(pageFields).filter(field => !globalAvailableFields[field]);
              if (newFields.length > 0) {
                console.log(`  🔍 Found new fields: ${newFields.join(', ')}`);
                logEntries.push(`[INFO] Found new fields: ${newFields.join(', ')}`);
                globalAvailableFields = { ...globalAvailableFields, ...pageFields };
              }
            }
            
            // Extract business data based on ALL available fields found so far
            const businessData = globalAvailableFields && Object.keys(globalAvailableFields).length > 0 ? 
              await extractBusinessData(businessPage, globalAvailableFields) : null;
            
            if (businessData) {
              businessData.ypLink = ypLink; // Add the original link
              pageResults.push(businessData);
              console.log(`  ✅ Extracted: ${businessData.businessName || 'Unknown'} (${Object.keys(businessData).length} fields)`);
              logEntries.push(`[INFO] Extracted: ${businessData.businessName || 'Unknown'} (${Object.keys(businessData).length} fields) from ${ypLink}`);
            } else {
              console.log(`  ❌ No data extracted from: ${ypLink}`);
              logEntries.push(`[WARN] No data extracted from: ${ypLink}`);
            }
            
            await businessPage.close();
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.log(`  ❌ Error processing ${ypLink}: ${error.message}`);
            logEntries.push(`[ERROR] Error processing ${ypLink}: ${error.message}`);
          }
        }
        
        return pageResults;
        
      } catch (err) {
        console.warn(`Page ${pageNum}: Failed to scrape:`, err.message);
        logEntries.push(`[ERROR] Page ${pageNum}: Failed to scrape: ${err.message}`);
        return [];
      } finally {
        await page.close();
      }
    }));
    
    // Flatten results and add to allResults
    const flattenedResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
    allResults = allResults.concat(flattenedResults);
    
    // Save progress to CSV after each batch within the project folder
    const csvContent = convertToCSV(allResults);
    const progressFilename = `progress_batch_${batchStart}-${batchEnd}_${allResults.length}_businesses.csv`;
    const progressFilePath = path.join(projectFolderPath, progressFilename);
    fs.writeFileSync(progressFilePath, csvContent, 'utf8');
    console.log(`💾 Progress saved: ${allResults.length} businesses processed`);
    console.log(`📁 Progress file: ${progressFilename}`);
    logEntries.push(`[INFO] Progress saved: ${allResults.length} businesses processed | File: ${progressFilename}`);
  }

  console.log(`\n✅ Total scraped results: ${allResults.length}`);
  logEntries.push(`[INFO] Total scraped results: ${allResults.length}`);

  // Final save to CSV file within the project folder
  const finalFilename = `final_results_${allResults.length}_businesses.csv`;
  const finalFilePath = path.join(projectFolderPath, finalFilename);
  const csvContent = convertToCSV(allResults);
  fs.writeFileSync(finalFilePath, csvContent, 'utf8');
  console.log(`📁 Final data saved to: ${finalFilename}`);
  logEntries.push(`[INFO] Final data saved to: ${finalFilename}`);

  await browser.close();
  logEntries.push(`[INFO] Browser closed at ${new Date().toISOString()}`);
  console.log('\n🎉 Scraping completed successfully!');

  // Write log file within the project folder
  const logFileName = `scrape_log_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
  const logFilePath = path.join(projectFolderPath, logFileName);
  fs.writeFileSync(logFilePath, logEntries.join('\n'), 'utf8');
  console.log(`📝 Log file written: ${logFileName}`);
  
  // Create a summary file with project information
  const summaryContent = `Yellowpages.com Scraper - Project Summary
==================================================

Project Details:
- Search Term: ${config.searchTerm}
- Business Category: ${config.businessCategory}
- Zip Code: ${config.zipCode}
- Parallel Pages: ${config.parallelPages}
- Total Pages Scraped: ${totalPages}
- Total Businesses Extracted: ${allResults.length}
- Project Start Time: ${new Date().toISOString()}

Files Generated:
- Final Results: ${finalFilename}
- Progress Files: Multiple batch files
- Log File: ${logFileName}
- This Summary: project_summary.txt

Data Fields Extracted: ${Object.keys(globalAvailableFields).length} unique fields
Global Available Fields: ${Object.keys(globalAvailableFields).join(', ')}

Project completed successfully!
`;
  
  const summaryFilePath = path.join(projectFolderPath, 'project_summary.txt');
  fs.writeFileSync(summaryFilePath, summaryContent, 'utf8');
  
  console.log(`\n📋 Project Summary:`);
  console.log(`📁 Project Folder: ${projectFolderName}`);
  console.log(`📊 Total Businesses: ${allResults.length}`);
  console.log(`📄 Total Pages: ${totalPages}`);
  console.log(`🔍 Data Fields: ${Object.keys(globalAvailableFields).length}`);
  console.log(`📝 Files Created: Final CSV, Progress CSVs, Log, Summary`);
}

// Main execution
(async () => {
  try {
    await getUserConfiguration();
    await scrapeYellowpages();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})(); 