const fs = require('fs');
const path = require('path');

// ==========================
// Yellowpages.com Scraper - CSV Utilities Module
// ==========================
// This module provides functions to convert scraped data to CSV format and save it to disk.
// It ensures all rows have all columns (backfilling missing values) and handles CSV escaping.
// Updated to support project-specific folder organization.

// Function to convert data to CSV with dynamic headers
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  // Get all unique keys from all objects
  const allKeys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  
  // Ensure all rows have all columns (backfill missing values)
  const normalizedData = data.map(item => {
    const normalizedItem = {};
    headers.forEach(header => {
      normalizedItem[header] = item[header] || ''; // Fill missing columns with empty string
    });
    return normalizedItem;
  });
  
  const csvContent = [
    headers.join(','),
    ...normalizedData.map(item => 
      headers.map(header => {
        const value = item[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// Function to save data to CSV file (legacy function for backward compatibility)
function saveToCSV(data, searchTerm, zipCode) {
  const csvContent = convertToCSV(data);
  const filename = `${searchTerm}_${zipCode}_${new Date().toISOString().split('T')[0]}.csv`;
  fs.writeFileSync(filename, csvContent, 'utf8');
  return filename;
}

// Function to save data to CSV file within a project folder
function saveToCSVInProject(data, searchTerm, zipCode, projectFolderPath = null) {
  const csvContent = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (projectFolderPath) {
    // Save within project folder
    const filename = `final_results_${data.length}_businesses.csv`;
    const filePath = path.join(projectFolderPath, filename);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    return filename;
  } else {
    // Legacy behavior - save in current directory
    const filename = `${searchTerm}_${zipCode}_${timestamp}.csv`;
    fs.writeFileSync(filename, csvContent, 'utf8');
    return filename;
  }
}

module.exports = {
  convertToCSV,
  saveToCSV,
  saveToCSVInProject
}; 