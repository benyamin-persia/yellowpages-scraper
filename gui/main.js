const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Import the scraper modules
const { getUserConfiguration, config, BUSINESS_CATEGORIES } = require('../config');
const { analyzeAvailableFields, extractBusinessData } = require('../dataExtractor');
const { convertToCSV, saveToCSV } = require('../csvUtils');
const { launchBrowser, setupPage } = require('../browserManager');
const { extractYPLinks, getTotalPages } = require('../linkExtractor');

let mainWindow;
let scrapingProcess = null;
let currentScrapingProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    title: 'Yellowpages.com Scraper',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for GUI communication

// Get business categories for the dropdown
ipcMain.handle('get-categories', async () => {
  return BUSINESS_CATEGORIES;
});

// Start scraping process
ipcMain.handle('start-scraping', async (event, scrapingConfig) => {
  try {
    // Update config with GUI values
    config.businessCategory = scrapingConfig.category;
    config.searchTerm = scrapingConfig.searchTerm;
    config.zipCode = scrapingConfig.zipCode;
    config.parallelPages = parseInt(scrapingConfig.parallelPages) || 3;

    // Start scraping in background
    currentScrapingProcess = scrapeYellowpagesWithGUI();
    
    return { success: true, message: 'Scraping started successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Stop scraping process
ipcMain.handle('stop-scraping', async () => {
  try {
    if (currentScrapingProcess) {
      currentScrapingProcess.stop = true;
      currentScrapingProcess = null;
    }
    return { success: true, message: 'Scraping stopped' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Open project folder
ipcMain.handle('open-project-folder', async (event, folderPath) => {
  try {
    const { shell } = require('electron');
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Select output directory
ipcMain.handle('select-output-directory', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Output Directory'
    });
    
    if (!result.canceled) {
      return { success: true, path: result.filePaths[0] };
    } else {
      return { success: false, message: 'No directory selected' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Modified scraping function for GUI
async function scrapeYellowpagesWithGUI() {
  const scrapingProcess = { stop: false };
  let allResults = [];
  let totalPages = null;
  let globalAvailableFields = {};
  const logEntries = [];

  try {
    // Create project-specific folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const projectFolderName = `${config.searchTerm}_${config.zipCode}_${timestamp}`;
    const projectFolderPath = path.join(require('process').cwd(), projectFolderName);
    
    if (!fs.existsSync(projectFolderPath)) {
      fs.mkdirSync(projectFolderPath, { recursive: true });
      logMessage(`📁 Created project folder: ${projectFolderName}`);
    }

    // Launch browser
    const browser = await launchBrowser();
    logMessage(`[INFO] Browser launched at ${new Date().toISOString()}`);

    // Get total pages
    const page = await browser.newPage();
    await setupPage(page);

    const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=1`;
    logMessage(`🔍 Starting scrape for: ${config.businessCategory} in ${config.zipCode}`);
    logMessage(`📁 Project folder: ${projectFolderName}`);
    logMessage(`URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.search-results', { timeout: 10000 });

    totalPages = await getTotalPages(page);
    logMessage(`📄 Detected total pages: ${totalPages}`);
    updateProgress(0, totalPages);
    await page.close();

    // Scrape in batches
    for (let batchStart = 1; batchStart <= totalPages && !scrapingProcess.stop; batchStart += config.parallelPages) {
      const batchEnd = Math.min(batchStart + config.parallelPages - 1, totalPages);
      const batchPages = [];
      for (let i = batchStart; i <= batchEnd; i++) {
        batchPages.push(i);
      }
      
      logMessage(`📊 Scraping pages: ${batchPages.join(', ')}`);
      
      const results = await Promise.allSettled(batchPages.map(async (pageNum) => {
        if (scrapingProcess.stop) return [];
        
        const page = await browser.newPage();
        await setupPage(page);
        const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(config.searchTerm)}&geo_location_terms=${config.zipCode}&page=${pageNum}`;
        
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForSelector('.search-results', { timeout: 15000 });
          
          const ypLinks = await extractYPLinks(page);
          logMessage(`Page ${pageNum}: Found ${ypLinks.length} YP links`);
          
          const pageResults = [];
          
          for (const ypLink of ypLinks) {
            if (scrapingProcess.stop) break;
            
            try {
              const businessPage = await browser.newPage();
              await setupPage(businessPage);
              
              await businessPage.goto(ypLink, { 
                waitUntil: 'domcontentloaded', 
                timeout: 45000 
              });
              
              await businessPage.waitForSelector('main.container.search-monitor, main, .business-info, .listing-details', { 
                timeout: 15000 
              }).catch(() => {
                logMessage(`⚠️ Main container not found for: ${ypLink}`);
              });
              
              const pageFields = await analyzeAvailableFields(businessPage);
              
              if (pageFields) {
                const newFields = Object.keys(pageFields).filter(field => !globalAvailableFields[field]);
                if (newFields.length > 0) {
                  logMessage(`🔍 Found new fields: ${newFields.join(', ')}`);
                  globalAvailableFields = { ...globalAvailableFields, ...pageFields };
                }
              }
              
              const businessData = globalAvailableFields && Object.keys(globalAvailableFields).length > 0 ? 
                await extractBusinessData(businessPage, globalAvailableFields) : null;
              
              if (businessData) {
                businessData.ypLink = ypLink;
                pageResults.push(businessData);
                logMessage(`✅ Extracted: ${businessData.businessName || 'Unknown'} (${Object.keys(businessData).length} fields)`);
              } else {
                logMessage(`❌ No data extracted from: ${ypLink}`);
              }
              
              await businessPage.close();
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } catch (error) {
              logMessage(`❌ Error processing ${ypLink}: ${error.message}`);
            }
          }
          
          return pageResults;
          
        } catch (err) {
          logMessage(`❌ Page ${pageNum}: Failed to scrape: ${err.message}`);
          return [];
        } finally {
          await page.close();
        }
      }));
      
      if (scrapingProcess.stop) break;
      
      const flattenedResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        .flat();
      allResults = allResults.concat(flattenedResults);
      
      // Save progress
      const csvContent = convertToCSV(allResults);
      const progressFilename = `progress_batch_${batchStart}-${batchEnd}_${allResults.length}_businesses.csv`;
      const progressFilePath = path.join(projectFolderPath, progressFilename);
      fs.writeFileSync(progressFilePath, csvContent, 'utf8');
      logMessage(`💾 Progress saved: ${allResults.length} businesses processed`);
      
      updateProgress(batchStart + config.parallelPages - 1, totalPages);
    }

    if (!scrapingProcess.stop) {
      logMessage(`✅ Total scraped results: ${allResults.length}`);
      
      // Final save
      const finalFilename = `final_results_${allResults.length}_businesses.csv`;
      const finalFilePath = path.join(projectFolderPath, finalFilename);
      const csvContent = convertToCSV(allResults);
      fs.writeFileSync(finalFilePath, csvContent, 'utf8');
      logMessage(`📁 Final data saved to: ${finalFilename}`);
      
      // Create summary
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
- This Summary: project_summary.txt

Data Fields Extracted: ${Object.keys(globalAvailableFields).length} unique fields
Global Available Fields: ${Object.keys(globalAvailableFields).join(', ')}

Project completed successfully!
`;
      
      const summaryFilePath = path.join(projectFolderPath, 'project_summary.txt');
      fs.writeFileSync(summaryFilePath, summaryContent, 'utf8');
      
      logMessage(`📋 Project Summary:`);
      logMessage(`📁 Project Folder: ${projectFolderName}`);
      logMessage(`📊 Total Businesses: ${allResults.length}`);
      logMessage(`📄 Total Pages: ${totalPages}`);
      logMessage(`🔍 Data Fields: ${Object.keys(globalAvailableFields).length}`);
      logMessage(`📝 Files Created: Final CSV, Progress CSVs, Summary`);
      
      updateProgress(totalPages, totalPages);
      scrapingComplete(projectFolderPath);
    }

    await browser.close();
    
  } catch (error) {
    logMessage(`❌ Scraping error: ${error.message}`);
    scrapingError(error.message);
  }
  
  return scrapingProcess;
}

// Helper functions to communicate with GUI
function logMessage(message) {
  if (mainWindow) {
    mainWindow.webContents.send('log-message', {
      timestamp: new Date().toISOString(),
      message: message
    });
  }
}

function updateProgress(current, total) {
  if (mainWindow) {
    mainWindow.webContents.send('update-progress', {
      current: current,
      total: total,
      percentage: Math.round((current / total) * 100)
    });
  }
}

function scrapingComplete(projectFolder) {
  if (mainWindow) {
    mainWindow.webContents.send('scraping-complete', {
      projectFolder: projectFolder
    });
  }
}

function scrapingError(error) {
  if (mainWindow) {
    mainWindow.webContents.send('scraping-error', {
      error: error
    });
  }
} 