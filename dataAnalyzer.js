// ==========================
// Yellowpages.com Scraper - Data Analysis Module
// ==========================
// This module provides comprehensive data mining and analysis capabilities for scraped business data.
// It includes statistical analysis, pattern recognition, geographic analysis, and business insights.
// All analysis results are formatted for easy visualization and reporting.

const fs = require('fs');
const path = require('path');

// ==========================
// Core Analysis Functions
// ==========================

/**
 * Load and parse CSV data for analysis
 * @param {string} csvFilePath - Path to the CSV file
 * @returns {Array} Parsed data array
 */
function loadData(csvFilePath) {
  try {
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return { data, headers };
  } catch (error) {
    console.error('Error loading data:', error.message);
    return { data: [], headers: [] };
  }
}

/**
 * Generate comprehensive business statistics
 * @param {Array} data - Business data array
 * @returns {Object} Statistics object
 */
function generateBusinessStatistics(data) {
  const stats = {
    totalBusinesses: data.length,
    categories: {},
    ratings: {
      ypRating: { distribution: {}, average: 0 },
      taRating: { distribution: {}, average: 0 },
      googleRating: { distribution: {}, average: 0 }
    },
    contactInfo: {
      withWebsite: 0,
      withPhone: 0,
      withEmail: 0,
      withSocialMedia: 0
    },
    geographic: {
      cities: {},
      states: {},
      zipCodes: {}
    },
    businessFeatures: {
      claimed: 0,
      verified: 0,
      yearsInBusiness: { distribution: {}, average: 0 },
      hasPhotos: 0,
      hasReviews: 0
    },
    services: {},
    paymentMethods: {},
    operatingHours: {
      open24Hours: 0,
      weekendHours: 0,
      weekdayHours: 0
    }
  };

  data.forEach(business => {
    // Category analysis
    if (business.categories) {
      const categories = business.categories.split(';').map(c => c.trim());
      categories.forEach(cat => {
        stats.categories[cat] = (stats.categories[cat] || 0) + 1;
      });
    }

    // Rating analysis
    if (business.ypRating) {
      const rating = parseFloat(business.ypRating);
      if (!isNaN(rating)) {
        stats.ratings.ypRating.distribution[rating] = (stats.ratings.ypRating.distribution[rating] || 0) + 1;
      }
    }

    // Contact information analysis
    if (business.website) stats.contactInfo.withWebsite++;
    if (business.phone) stats.contactInfo.withPhone++;
    if (business.email) stats.contactInfo.withEmail++;
    if (business.socialMedia) stats.contactInfo.withSocialMedia++;

    // Geographic analysis
    if (business.address) {
      const addressParts = business.address.split(',').map(p => p.trim());
      if (addressParts.length >= 2) {
        const city = addressParts[addressParts.length - 2];
        const stateZip = addressParts[addressParts.length - 1];
        const state = stateZip.split(' ')[0];
        const zipCode = stateZip.split(' ')[1];

        stats.geographic.cities[city] = (stats.geographic.cities[city] || 0) + 1;
        stats.geographic.states[state] = (stats.geographic.states[state] || 0) + 1;
        if (zipCode) {
          stats.geographic.zipCodes[zipCode] = (stats.geographic.zipCodes[zipCode] || 0) + 1;
        }
      }
    }

    // Business features analysis
    if (business.claimed === 'true' || business.claimed === true) stats.businessFeatures.claimed++;
    if (business.verified === 'true' || business.verified === true) stats.businessFeatures.verified++;
    
    if (business.yearsInBusiness) {
      const years = parseInt(business.yearsInBusiness);
      if (!isNaN(years)) {
        const yearRange = Math.floor(years / 5) * 5;
        const rangeKey = `${yearRange}-${yearRange + 4} years`;
        stats.businessFeatures.yearsInBusiness.distribution[rangeKey] = 
          (stats.businessFeatures.yearsInBusiness.distribution[rangeKey] || 0) + 1;
      }
    }

    if (business.totalPhotos && parseInt(business.totalPhotos) > 0) stats.businessFeatures.hasPhotos++;
    if (business.totalReviews && parseInt(business.totalReviews) > 0) stats.businessFeatures.hasReviews++;

    // Services analysis
    if (business.services) {
      const services = business.services.split(';').map(s => s.trim());
      services.forEach(service => {
        stats.services[service] = (stats.services[service] || 0) + 1;
      });
    }

    // Payment methods analysis
    if (business.paymentMethods) {
      const payments = business.paymentMethods.split(';').map(p => p.trim());
      payments.forEach(payment => {
        stats.paymentMethods[payment] = (stats.paymentMethods[payment] || 0) + 1;
      });
    }

    // Operating hours analysis
    if (business.hours) {
      const hours = business.hours.toLowerCase();
      if (hours.includes('24') || hours.includes('24-hour')) {
        stats.operatingHours.open24Hours++;
      }
      if (hours.includes('saturday') || hours.includes('sunday')) {
        stats.operatingHours.weekendHours++;
      }
      if (hours.includes('monday') || hours.includes('tuesday') || hours.includes('wednesday') || 
          hours.includes('thursday') || hours.includes('friday')) {
        stats.operatingHours.weekdayHours++;
      }
    }
  });

  // Calculate averages
  const ypRatings = data.filter(b => b.ypRating && !isNaN(parseFloat(b.ypRating)))
    .map(b => parseFloat(b.ypRating));
  if (ypRatings.length > 0) {
    stats.ratings.ypRating.average = ypRatings.reduce((a, b) => a + b, 0) / ypRatings.length;
  }

  return stats;
}

