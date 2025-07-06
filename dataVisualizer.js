// ==========================
// Yellowpages.com Scraper - Data Visualization Module
// ==========================
// This module generates comprehensive HTML reports with interactive charts and visualizations
// for the analyzed Yellowpages data. It uses Chart.js for interactive charts and creates
// a complete dashboard with multiple visualization types.

const fs = require('fs');
const path = require('path');

// ==========================
// HTML Template Generation
// ==========================

/**
 * Generate the main HTML dashboard template
 * @param {Object} analysisResults - Complete analysis results
 * @param {string} outputPath - Output directory
 * @returns {string} Generated HTML content
 */
function generateDashboardHTML(analysisResults) {
  const { metadata, statistics, competitiveAnalysis, trendAnalysis, insights, summary } = analysisResults;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yellowpages.com Business Analysis Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .charts-section {
            padding: 30px;
        }
        
        .chart-container {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .chart-title {
            font-size: 1.5em;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }
        
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .insights-section {
            background: #f8f9fa;
            padding: 30px;
        }
        
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .insight-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-left: 4px solid #3498db;
        }
        
        .insight-type {
            font-size: 0.8em;
            text-transform: uppercase;
            color: #7f8c8d;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .insight-title {
            font-size: 1.2em;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .insight-description {
            color: #34495e;
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .insight-action {
            color: #3498db;
            font-weight: 600;
            font-style: italic;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .chart-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .insights-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Business Analysis Dashboard</h1>
            <p>Comprehensive analysis of ${metadata.totalBusinesses} businesses from Yellowpages.com</p>
            <p>Analysis Date: ${new Date(metadata.analysisDate).toLocaleDateString()}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${metadata.totalBusinesses}</div>
                <div class="stat-label">Total Businesses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.websiteAdoption}</div>
                <div class="stat-label">Website Adoption</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.averageRating.toFixed(1)}</div>
                <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${insights.length}</div>
                <div class="stat-label">Key Insights</div>
            </div>
        </div>
        
        <div class="charts-section">
            <div class="chart-grid">
                <div class="chart-container">
                    <div class="chart-title">📈 Business Categories Distribution</div>
                    <canvas id="categoriesChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-title">🌍 Geographic Distribution</div>
                    <canvas id="geographicChart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <div class="chart-grid">
                <div class="chart-container">
                    <div class="chart-title">⭐ Rating Distribution</div>
                    <canvas id="ratingsChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-title">💻 Digital Presence Analysis</div>
                    <canvas id="digitalChart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <div class="chart-grid">
                <div class="chart-container">
                    <div class="chart-title">📅 Business Age Distribution</div>
                    <canvas id="ageChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-title">🏆 Customer Satisfaction Levels</div>
                    <canvas id="satisfactionChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
        
        <div class="insights-section">
            <h2 style="text-align: center; margin-bottom: 30px; color: #2c3e50;">🔍 Key Insights & Recommendations</h2>
            <div class="insights-grid">
                ${insights.map(insight => `
                    <div class="insight-card">
                        <div class="insight-type">${insight.type.toUpperCase()}</div>
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-description">${insight.description}</div>
                        <div class="insight-action">💡 ${insight.action}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by Yellowpages.com Business Analysis Tool | ${new Date().toLocaleDateString()}</p>
        </div>
    </div>

    <script>
        // Chart.js configuration
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#2c3e50';
        
        // Categories Chart
        const categoriesData = ${JSON.stringify(Object.entries(statistics.categories).sort(([,a], [,b]) => b - a).slice(0, 10))};
        new Chart(document.getElementById('categoriesChart'), {
            type: 'bar',
            data: {
                labels: categoriesData.map(item => item[0]),
                datasets: [{
                    label: 'Number of Businesses',
                    data: categoriesData.map(item => item[1]),
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Geographic Chart
        const geographicData = ${JSON.stringify(Object.entries(statistics.geographic.cities).sort(([,a], [,b]) => b - a).slice(0, 8))};
        new Chart(document.getElementById('geographicChart'), {
            type: 'doughnut',
            data: {
                labels: geographicData.map(item => item[0]),
                datasets: [{
                    data: geographicData.map(item => item[1]),
                    backgroundColor: [
                        '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
                        '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Ratings Chart
        const ratingsData = ${JSON.stringify(Object.entries(statistics.ratings.ypRating.distribution))};
        new Chart(document.getElementById('ratingsChart'), {
            type: 'line',
            data: {
                labels: ratingsData.map(item => item[0] + ' stars'),
                datasets: [{
                    label: 'Number of Businesses',
                    data: ratingsData.map(item => item[1]),
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Digital Presence Chart
        const digitalData = {
            labels: ['Website', 'Social Media', 'Online Booking', 'Reviews'],
            datasets: [{
                label: 'Businesses with Feature',
                data: [
                    ${statistics.contactInfo.withWebsite},
                    ${statistics.contactInfo.withSocialMedia},
                    ${competitiveAnalysis.onlinePresence.withOnlineBooking},
                    ${competitiveAnalysis.onlinePresence.withReviews}
                ],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(243, 156, 18, 0.8)'
                ]
            }]
        };
        new Chart(document.getElementById('digitalChart'), {
            type: 'bar',
            data: digitalData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Business Age Chart
        const ageData = ${JSON.stringify(Object.entries(trendAnalysis.businessAge.distribution))};
        new Chart(document.getElementById('ageChart'), {
            type: 'pie',
            data: {
                labels: ageData.map(item => item[0]),
                datasets: [{
                    data: ageData.map(item => item[1]),
                    backgroundColor: [
                        '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
                        '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Customer Satisfaction Chart
        const satisfactionData = {
            labels: ['High Rating (4+)', 'Medium Rating (3-3.9)', 'Low Rating (<3)'],
            datasets: [{
                data: [
                    ${trendAnalysis.customerSatisfaction.highRating},
                    ${trendAnalysis.customerSatisfaction.mediumRating},
                    ${trendAnalysis.customerSatisfaction.lowRating}
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ]
            }]
        };
        new Chart(document.getElementById('satisfactionChart'), {
            type: 'doughnut',
            data: satisfactionData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
</body>
</html>`;

  return html;
}

/**
 * Generate detailed analysis report HTML
 * @param {Object} analysisResults - Complete analysis results
 * @returns {string} Generated HTML content
 */
function generateDetailedReportHTML(analysisResults) {
  const { metadata, statistics, competitiveAnalysis, trendAnalysis } = analysisResults;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detailed Business Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
        
        .report-header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .data-table th, .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .data-table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .metric-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .metric-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .chart-container {
            margin: 20px 0;
            height: 400px;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>📋 Detailed Business Analysis Report</h1>
        <p><strong>Analysis Date:</strong> ${new Date(metadata.analysisDate).toLocaleDateString()}</p>
        <p><strong>Total Businesses Analyzed:</strong> ${metadata.totalBusinesses}</p>
        <p><strong>Data Source:</strong> ${metadata.dataSource}</p>
    </div>
    
    <div class="section">
        <h2>📊 Business Statistics Overview</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${statistics.totalBusinesses}</div>
                <div class="metric-label">Total Businesses</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${statistics.contactInfo.withWebsite}</div>
                <div class="metric-label">With Websites</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${statistics.contactInfo.withPhone}</div>
                <div class="metric-label">With Phone Numbers</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${statistics.businessFeatures.claimed}</div>
                <div class="metric-label">Claimed Listings</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🏢 Top Business Categories</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(statistics.categories)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 15)
                  .map(([category, count]) => `
                    <tr>
                        <td>${category}</td>
                        <td>${count}</td>
                        <td>${((count / statistics.totalBusinesses) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>🌍 Geographic Distribution</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>City</th>
                    <th>Business Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(statistics.geographic.cities)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 20)
                  .map(([city, count]) => `
                    <tr>
                        <td>${city}</td>
                        <td>${count}</td>
                        <td>${((count / statistics.totalBusinesses) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>⭐ Rating Analysis</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${statistics.ratings.ypRating.average.toFixed(2)}</div>
                <div class="metric-label">Average Rating</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Object.keys(statistics.ratings.ypRating.distribution).length}</div>
                <div class="metric-label">Rating Levels</div>
            </div>
        </div>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th>Rating</th>
                    <th>Business Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(statistics.ratings.ypRating.distribution)
                  .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                  .map(([rating, count]) => `
                    <tr>
                        <td>${rating} stars</td>
                        <td>${count}</td>
                        <td>${((count / statistics.totalBusinesses) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>💻 Digital Presence Analysis</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${((statistics.contactInfo.withWebsite / statistics.totalBusinesses) * 100).toFixed(1)}%</div>
                <div class="metric-label">Website Adoption</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${((statistics.contactInfo.withSocialMedia / statistics.totalBusinesses) * 100).toFixed(1)}%</div>
                <div class="metric-label">Social Media Adoption</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${((competitiveAnalysis.onlinePresence.withOnlineBooking / statistics.totalBusinesses) * 100).toFixed(1)}%</div>
                <div class="metric-label">Online Booking</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${((competitiveAnalysis.onlinePresence.withReviews / statistics.totalBusinesses) * 100).toFixed(1)}%</div>
                <div class="metric-label">With Reviews</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📈 Business Age Distribution</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Age Range</th>
                    <th>Business Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(trendAnalysis.businessAge.distribution)
                  .map(([range, count]) => `
                    <tr>
                        <td>${range}</td>
                        <td>${count}</td>
                        <td>${((count / statistics.totalBusinesses) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>🔍 Competitive Analysis</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${competitiveAnalysis.customerEngagement.businessesWithReviews}</div>
                <div class="metric-label">Businesses with Reviews</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${competitiveAnalysis.customerEngagement.averageReviewsPerBusiness}</div>
                <div class="metric-label">Avg Reviews per Business</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${competitiveAnalysis.customerEngagement.totalReviews}</div>
                <div class="metric-label">Total Reviews</div>
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
}

/**
 * Generate interactive map visualization HTML
 * @param {Object} analysisResults - Complete analysis results
 * @returns {string} Generated HTML content
 */
function generateMapVisualizationHTML(analysisResults) {
  const { statistics } = analysisResults;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geographic Business Distribution Map</title>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .map-container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        #map {
            height: 600px;
            width: 100%;
            border-radius: 8px;
        }
        
        .controls {
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .control-group label {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .control-group select, .control-group input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .stats-panel {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="map-container">
        <h1>🗺️ Geographic Business Distribution</h1>
        
        <div class="stats-panel">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${Object.keys(statistics.geographic.cities).length}</div>
                    <div class="stat-label">Cities</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Object.keys(statistics.geographic.states).length}</div>
                    <div class="stat-label">States</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Object.keys(statistics.geographic.zipCodes).length}</div>
                    <div class="stat-label">Zip Codes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${statistics.totalBusinesses}</div>
                    <div class="stat-label">Total Businesses</div>
                </div>
            </div>
        </div>
        
        <div class="controls">
            <div class="control-group">
                <label for="categoryFilter">Filter by Category:</label>
                <select id="categoryFilter">
                    <option value="">All Categories</option>
                    ${Object.keys(statistics.categories).map(category => 
                      `<option value="${category}">${category}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="control-group">
                <label for="ratingFilter">Filter by Rating:</label>
                <select id="ratingFilter">
                    <option value="">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                </select>
            </div>
        </div>
        
        <div id="map"></div>
    </div>

    <script>
        // Initialize map
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: { lat: 39.8283, lng: -98.5795 }, // Center of US
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });
        
        // Sample data - in real implementation, you would use actual coordinates
        const businessData = ${JSON.stringify(Object.entries(statistics.geographic.cities).slice(0, 20))};
        
        // Create markers for each city
        businessData.forEach(([city, count]) => {
            // In a real implementation, you would geocode the city names
            // For now, we'll use sample coordinates
            const marker = new google.maps.Marker({
                position: { lat: 39.8283 + (Math.random() - 0.5) * 10, lng: -98.5795 + (Math.random() - 0.5) * 10 },
                map: map,
                title: \`\${city}: \${count} businesses\`,
                label: count.toString()
            });
            
            const infowindow = new google.maps.InfoWindow({
                content: \`
                    <div style="padding: 10px;">
                        <h3>\${city}</h3>
                        <p><strong>\${count}</strong> businesses</p>
                        <p>\${((count / ${statistics.totalBusinesses}) * 100).toFixed(1)}% of total</p>
                    </div>
                \`
            });
            
            marker.addListener('click', () => {
                infowindow.open(map, marker);
            });
        });
        
        // Filter functionality
        document.getElementById('categoryFilter').addEventListener('change', function() {
            // Implement filtering logic here
            console.log('Category filter:', this.value);
        });
        
        document.getElementById('ratingFilter').addEventListener('change', function() {
            // Implement filtering logic here
            console.log('Rating filter:', this.value);
        });
    </script>
</body>
</html>`;

  return html;
}

/**
 * Export all visualizations to HTML files
 * @param {Object} analysisResults - Complete analysis results
 * @param {string} outputPath - Output directory
 * @returns {Object} Object with paths to generated files
 */
function exportVisualizations(analysisResults, outputPath = './') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate dashboard
    const dashboardHTML = generateDashboardHTML(analysisResults);
    const dashboardPath = path.join(outputPath, `dashboard_${timestamp}.html`);
    fs.writeFileSync(dashboardPath, dashboardHTML, 'utf8');
    
    // Generate detailed report
    const detailedHTML = generateDetailedReportHTML(analysisResults);
    const detailedPath = path.join(outputPath, `detailed_report_${timestamp}.html`);
    fs.writeFileSync(detailedPath, detailedHTML, 'utf8');
    
    // Generate map visualization
    const mapHTML = generateMapVisualizationHTML(analysisResults);
    const mapPath = path.join(outputPath, `map_visualization_${timestamp}.html`);
    fs.writeFileSync(mapPath, mapHTML, 'utf8');
    
    console.log('📊 Visualizations exported successfully!');
    console.log(`   - Dashboard: ${dashboardPath}`);
    console.log(`   - Detailed Report: ${detailedPath}`);
    console.log(`   - Map Visualization: ${mapPath}`);
    
    return {
      dashboard: dashboardPath,
      detailedReport: detailedPath,
      mapVisualization: mapPath
    };
  } catch (error) {
    console.error('Error exporting visualizations:', error.message);
    return null;
  }
}

/**
 * Main visualization function
 * @param {string} analysisResultsPath - Path to analysis results JSON file
 * @param {string} outputPath - Output directory for visualizations
 * @returns {Object} Object with paths to generated files
 */
function generateVisualizations(analysisResultsPath, outputPath = './') {
  try {
    console.log('🎨 Generating visualizations...');
    
    // Load analysis results
    const analysisResults = JSON.parse(fs.readFileSync(analysisResultsPath, 'utf8'));
    
    // Generate and export visualizations
    const visualizationPaths = exportVisualizations(analysisResults, outputPath);
    
    console.log('✅ Visualizations completed successfully!');
    return visualizationPaths;
  } catch (error) {
    console.error('Error generating visualizations:', error.message);
    return null;
  }
}

module.exports = {
  generateDashboardHTML,
  generateDetailedReportHTML,
  generateMapVisualizationHTML,
  exportVisualizations,
  generateVisualizations
}; 