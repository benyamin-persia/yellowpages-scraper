# Yellowpages.com Business Scraper

A comprehensive, modular web scraping tool designed to extract business information from Yellowpages.com. This tool is built with Node.js and Puppeteer, featuring dynamic field discovery, parallel processing, and robust error handling.

## 🚀 Features

### Core Functionality
- **Dynamic Field Discovery**: Automatically detects and extracts all available data fields on business detail pages
- **Parallel Processing**: Scrapes multiple search result pages simultaneously for improved performance
- **Comprehensive Data Extraction**: Captures 100+ different data fields including:
  - Business information (name, address, phone, website)
  - Contact details and social media links
  - Ratings and reviews (Yellowpages, TripAdvisor, Google, etc.)
  - Business hours and operating information
  - Services, amenities, and payment methods
  - Photos and media galleries
  - Certifications, awards, and business status
  - Geographic data and service areas

### Technical Features
- **Modular Architecture**: Clean separation of concerns across multiple modules
- **Stealth Mode**: Uses puppeteer-extra with stealth plugin to avoid detection
- **Resource Optimization**: Blocks unnecessary resources (images, stylesheets, fonts) for faster scraping
- **Error Handling**: Comprehensive error handling with detailed logging
- **Progress Tracking**: Real-time progress updates and batch processing
- **CSV Export**: Automatic CSV generation with dynamic column headers
- **Detailed Logging**: Complete audit trail with timestamped log files

### User Interface
- **Modern GUI**: Electron-based desktop application with intuitive interface
- **Interactive CLI**: Menu-driven configuration with business categories and subcategories
- **Custom Search Support**: Option to enter custom search terms
- **Configuration Validation**: Confirms settings before starting scrape
- **Progress Monitoring**: Real-time progress bar and detailed logging
- **Visual Controls**: Checkboxes for data extraction options, buttons for actions
- **Live Statistics**: Real-time display of pages processed, businesses found, and success rates

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Google Chrome** browser installed
- **Git** for cloning the repository

## 🛠️ Installation

### Option 1: GUI Application (Recommended for All Users)

1. **Launch the GUI**
   - **Windows**: Double-click `run-gui.bat` or `run-gui.ps1`
   - **Development**: `npm run gui` or `npm run gui-dev`

2. **Build GUI executable**
   ```bash
   # Run the build script
   build-gui-executable.bat
   
   # Or manually
   npm run build-gui
   ```

3. **Install GUI application**
   - Run the generated installer: `dist\Yellowpages Scraper Setup.exe`
   - Follow the installation wizard
   - Launch from Start Menu or desktop shortcut

### Option 2: Windows CLI Executable

1. **Download the executable**
   - Download `yellowpages-scraper.exe` from the releases
   - Or build your own using the build script

2. **Build your own executable**
   ```bash
   # Run the build script
   build-executable.bat
   
   # Or manually
   npm install
   npm run build
   ```

3. **Run the executable**
   - Double-click `yellowpages-scraper.exe`
   - Or use the batch file: `run-scraper.bat`
   - Or use PowerShell: `.\run-scraper.ps1`

### Option 2: Source Code Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yellowpages-scraper.git
   cd yellowpages-scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify Chrome installation**
   - Ensure Google Chrome is installed at the default location
   - The scraper is configured to use: `C:\Program Files\Google\Chrome\Application\chrome.exe`
   - For different Chrome locations, update the path in `browserManager.js`

## 🎯 Usage

### GUI Application (Recommended)

#### Launch Options
- **Windows Batch**: Double-click `run-gui.bat`
- **Windows PowerShell**: Right-click `run-gui.ps1` → "Run with PowerShell"
- **Development**: `npm run gui` or `npm run gui-dev`

#### GUI Features
- **Visual Configuration**: Dropdown menus for categories and subcategories
- **Custom Search**: Text input for custom search terms
- **Data Options**: Checkboxes to select which data to extract
- **Progress Tracking**: Real-time progress bar and statistics
- **Live Logging**: Scrollable log area with auto-scroll option
- **Project Management**: Automatic project folder creation and organization

### Command Line Interface

#### Windows Users

##### Option 1: Executable
- **Double-click** `yellowpages-scraper.exe`
- No command line required
- Automatic dependency checking

##### Option 2: Batch File
- **Double-click** `run-scraper.bat`
- Automatic dependency installation
- User-friendly error messages