/**
 * Generate competitive analysis insights
 * @param {Array} data - Business data array
 * @returns {Object} Competitive analysis object
 */
function generateCompetitiveAnalysis(data) {
  const analysis = {
    marketShare: {},
    pricingAnalysis: {},
    serviceComparison: {},
    geographicConcentration: {},
    onlinePresence: {},
    customerEngagement: {}
  };

  // Market share by category
  const categoryCounts = {};
  data.forEach(business => {
    if (business.categories) {
      const categories = business.categories.split(';').map(c => c.trim());
      categories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
  });

  const totalBusinesses = data.length;
  Object.keys(categoryCounts).forEach(category => {
    analysis.marketShare[category] = {
      count: categoryCounts[category],
      percentage: ((categoryCounts[category] / totalBusinesses) * 100).toFixed(2)
    };
  });

  // Pricing analysis
  const priceRanges = {};
  data.forEach(business => {
    if (business.priceRange) {
      priceRanges[business.priceRange] = (priceRanges[business.priceRange] || 0) + 1;
    }
  });
  analysis.pricingAnalysis = priceRanges;

  // Service comparison
  const serviceFrequency = {};
  data.forEach(business => {
    if (business.services) {
      const services = business.services.split(';').map(s => s.trim());
      services.forEach(service => {
        serviceFrequency[service] = (serviceFrequency[service] || 0) + 1;
      });
    }
  });
  analysis.serviceComparison = serviceFrequency;

  // Geographic concentration
  const cityConcentration = {};
  data.forEach(business => {
    if (business.address) {
      const addressParts = business.address.split(',').map(p => p.trim());
      if (addressParts.length >= 2) {
        const city = addressParts[addressParts.length - 2];
        cityConcentration[city] = (cityConcentration[city] || 0) + 1;
      }
    }
  });
  analysis.geographicConcentration = cityConcentration;

  // Online presence analysis
  const onlinePresence = {
    withWebsite: data.filter(b => b.website).length,
    withSocialMedia: data.filter(b => b.socialMedia).length,
    withOnlineBooking: data.filter(b => b.onlineBooking).length,
    withReviews: data.filter(b => b.totalReviews && parseInt(b.totalReviews) > 0).length
  };
  analysis.onlinePresence = onlinePresence;

  // Customer engagement (based on reviews)
  const engagementData = data.filter(b => b.totalReviews && parseInt(b.totalReviews) > 0);
  const avgReviews = engagementData.length > 0 ? 
    engagementData.reduce((sum, b) => sum + parseInt(b.totalReviews), 0) / engagementData.length : 0;
  
  analysis.customerEngagement = {
    businessesWithReviews: engagementData.length,
    averageReviewsPerBusiness: avgReviews.toFixed(2),
    totalReviews: engagementData.reduce((sum, b) => sum + parseInt(b.totalReviews), 0)
  };

  return analysis;
}

/**
 * Generate trend analysis
 * @param {Array} data - Business data array
 * @returns {Object} Trend analysis object
 */
function generateTrendAnalysis(data) {
  const trends = {
    businessAge: {
      newBusinesses: 0, // 0-2 years
      established: 0,   // 3-10 years
      mature: 0,        // 11+ years
      distribution: {}
    },
    digitalAdoption: {
      websiteAdoption: 0,
      socialMediaAdoption: 0,
      onlineBookingAdoption: 0
    },
    customerSatisfaction: {
      highRating: 0,    // 4+ stars
      mediumRating: 0,  // 3-3.9 stars
      lowRating: 0      // <3 stars
    }
  };

  data.forEach(business => {
    // Business age analysis
    if (business.yearsInBusiness) {
      const years = parseInt(business.yearsInBusiness);
      if (!isNaN(years)) {
        if (years <= 2) trends.businessAge.newBusinesses++;
        else if (years <= 10) trends.businessAge.established++;
        else trends.businessAge.mature++;

        const yearRange = Math.floor(years / 5) * 5;
        const rangeKey = `${yearRange}-${yearRange + 4} years`;
        trends.businessAge.distribution[rangeKey] = 
          (trends.businessAge.distribution[rangeKey] || 0) + 1;
      }
    }

    // Digital adoption analysis
    if (business.website) trends.digitalAdoption.websiteAdoption++;
    if (business.socialMedia) trends.digitalAdoption.socialMediaAdoption++;
    if (business.onlineBooking) trends.digitalAdoption.onlineBookingAdoption++;

    // Customer satisfaction analysis
    if (business.ypRating) {
      const rating = parseFloat(business.ypRating);
      if (!isNaN(rating)) {
        if (rating >= 4) trends.customerSatisfaction.highRating++;
        else if (rating >= 3) trends.customerSatisfaction.mediumRating++;
        else trends.customerSatisfaction.lowRating++;
      }
    }
  });

  // Calculate percentages
  const total = data.length;
  trends.digitalAdoption.websiteAdoptionPercent = ((trends.digitalAdoption.websiteAdoption / total) * 100).toFixed(2);
  trends.digitalAdoption.socialMediaAdoptionPercent = ((trends.digitalAdoption.socialMediaAdoption / total) * 100).toFixed(2);
  trends.digitalAdoption.onlineBookingAdoptionPercent = ((trends.digitalAdoption.onlineBookingAdoption / total) * 100).toFixed(2);

  return trends;
}

/**
 * Generate actionable insights
 * @param {Object} stats - Business statistics
 * @param {Object} competitive - Competitive analysis
 * @param {Object} trends - Trend analysis
 * @returns {Array} Array of actionable insights
 */
function generateInsights(stats, competitive, trends) {
  const insights = [];

  // Market insights
  const topCategories = Object.entries(stats.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  insights.push({
    type: 'market',
    title: 'Top Business Categories',
    description: `The most common business categories are: ${topCategories.map(([cat, count]) => `${cat} (${count})`).join(', ')}`,
    action: 'Consider focusing marketing efforts on these high-demand categories'
  });

  // Geographic insights
  const topCities = Object.entries(stats.geographic.cities)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  insights.push({
    type: 'geographic',
    title: 'Geographic Concentration',
    description: `Highest business concentration in: ${topCities.map(([city, count]) => `${city} (${count})`).join(', ')}`,
    action: 'Target these areas for business expansion or marketing campaigns'
  });

  // Digital presence insights
  const websitePercent = ((stats.contactInfo.withWebsite / stats.totalBusinesses) * 100).toFixed(1);
  insights.push({
    type: 'digital',
    title: 'Digital Presence Gap',
    description: `Only ${websitePercent}% of businesses have websites`,
    action: 'Opportunity to help businesses establish online presence'
  });

  // Rating insights
  if (stats.ratings.ypRating.average > 0) {
    insights.push({
      type: 'quality',
      title: 'Average Customer Satisfaction',
      description: `Average rating: ${stats.ratings.ypRating.average.toFixed(2)} stars`,
      action: stats.ratings.ypRating.average < 3.5 ? 'Focus on improving customer service quality' : 'Maintain high service standards'
    });
  }

  // Competition insights
  const mostCompetitive = Object.entries(competitive.geographicConcentration)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 1)[0];
  
  if (mostCompetitive) {
    insights.push({
      type: 'competition',
      title: 'Most Competitive Market',
      description: `${mostCompetitive[0]} has ${mostCompetitive[1]} businesses`,
      action: 'Consider niche positioning or unique value propositions in this market'
    });
  }

  return insights;
}

/**
 * Export analysis results to JSON
 * @param {Object} analysisResults - Complete analysis results
 * @param {string} outputPath - Output file path
 */
function exportAnalysisResults(analysisResults, outputPath) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `analysis_results_${timestamp}.json`;
    const fullPath = path.join(outputPath, filename);
    
    fs.writeFileSync(fullPath, JSON.stringify(analysisResults, null, 2), 'utf8');
    console.log(`📊 Analysis results exported to: ${fullPath}`);
    return fullPath;
  } catch (error) {
    console.error('Error exporting analysis results:', error.message);
    return null;
  }
}

