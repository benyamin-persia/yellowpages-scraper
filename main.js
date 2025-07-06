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
// 2. Launch browser and determine total number of result pages
// 3. For each batch of pages, extract business links in parallel
// 4. For each business link, extract all available data fields sequentially (to allow dynamic field discovery)
// 5. Normalize and save results to CSV after each batch
// 6. At the end, save a log file summarizing the run
//
// All major actions and errors are logged to the console and to a log file for debugging and auditing.

// Main scraping function
async function scrapeYellowpages() {
  let allResults = [];
  let totalPages = null;
  let globalAvailableFields = {}; // Global field tracking across all pages
  const logEntries = []; // Array to collect log entries for the log file

  // Launch a new browser instance using Puppeteer with stealth plugin
  const browser = await launchBrowser();
  logEntries.push(`[INFO] Browser launched at ${new Date().toISOString()}`);

  // Set up a single page to get total number of pages
  const page = await browser.newPage();
  await setupPage(page);

  // Construct the initial search URL based on user config
  const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=1`;
  console.log(`\n🔍 Starting scrape for: ${config.businessCategory} in ${config.zipCode}`);
  console.log(`URL: ${url}`);
  logEntries.push(`[INFO] Scraping started for: ${config.businessCategory} in ${config.zipCode} | URL: ${url}`);
  
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
    
    // Save progress to CSV after each batch
    const csvContent = convertToCSV(allResults);
    const filename = `${config.searchTerm}_${config.zipCode}_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csvContent, 'utf8');
    console.log(`💾 Progress saved: ${allResults.length} businesses processed`);
    logEntries.push(`[INFO] Progress saved: ${allResults.length} businesses processed`);
  }

  console.log(`\n✅ Total scraped results: ${allResults.length}`);
  logEntries.push(`[INFO] Total scraped results: ${allResults.length}`);

  // Final save to CSV file
  const filename = saveToCSV(allResults, config.searchTerm, config.zipCode);
  console.log(`📁 Final data saved to: ${filename}`);
  logEntries.push(`[INFO] Final data saved to: ${filename}`);

  await browser.close();
  logEntries.push(`[INFO] Browser closed at ${new Date().toISOString()}`);
  console.log('\n🎉 Scraping completed successfully!');

  // Write log file at the end of the run
  const logFileName = `${config.searchTerm}_${config.zipCode}_${new Date().toISOString().replace(/[:.]/g, '-')}_scrape.log`;
  fs.writeFileSync(logFileName, logEntries.join('\n'), 'utf8');
  console.log(`📝 Log file written: ${logFileName}`);
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