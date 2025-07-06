# Yellowpages.com Business Scraper & Data Mining Platform

A comprehensive, modular web scraping and data mining platform designed to extract, analyze, and visualize business information from Yellowpages.com. This tool combines advanced web scraping with powerful data mining and visualization capabilities.

## 🚀 Features

### Core Scraping Functionality
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

### Advanced Data Mining & Analytics
- **Statistical Analysis**: Comprehensive business statistics and metrics
- **Competitive Analysis**: Market share, pricing, and service comparison
- **Trend Analysis**: Business age distribution and digital adoption patterns
- **Geographic Analysis**: Regional business concentration and distribution
- **Insight Generation**: AI-powered actionable business insights
- **Pattern Recognition**: Automatic detection of market trends and opportunities

### Interactive Visualizations
- **Interactive Dashboard**: Real-time charts with Chart.js integration
- **Geographic Maps**: Business distribution visualization with Google Maps
- **Detailed Reports**: Comprehensive HTML reports with data tables
- **Trend Charts**: Time-based and categorical analysis visualizations
- **Export Capabilities**: Multiple formats (HTML, JSON, CSV)

### Technical Features
- **Modular Architecture**: Clean separation of concerns across multiple modules
- **Stealth Mode**: Uses puppeteer-extra with stealth plugin to avoid detection
- **Resource Optimization**: Blocks unnecessary resources for faster processing
- **Error Handling**: Comprehensive error handling with detailed logging
- **Progress Tracking**: Real-time progress updates and batch processing
- **CSV Export**: Automatic CSV generation with dynamic column headers
- **Detailed Logging**: Complete audit trail with timestamped log files

### User Interface
- **Interactive CLI**: Menu-driven configuration with business categories and subcategories
- **Custom Search Support**: Option to enter custom search terms
- **Configuration Validation**: Confirms settings before starting scrape
- **Progress Monitoring**: Real-time console output with emoji indicators

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Google Chrome** browser installed
- **Git** for cloning the repository

## 🛠️ Installation

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

### Basic Scraping

1. **Start the scraper**
   ```bash
   npm start
   # or
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

### Data Mining & Analysis

#### Quick Analysis
For immediate insights from scraped data:
```bash
npm run quick-analysis
```

#### Full Data Mining Pipeline
For comprehensive analysis and visualizations:
```bash
npm run full-pipeline
```

#### Manual Analysis
```bash
# Analyze specific CSV file
node -e "const { runDataMiningPipeline } = require('./dataMiningRunner'); runDataMiningPipeline('your_file.csv');"
```

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
├── main.js                 # Main orchestration script
├── config.js               # Configuration and user interface
├── browserManager.js       # Browser setup and management
├── linkExtractor.js        # Extract business links from search pages
├── dataExtractor.js        # Extract detailed business data
├── csvUtils.js             # CSV generation and file operations
├── dataAnalyzer.js         # Data mining and analysis engine
├── dataVisualizer.js       # Visualization and reporting engine
├── dataMiningRunner.js     # Complete data mining pipeline
├── package.json            # Dependencies and project metadata
└── README.md              # This file
```

### Module Descriptions

#### Core Scraping Modules
- **`main.js`** - Main orchestration script with comprehensive logging
- **`config.js`** - Configuration management with business categories
- **`browserManager.js`** - Browser setup and stealth configuration
- **`linkExtractor.js`** - Business link extraction from search pages
- **`dataExtractor.js`** - Dynamic field discovery and data extraction
- **`csvUtils.js`** - CSV generation and file operations

#### Data Mining & Visualization Modules
- **`dataAnalyzer.js`** - Comprehensive data analysis engine
  - Business statistics generation
  - Competitive analysis
  - Trend analysis
  - Geographic analysis
  - Insight generation

- **`dataVisualizer.js`** - Interactive visualization engine
  - Interactive dashboard generation
  - Detailed HTML reports
  - Geographic map visualizations
  - Chart.js integration

- **`dataMiningRunner.js`** - Complete pipeline orchestration
  - Automated analysis workflow
  - Structured output organization
  - Report generation
  - Quick analysis capabilities

## 📊 Output Files

### Scraping Output
- **CSV File**: `{searchTerm}_{zipCode}_{date}.csv`
- **Log File**: `{searchTerm}_{zipCode}_{timestamp}_scrape.log`

