// ==========================
// Yellowpages.com Scraper - Data Mining Pipeline Runner
// ==========================
// This module provides a complete data mining and visualization pipeline that:
// 1. Analyzes scraped Yellowpages data
// 2. Generates comprehensive visualizations
// 3. Creates interactive dashboards
// 4. Exports insights and reports
// All results are organized in a structured output directory for easy access.

const { performCompleteAnalysis } = require('./dataAnalyzer');
const { generateVisualizations } = require('./dataVisualizer');
const fs = require('fs');
const path = require('path');

// ==========================
// Pipeline Configuration
// ==========================

const PIPELINE_CONFIG = {
  outputDirectory: './data_mining_results',
  analysisTypes: [
    'business_statistics',
    'competitive_analysis', 
    'trend_analysis',
    'geographic_analysis',
    'insights_generation'
  ],
  visualizationTypes: [
    'dashboard',
    'detailed_report',
    'map_visualization',
    'charts'
  ],
  exportFormats: ['json', 'html', 'csv']
};

// ==========================
// Pipeline Functions
// ==========================

/**
 * Create organized output directory structure
 * @param {string} basePath - Base output directory
 * @param {string} timestamp - Timestamp for this run
 * @returns {Object} Directory paths object
 */
function createOutputStructure(basePath, timestamp) {
  const directories = {
    root: path.join(basePath, `analysis_${timestamp}`),
    analysis: path.join(basePath, `analysis_${timestamp}`, 'analysis'),
    visualizations: path.join(basePath, `analysis_${timestamp}`, 'visualizations'),
    reports: path.join(basePath, `analysis_${timestamp}`, 'reports'),
    data: path.join(basePath, `analysis_${timestamp}`, 'data'),
    insights: path.join(basePath, `analysis_${timestamp}`, 'insights')
  };

  // Create directories
  Object.values(directories).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return directories;
}

/**
 * Find CSV files in the current directory
 * @returns {Array} Array of CSV file paths
 */
function findCSVFiles() {
  try {
    const files = fs.readdirSync('.');
    return files.filter(file => file.endsWith('.csv') && !file.includes('_scrape.log'));
  } catch (error) {
    console.error('Error finding CSV files:', error.message);
    return [];
  }
}

/**
 * Generate comprehensive data mining report
 * @param {Object} analysisResults - Analysis results
 * @param {Object} visualizationPaths - Visualization file paths
 * @param {Object} directories - Output directories
 * @returns {string} Report content
 */