##### Option 3: PowerShell
- **Right-click** `run-scraper.ps1` → "Run with PowerShell"
- Modern interface with colors
- Advanced error handling

### Command Line Usage

1. **Start the scraper**
   ```bash
   node main.js
   ```

2. **Follow the interactive prompts**
   - Select a business category (Auto Services, Beauty, Home Services, etc.)
   - Choose a subcategory (optional)
   - Enter your zip code
   - Set the number of pages to scrape in parallel (default: 3)
   - Confirm your configuration

3. **Monitor progress**
   - The scraper will display real-time progress with emoji indicators
   - Progress is saved to CSV after each batch
   - A detailed log file is created at the end

### Configuration Options

#### Business Categories Available
- **Auto Services**: Auto repair, detailing, towing, etc.
- **Beauty**: Salons, spas, barber shops, etc.
- **Home Services**: HVAC, plumbing, electrical, etc.
- **Insurance**: Various insurance types
- **Legal Services**: Attorneys, legal assistance
- **Medical Services**: Doctors, dentists, hospitals
- **Pet Services**: Veterinary clinics, grooming, etc.
- **Restaurants**: Various cuisine types
- **Custom Search**: Enter any custom search term

#### Parallel Processing
- Control how many pages are scraped simultaneously
- Higher values = faster scraping but more resource usage
- Recommended: 3-5 for stable performance

## 📁 Project Structure

```
yellowpages-scraper/
├── main.js                    # Main orchestration script (CLI)
├── config.js                  # Configuration and user interface
├── browserManager.js          # Browser setup and management
├── linkExtractor.js           # Extract business links from search pages
├── dataExtractor.js           # Extract detailed business data
├── csvUtils.js                # CSV generation and file operations
├── package.json               # Dependencies and project metadata
├── README.md                  # This file
├── gui/                       # GUI application files
│   ├── main.js                # Electron main process
│   ├── index.html             # GUI HTML interface
│   ├── styles.css             # GUI styling
│   ├── renderer.js            # GUI renderer process
│   └── assets/                # GUI assets (icons, etc.)
├── run-scraper.bat            # Windows CLI batch file launcher
├── run-scraper.ps1            # Windows CLI PowerShell launcher
├── run-gui.bat                # Windows GUI batch file launcher
├── run-gui.ps1                # Windows GUI PowerShell launcher
├── build-executable.bat       # Build CLI executable script
├── build-gui-executable.bat   # Build GUI executable script
├── yellowpages-scraper.exe    # Standalone CLI executable (after build)
└── {searchTerm}_{zipCode}_{date}/  # Project-specific output folders
    ├── final_results_{count}_businesses.csv
    ├── progress_batch_{range}_{count}_businesses.csv
    ├── scrape_log_{timestamp}.log
    └── project_summary.txt
```

### Module Descriptions

#### `main.js` - Main Orchestration
- Coordinates the entire scraping process
- Manages browser lifecycle and page creation
- Handles parallel processing and batch operations
- Generates comprehensive log files
- Saves progress to CSV after each batch

#### `config.js` - Configuration Management
- Defines business categories and subcategories
- Provides interactive CLI for user input
- Validates and confirms configuration settings
- Exports configuration object for use by other modules

#### `browserManager.js` - Browser Management
- Launches Puppeteer browser with stealth configuration
- Sets up page headers and user agents
- Blocks unnecessary resources for performance
- Configures viewport and browser arguments

#### `linkExtractor.js` - Link Extraction
- Extracts business detail links from search result pages
- Filters out advertisements and duplicate listings
- Determines total number of result pages
- Ensures only organic business listings are processed

#### `dataExtractor.js` - Data Extraction
- Analyzes available fields on business detail pages
- Dynamically discovers new data fields during scraping
- Extracts comprehensive business information
- Handles various data formats (text, links, images, reviews)
- Creates individual columns for photos and reviews

#### `csvUtils.js` - CSV Operations
- Converts extracted data to CSV format
- Ensures all rows have all columns (backfilling missing values)
- Handles CSV escaping and special characters
- Generates timestamped filenames

## 📊 Output Files

