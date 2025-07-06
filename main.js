const { getUserConfiguration, config } = require('./config');
const { analyzeAvailableFields, extractBusinessData } = require('./dataExtractor');
const { convertToCSV, saveToCSV } = require('./csvUtils');
const { launchBrowser, setupPage } = require('./browserManager');
const { extractYPLinks, getTotalPages } = require('./linkExtractor');
const fs = require('fs');

// Main scraping function
async function scrapeYellowpages() {
  let allResults = [];
  let totalPages = null;
  let globalAvailableFields = {}; // Global field tracking across all pages

  const browser = await launchBrowser();

  // Set up a single page to get total number of pages
  const page = await browser.newPage();
  await setupPage(page);

  const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=1`;
  console.log(`\n🔍 Starting scrape for: ${config.businessCategory} in ${config.zipCode}`);
  console.log(`URL: ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.search-results', { timeout: 10000 });

  // Get total pages from pagination
  totalPages = await getTotalPages(page);
  console.log(`📄 Detected total pages: ${totalPages}`);
  await page.close();

  // Scrape in parallel batches
  for (let batchStart = 1; batchStart <= totalPages; batchStart += config.parallelPages) {
    const batchEnd = Math.min(batchStart + config.parallelPages - 1, totalPages);
    const batchPages = [];
    for (let i = batchStart; i <= batchEnd; i++) {
      batchPages.push(i);
    }
    console.log(`\n📊 Scraping pages: ${batchPages.join(', ')}`);
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
            }).catch(() => console.log(`  ⚠️  Main container not found for: ${ypLink}`));
            
            // Analyze available fields on THIS page
            const pageFields = await analyzeAvailableFields(businessPage);
            
            if (pageFields) {
              // Merge new fields with global available fields
              const newFields = Object.keys(pageFields).filter(field => !globalAvailableFields[field]);
              if (newFields.length > 0) {
                console.log(`  🔍 Found new fields: ${newFields.join(', ')}`);
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
            } else {
              console.log(`  ❌ No data extracted from: ${ypLink}`);
            }
            
            await businessPage.close();
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.log(`  ❌ Error processing ${ypLink}: ${error.message}`);
          }
        }
        
        return pageResults;
        
      } catch (err) {
        console.warn(`Page ${pageNum}: Failed to scrape:`, err.message);
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
  }

  console.log(`\n✅ Total scraped results: ${allResults.length}`);

  // Final save to CSV file
  const filename = saveToCSV(allResults, config.searchTerm, config.zipCode);
  console.log(`📁 Final data saved to: ${filename}`);

  await browser.close();
  console.log('\n🎉 Scraping completed successfully!');
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