/**
 * Main analysis function
 * @param {string} csvFilePath - Path to CSV file
 * @param {string} outputPath - Output directory for results
 * @returns {Object} Complete analysis results
 */
function performCompleteAnalysis(csvFilePath, outputPath = './') {
  console.log('🔍 Starting comprehensive data analysis...');
  
  // Load data
  const { data, headers } = loadData(csvFilePath);
  if (data.length === 0) {
    console.error('❌ No data found for analysis');
    return null;
  }

  console.log(`📈 Analyzing ${data.length} businesses...`);

  // Perform all analyses
  const stats = generateBusinessStatistics(data);
  const competitive = generateCompetitiveAnalysis(data);
  const trends = generateTrendAnalysis(data);
  const insights = generateInsights(stats, competitive, trends);

  // Compile complete results
  const analysisResults = {
    metadata: {
      totalBusinesses: data.length,
      analysisDate: new Date().toISOString(),
      dataSource: csvFilePath,
      fieldsAnalyzed: headers.length
    },
    statistics: stats,
    competitiveAnalysis: competitive,
    trendAnalysis: trends,
    insights: insights,
    summary: {
      topCategories: Object.entries(stats.categories).sort(([,a], [,b]) => b - a).slice(0, 5),
      topCities: Object.entries(stats.geographic.cities).sort(([,a], [,b]) => b - a).slice(0, 5),
      averageRating: stats.ratings.ypRating.average,
      websiteAdoption: ((stats.contactInfo.withWebsite / stats.totalBusinesses) * 100).toFixed(1) + '%'
    }
  };

  // Export results
  const exportPath = exportAnalysisResults(analysisResults, outputPath);
  
  console.log('✅ Analysis completed successfully!');
  console.log(`📊 Key findings:`);
  console.log(`   - Total businesses: ${analysisResults.metadata.totalBusinesses}`);
  console.log(`   - Website adoption: ${analysisResults.summary.websiteAdoption}`);
  console.log(`   - Average rating: ${analysisResults.summary.averageRating} stars`);
  console.log(`   - Insights generated: ${insights.length}`);

  return analysisResults;
}

module.exports = {
  loadData,
  generateBusinessStatistics,
  generateCompetitiveAnalysis,
  generateTrendAnalysis,
  generateInsights,
  exportAnalysisResults,
  performCompleteAnalysis
}; 