### Project Folder Structure
Each scraping session creates a dedicated project folder with the following structure:
```
{searchTerm}_{zipCode}_{date}/
├── final_results_{count}_businesses.csv    # Final complete dataset
├── progress_batch_{range}_{count}_businesses.csv  # Progress files (multiple)
├── scrape_log_{timestamp}.log              # Detailed execution log
└── project_summary.txt                     # Project overview and statistics
```

### File Descriptions

#### Final Results CSV
- **Filename**: `final_results_{count}_businesses.csv`
- **Format**: UTF-8 encoded CSV with dynamic headers
- **Content**: Complete dataset with all extracted business data

#### Progress Files
- **Filename**: `progress_batch_{start}-{end}_{count}_businesses.csv`
- **Purpose**: Intermediate saves after each batch for data safety
- **Content**: Cumulative data up to that batch

#### Log File
- **Filename**: `scrape_log_{timestamp}.log`
- **Format**: Plain text with timestamped entries
- **Content**: Complete audit trail including:
  - Configuration details
  - Page processing status
  - Field discovery events
  - Error messages and warnings
  - Performance metrics

#### Project Summary
- **Filename**: `project_summary.txt`
- **Content**: Overview of the scraping session including:
  - Search parameters and configuration
  - Total pages and businesses processed
  - Data fields discovered
  - File inventory

## 🔧 Technical Details

### Data Fields Extracted

#### Basic Information
- Business name, title, company name
- Phone numbers (cleaned of "Call" text)
- Address and location data
- Website URLs
- Email addresses

#### Ratings and Reviews
- Yellowpages ratings and review counts
- TripAdvisor ratings and reviews
- Google, Facebook, Yelp ratings
- Individual review data (up to 10 reviews per business)
- Review authors, dates, ratings, and text

#### Business Details
- Years in business
- Price ranges and payment methods
- Operating hours and business status
- Services offered and specialties
- Certifications and awards

#### Media and Photos
- Photo gallery URLs (up to 20 photos per business)
- Business photos, gallery images, carousel photos
- Photo metadata and full-size image URLs

#### Additional Information
- Social media links
- Action links (directions, reviews, website, etc.)
- Business status (claimed, verified)
- Geographic coordinates
- Service areas and neighborhoods

### Performance Optimizations

#### Resource Blocking
- Blocks images, stylesheets, and fonts
- Reduces bandwidth usage and improves speed
- Maintains functionality while optimizing performance

#### Parallel Processing
- Configurable parallelism for search page scraping
- Sequential processing for business detail pages (to allow dynamic field discovery)
- Batch-based progress saving

#### Error Handling
- Graceful handling of network timeouts
- Retry logic for failed page loads
- Comprehensive error logging
- Continues processing even if individual pages fail

## ⚠️ Important Notes

### Rate Limiting
- Built-in delays between requests to avoid overwhelming the server
- Respectful scraping practices to maintain site accessibility
- Configurable delays for different use cases

### Legal and Ethical Considerations
- This tool is for educational and research purposes
- Respect Yellowpages.com's terms of service
- Use responsibly and avoid excessive requests
- Consider the impact on the target website

### Browser Requirements
- Requires Google Chrome to be installed
- Uses Chrome's executable path for Puppeteer
- Stealth mode helps avoid detection

## 🐛 Troubleshooting

### Common Issues

#### Chrome Not Found
```
Error: Failed to launch browser
```
**Solution**: Verify Chrome is installed and update the path in `browserManager.js`

#### Network Timeouts
```
Error: Navigation timeout
```
**Solution**: Check internet connection and try reducing parallel page count

#### No Data Extracted
```
Warning: No data extracted from URL
```
**Solution**: The page structure may have changed. Check the log file for details.

#### Memory Issues
```
Error: JavaScript heap out of memory
```
**Solution**: Reduce parallel page count or increase Node.js memory limit:
```bash
node --max-old-space-size=4096 main.js
```

### Debug Mode
- Check the generated log file for detailed error information
- Log files contain timestamps and specific error messages
- Use log entries to identify problematic URLs or pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code structure and commenting style
- Add comprehensive comments for new functionality
- Test changes with different business categories
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Puppeteer](https://pptr.dev/) for web automation
- Uses [puppeteer-extra](https://github.com/berstend/puppeteer-extra) for stealth capabilities
- Inspired by the need for comprehensive business data collection

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the log files for detailed error information

---

**Disclaimer**: This tool is for educational purposes. Please respect website terms of service and use responsibly. 