### Data Mining Output
```
data_mining_results/
├── analysis_YYYY-MM-DDTHH-MM-SS/
│   ├── index.html                    # Main navigation page
│   ├── analysis/
│   │   └── analysis_results_*.json   # Complete analysis data
│   ├── visualizations/
│   │   ├── dashboard_*.html          # Interactive dashboard
│   │   ├── detailed_report_*.html    # Detailed analysis report
│   │   └── map_visualization_*.html  # Geographic map
│   ├── reports/
│   │   └── mining_report.md          # Comprehensive report
│   └── insights/
│       └── key_insights.json         # Structured insights
```

## 🔧 Technical Details

### Data Mining Capabilities

#### Statistical Analysis
- **Business Demographics**: Age distribution, size analysis
- **Geographic Distribution**: City, state, zip code analysis
- **Digital Presence**: Website, social media, online booking adoption
- **Customer Satisfaction**: Rating distribution and review analysis
- **Service Analysis**: Service offerings and payment methods

#### Competitive Intelligence
- **Market Share Analysis**: Category distribution and concentration
- **Geographic Competition**: Regional business density
- **Service Comparison**: Common services and unique offerings
- **Online Presence**: Digital adoption rates and gaps
- **Customer Engagement**: Review patterns and satisfaction levels

#### Trend Analysis
- **Business Age Patterns**: New vs. established business distribution
- **Digital Adoption Trends**: Website and social media usage
- **Customer Satisfaction Trends**: Rating patterns over time
- **Geographic Trends**: Business concentration patterns

#### Insight Generation
- **Market Opportunities**: Underserved categories and regions
- **Competitive Gaps**: Areas with low digital adoption
- **Customer Insights**: Satisfaction patterns and preferences
- **Business Recommendations**: Actionable improvement suggestions

### Visualization Features

#### Interactive Dashboard
- **Real-time Charts**: Dynamic Chart.js visualizations
- **Key Metrics**: Business statistics and performance indicators
- **Insight Cards**: Actionable recommendations and findings
- **Responsive Design**: Works on desktop and mobile devices

#### Geographic Visualization
- **Interactive Maps**: Google Maps integration
- **Business Clustering**: Geographic concentration analysis
- **Filtering Capabilities**: Category and rating filters
- **Location Analytics**: Regional business patterns

#### Detailed Reports
- **Comprehensive Tables**: Complete data analysis
- **Statistical Summaries**: Key metrics and findings
- **Trend Analysis**: Time-based and categorical patterns
- **Export Capabilities**: Multiple format support

## 🚀 Advanced Usage

### Custom Analysis Scripts
```javascript
const { performCompleteAnalysis } = require('./dataAnalyzer');
const { generateVisualizations } = require('./dataVisualizer');

// Custom analysis workflow
const results = performCompleteAnalysis('your_data.csv');
const visualizations = generateVisualizations('analysis_results.json');
```

### Batch Processing
```bash
# Process multiple CSV files
for file in *.csv; do
    node -e "const { runDataMiningPipeline } = require('./dataMiningRunner'); runDataMiningPipeline('$file');"
done
```

### API Integration
```javascript
// Integrate with external APIs for enhanced analysis
const analysisResults = await performCompleteAnalysis(csvFile);
// Send to external analytics platform
await sendToAnalyticsPlatform(analysisResults);
```

## 📈 Business Intelligence Applications

### For Business Owners
- **Market Research**: Understand competitive landscape and opportunities
- **Geographic Expansion**: Identify underserved markets and regions
- **Digital Strategy**: Assess online presence opportunities and gaps
- **Customer Insights**: Analyze satisfaction patterns and preferences

### For Marketers
- **Target Audience**: Identify high-concentration areas and demographics
- **Campaign Planning**: Focus on categories with high demand
- **Digital Marketing**: Target businesses lacking online presence
- **Competitive Analysis**: Understand market positioning and gaps

### For Analysts
- **Market Trends**: Track business growth and decline patterns
- **Geographic Analysis**: Study regional business distribution
- **Industry Insights**: Analyze category performance and trends
- **Data Quality**: Assess data completeness and accuracy

### For Consultants
- **Client Recommendations**: Data-driven business advice
- **Market Reports**: Comprehensive industry analysis
- **Competitive Intelligence**: Detailed market positioning
- **Growth Opportunities**: Identify expansion possibilities

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

#### Analysis Errors
```
Error: No data found for analysis
```
**Solution**: Ensure CSV file exists and contains valid data

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
- Powered by [Chart.js](https://www.chartjs.org/) for visualizations
- Inspired by the need for comprehensive business data collection and analysis

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the log files for detailed error information

---

**Disclaimer**: This tool is for educational purposes. Please respect website terms of service and use responsibly. 