function generateMiningReport(analysisResults, visualizationPaths, directories) {
  const { metadata, insights, summary } = analysisResults;
  
  const report = `
# Yellowpages.com Data Mining Report

## 📊 Executive Summary

**Analysis Date:** ${new Date(metadata.analysisDate).toLocaleDateString()}
**Total Businesses Analyzed:** ${metadata.totalBusinesses}
**Data Source:** ${metadata.dataSource}
**Key Insights Generated:** ${insights.length}

## 🎯 Key Findings

### Market Overview
- **Top Categories:** ${summary.topCategories.map(([cat, count]) => `${cat} (${count})`).join(', ')}
- **Geographic Concentration:** ${summary.topCities.map(([city, count]) => `${city} (${count})`).join(', ')}
- **Average Rating:** ${summary.averageRating.toFixed(2)} stars
- **Website Adoption:** ${summary.websiteAdoption}

### Business Insights
${insights.map((insight, index) => `
#### ${index + 1}. ${insight.title}
- **Type:** ${insight.type}
- **Description:** ${insight.description}
- **Action:** ${insight.action}
`).join('')}

## 📁 Generated Files

### Analysis Results
- **Complete Analysis:** \`${directories.analysis}/analysis_results_*.json\`
- **Business Statistics:** Available in analysis results
- **Competitive Analysis:** Available in analysis results
- **Trend Analysis:** Available in analysis results

### Visualizations
- **Interactive Dashboard:** \`${visualizationPaths.dashboard}\`
- **Detailed Report:** \`${visualizationPaths.detailedReport}\`
- **Map Visualization:** \`${visualizationPaths.mapVisualization}\`

### Reports
- **This Report:** \`${directories.reports}/mining_report.md\`
- **Insights Summary:** \`${directories.insights}/key_insights.json\`

## 🔍 Analysis Methodology

### Data Processing
1. **Data Loading:** CSV files parsed and validated
2. **Data Cleaning:** Missing values handled, data normalized
3. **Statistical Analysis:** Comprehensive business statistics generated
4. **Competitive Analysis:** Market share and positioning analysis
5. **Trend Analysis:** Business age and digital adoption patterns
6. **Insight Generation:** Actionable business insights derived

### Visualization Types
1. **Interactive Dashboard:** Real-time charts and metrics
2. **Detailed Reports:** Comprehensive data tables and analysis
3. **Geographic Maps:** Business distribution visualization
4. **Trend Charts:** Time-based and categorical analysis

## 📈 Business Intelligence Applications

### For Business Owners
- **Market Research:** Understand competitive landscape
- **Geographic Expansion:** Identify underserved markets
- **Digital Strategy:** Assess online presence opportunities
- **Customer Insights:** Analyze satisfaction patterns

### For Marketers
- **Target Audience:** Identify high-concentration areas
- **Campaign Planning:** Focus on categories with high demand
- **Digital Marketing:** Target businesses lacking online presence
- **Competitive Analysis:** Understand market positioning

### For Analysts
- **Market Trends:** Track business growth patterns
- **Geographic Analysis:** Study regional business distribution
- **Industry Insights:** Analyze category performance
- **Data Quality:** Assess data completeness and accuracy

## 🚀 Next Steps

### Immediate Actions
1. **Review Dashboard:** Open the interactive dashboard for visual insights
2. **Analyze Insights:** Review generated insights for actionable items
3. **Export Data:** Use analysis results for further processing
4. **Share Reports:** Distribute findings to stakeholders

### Advanced Analysis
1. **Time Series Analysis:** Track changes over multiple scrapes
2. **Predictive Modeling:** Forecast business trends
3. **Segmentation Analysis:** Create business clusters
4. **Performance Benchmarking:** Compare against industry standards

## 📞 Technical Support

For questions about the analysis or visualizations:
- Check the generated log files for detailed information
- Review the analysis results JSON for complete data
- Use the interactive dashboard for exploration
- Contact the development team for technical support

---

**Generated by:** Yellowpages.com Data Mining Pipeline
**Version:** 1.0
**Date:** ${new Date().toLocaleDateString()}
`;

  return report;
}

/**
 * Export insights to structured format
 * @param {Array} insights - Generated insights
 * @param {string} outputPath - Output directory
 */
function exportInsights(insights, outputPath) {
  try {
    const insightsData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalInsights: insights.length,
        insightTypes: [...new Set(insights.map(i => i.type))]
      },
      insights: insights,
      summary: {
        byType: insights.reduce((acc, insight) => {
          acc[insight.type] = (acc[insight.type] || 0) + 1;
          return acc;
        }, {}),
        priorityInsights: insights.filter(i => i.type === 'market' || i.type === 'competition')
      }
    };

    const insightsPath = path.join(outputPath, 'key_insights.json');
    fs.writeFileSync(insightsPath, JSON.stringify(insightsData, null, 2), 'utf8');
    console.log(`💡 Insights exported to: ${insightsPath}`);
    
    return insightsPath;
  } catch (error) {
    console.error('Error exporting insights:', error.message);
    return null;
  }
}

/**
 * Create index HTML file for easy navigation
 * @param {Object} directories - Output directories
 * @param {Object} visualizationPaths - Visualization file paths
 * @param {Object} analysisResults - Analysis results
 */
function createIndexHTML(directories, visualizationPaths, analysisResults) {
  const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yellowpages.com Data Mining Results</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .file-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .file-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        
        .file-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .file-description {
            color: #7f8c8d;
            margin-bottom: 15px;
            font-size: 0.9em;
        }
        
        .file-link {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .file-link:hover {
            background: #2980b9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Yellowpages.com Data Mining Results</h1>
        <p>Comprehensive analysis of ${analysisResults.metadata.totalBusinesses} businesses</p>
        <p>Generated on ${new Date(analysisResults.metadata.analysisDate).toLocaleDateString()}</p>
    </div>
    
    <div class="section">
        <h2>📈 Quick Statistics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${analysisResults.metadata.totalBusinesses}</div>
                <div class="stat-label">Total Businesses</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysisResults.summary.websiteAdoption}</div>
                <div class="stat-label">Website Adoption</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysisResults.summary.averageRating.toFixed(1)}</div>
                <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysisResults.insights.length}</div>
                <div class="stat-label">Key Insights</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Interactive Visualizations</h2>
        <div class="file-grid">
            <div class="file-card">
                <div class="file-title">🎯 Interactive Dashboard</div>
                <div class="file-description">Comprehensive dashboard with charts, metrics, and insights</div>
                <a href="${path.basename(visualizationPaths.dashboard)}" class="file-link">Open Dashboard</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">📋 Detailed Report</div>
                <div class="file-description">In-depth analysis with tables and comprehensive statistics</div>
                <a href="${path.basename(visualizationPaths.detailedReport)}" class="file-link">View Report</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">🗺️ Geographic Map</div>
                <div class="file-description">Interactive map showing business distribution</div>
                <a href="${path.basename(visualizationPaths.mapVisualization)}" class="file-link">Open Map</a>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📁 Data Files</h2>
        <div class="file-grid">
            <div class="file-card">
                <div class="file-title">📊 Analysis Results</div>
                <div class="file-description">Complete analysis data in JSON format</div>
                <a href="analysis/analysis_results_*.json" class="file-link">Download JSON</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">💡 Key Insights</div>
                <div class="file-description">Structured insights and recommendations</div>
                <a href="insights/key_insights.json" class="file-link">View Insights</a>
            </div>
            
            <div class="file-card">
                <div class="file-title">📄 Mining Report</div>
                <div class="file-description">Comprehensive analysis report</div>
                <a href="reports/mining_report.md" class="file-link">Read Report</a>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🔍 Key Insights Summary</h2>
        <div class="file-grid">
            ${analysisResults.insights.map(insight => `
                <div class="file-card">
                    <div class="file-title">${insight.title}</div>
                    <div class="file-description">${insight.description}</div>
                    <div style="color: #3498db; font-style: italic; margin-top: 10px;">
                        💡 ${insight.action}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

  const indexPath = path.join(directories.root, 'index.html');
  fs.writeFileSync(indexPath, indexHTML, 'utf8');
  console.log(`📄 Index file created: ${indexPath}`);
  
  return indexPath;
}

/**
 * Main data mining pipeline function
 * @param {string} csvFilePath - Path to CSV file (optional, will auto-detect if not provided)
 * @param {string} outputPath - Output directory for results
 * @returns {Object} Complete pipeline results
 */
function runDataMiningPipeline(csvFilePath = null, outputPath = PIPELINE_CONFIG.outputDirectory) {
  console.log('🚀 Starting Yellowpages.com Data Mining Pipeline...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // Step 1: Create output structure
    console.log('📁 Creating output directory structure...');
    const directories = createOutputStructure(outputPath, timestamp);
    
    // Step 2: Find CSV file if not provided
    if (!csvFilePath) {
      const csvFiles = findCSVFiles();
      if (csvFiles.length === 0) {
        throw new Error('No CSV files found in current directory');
      }
      csvFilePath = csvFiles[0]; // Use the first CSV file found
      console.log(`📄 Using CSV file: ${csvFilePath}`);
    }
    
    // Step 3: Perform complete analysis
    console.log('🔍 Performing comprehensive data analysis...');
    const analysisResults = performCompleteAnalysis(csvFilePath, directories.analysis);
    
    if (!analysisResults) {
      throw new Error('Analysis failed - no results generated');
    }
    
    // Step 4: Generate visualizations
    console.log('🎨 Generating visualizations...');
    const analysisResultsPath = path.join(directories.analysis, `analysis_results_${timestamp}.json`);
    const visualizationPaths = generateVisualizations(analysisResultsPath, directories.visualizations);
    
    // Step 5: Export insights
    console.log('💡 Exporting insights...');
    const insightsPath = exportInsights(analysisResults.insights, directories.insights);
    
    // Step 6: Generate mining report
    console.log('📄 Generating mining report...');
    const miningReport = generateMiningReport(analysisResults, visualizationPaths, directories);
    const reportPath = path.join(directories.reports, 'mining_report.md');
    fs.writeFileSync(reportPath, miningReport, 'utf8');
    
    // Step 7: Create index HTML
    console.log('📄 Creating index file...');
    const indexPath = createIndexHTML(directories, visualizationPaths, analysisResults);
    
    // Step 8: Compile results
    const pipelineResults = {
      success: true,
      timestamp: timestamp,
      directories: directories,
      files: {
        analysis: analysisResultsPath,
        dashboard: visualizationPaths.dashboard,
        detailedReport: visualizationPaths.detailedReport,
        mapVisualization: visualizationPaths.mapVisualization,
        insights: insightsPath,
        miningReport: reportPath,
        index: indexPath
      },
      summary: {
        totalBusinesses: analysisResults.metadata.totalBusinesses,
        insightsGenerated: analysisResults.insights.length,
        visualizationsCreated: Object.keys(visualizationPaths).length,
        outputDirectory: directories.root
      }
    };
    
    console.log('\n✅ Data Mining Pipeline completed successfully!');
    console.log('\n📊 Results Summary:');
    console.log(`   - Total businesses analyzed: ${pipelineResults.summary.totalBusinesses}`);
    console.log(`   - Insights generated: ${pipelineResults.summary.insightsGenerated}`);
    console.log(`   - Visualizations created: ${pipelineResults.summary.visualizationsCreated}`);
    console.log(`   - Output directory: ${pipelineResults.summary.outputDirectory}`);
    
    console.log('\n🎯 Next Steps:');
    console.log(`   1. Open ${indexPath} in your browser to view all results`);
    console.log(`   2. Review the interactive dashboard for visual insights`);
    console.log(`   3. Check the mining report for detailed analysis`);
    console.log(`   4. Use the insights for business decision making`);
    
    return pipelineResults;
    
  } catch (error) {
    console.error('\n❌ Data Mining Pipeline failed:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: timestamp
    };
  }
}

/**
 * Quick analysis function for immediate insights
 * @param {string} csvFilePath - Path to CSV file
 * @returns {Object} Quick analysis results
 */
function quickAnalysis(csvFilePath) {
  console.log('⚡ Performing quick analysis...');
  
  try {
    const analysisResults = performCompleteAnalysis(csvFilePath, './');
    
    if (analysisResults) {
      console.log('\n📊 Quick Analysis Results:');
      console.log(`   - Total businesses: ${analysisResults.metadata.totalBusinesses}`);
      console.log(`   - Website adoption: ${analysisResults.summary.websiteAdoption}`);
      console.log(`   - Average rating: ${analysisResults.summary.averageRating.toFixed(2)} stars`);
      console.log(`   - Top category: ${analysisResults.summary.topCategories[0]?.[0] || 'N/A'}`);
      console.log(`   - Top city: ${analysisResults.summary.topCities[0]?.[0] || 'N/A'}`);
      
      console.log('\n💡 Key Insights:');
      analysisResults.insights.slice(0, 3).forEach((insight, index) => {
        console.log(`   ${index + 1}. ${insight.title}: ${insight.description}`);
      });
    }
    
    return analysisResults;
  } catch (error) {
    console.error('Quick analysis failed:', error.message);
    return null;
  }
}

module.exports = {
  runDataMiningPipeline,
  quickAnalysis,
  PIPELINE_CONFIG
}; 