const readline = require('readline');

// ==========================
// Yellowpages.com Scraper - Configuration Module
// ==========================
// This module handles all user configuration, including category and subcategory selection, search term, zip code, and parallelism settings.
// It provides a menu-driven CLI for user input and exports the configuration object for use by the main scraper.
//
// Key Features:
// - Business categories and subcategories are defined for user selection
// - Supports a "Custom Search" option for arbitrary search terms
// - Prompts user for zip code and parallelism
// - Validates and summarizes configuration before proceeding

const BUSINESS_CATEGORIES = [
  {
    name: "Auto Services",
    subcategories: [
      "Auto Body Shops",
      "Auto Glass Repair",
      "Auto Parts",
      "Auto Repair",
      "Car Detailing",
      "Oil Change",
      "Roadside Assistance",
      "Tire Shops",
      "Towing",
      "Window Tinting"
    ]
  },
  {
    name: "Beauty",
    subcategories: [
      "Barber Shops",
      "Beauty Salons",
      "Beauty Supplies",
      "Days Spas",
      "Facial Salons",
      "Hair Removal",
      "Hair Supplies",
      "Hair Stylists",
      "Massage",
      "Nail Salons"
    ]
  },
  {
    name: "Home Services",
    subcategories: [
      "Ac Repair",
      "Appliance Repair",
      "Carpet Cleaning",
      "Electricians",
      "Garage Door Repair",
      "Moving Companies",
      "Pest Control Services",
      "Plumbers",
      "Self Storage"
    ]
  },
  {
    name: "Insurance",
    subcategories: [
      "Boat Insurance",
      "Business Insurance",
      "Car Insurance",
      "Dental Insurance",
      "Disability Insurance",
      "Flood Insurance",
      "Home Insurance",
      "Insurance",
      "Liability Insurance",
      "Life Insurance"
    ]
  },
  {
    name: "Legal Services",
    subcategories: [
      "Attorneys",
      "Bail Bonds",
      "Bankruptcy Attorneys",
      "Car Accident Lawyer",
      "Divorce Attorneys",
      "Family Law Attorneys",
      "Lie Detector Tests",
      "Private Investigators",
      "Process Servers",
      "Stenographers",
      "Tax Attorneys"
    ]
  },
  {
    name: "Medical Services",
    subcategories: [
      "Dentists",
      "Dermatologists",
      "Doctors",
      "Endocrinologists",
      "Gynecologists",
      "Hospitals",
      "Neurologists",
      "Ophthalmologists",
      "Optometrists",
      "Physical Therapy",
      "Podiatrists"
    ]
  },
  {
    name: "Pet Services",
    subcategories: [
      "Animal Shelters",
      "Dog Training",
      "Doggy Daycares",
      "Emergency Vets",
      "Kennels",
      "Mobile Pet Grooming",
      "Pet Boarding",
      "Pet Cemeteries",
      "Pet Grooming",
      "Veterinary Clinics"
    ]
  },
  {
    name: "Restaurants",
    subcategories: [
      "Breakfast Restaurants",
      "Chinese Restaurants",
      "Cuban Restaurants",
      "Italian Restaurants",
      "Korean Restaurants",
      "Mexican Restaurants",
      "Seafood Restaurants",
      "Sushi Bars",
      "Thai Restaurants",
      "Vegetarian Restaurants",
      "Pizza Parlors",
      "Fast Food Restaurants",
      "Steak Houses",
      "Family Style Restaurants",
      "Barbecue Restaurants",
      "Take Out Restaurants"
    ]
  },
  {
    name: "Custom Search",
    subcategories: []
  }
];

let config = {
  businessCategory: null,
  searchTerm: null,
  zipCode: null,
  parallelPages: 20,
  maxPages: null
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function displayMenu(title, options) {
  console.log(`\n=== ${title} ===`);
  options.forEach((option, idx) => {
    console.log(`${idx + 1}. ${option.name}`);
  });
  const choice = await askQuestion('\nEnter your choice (number): ');
  return parseInt(choice);
}

async function getUserConfiguration() {
  console.log('🚀 Yellowpages Scraper - Configuration\n');
  const categoryChoice = await displayMenu('Select Business Category', BUSINESS_CATEGORIES);
  const selectedCategory = BUSINESS_CATEGORIES[categoryChoice - 1];
  if (!selectedCategory) {
    console.log('Invalid choice. Using default: Restaurants');
    config.businessCategory = 'Restaurants';
    config.searchTerm = 'Restaurants';
  } else if (selectedCategory.name === 'Custom Search') {
    config.businessCategory = 'Custom Search';
    config.searchTerm = await askQuestion('Enter custom search term: ');
  } else {
    config.businessCategory = selectedCategory.name;
    if (selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
      console.log(`\n📋 Selected: ${config.businessCategory}`);
      selectedCategory.subcategories.forEach((sub, idx) => {
        console.log(`${idx + 1}. ${sub}`);
      });
      const subcategoryChoice = await askQuestion('Select Subcategory (number): ');
      const subcategory = selectedCategory.subcategories[parseInt(subcategoryChoice) - 1];
      if (subcategory) {
        config.searchTerm = subcategory;
        config.businessCategory = `${config.businessCategory} - ${subcategory}`;
      } else {
        console.log('Invalid subcategory choice. Using main category as search term.');
        config.searchTerm = selectedCategory.name;
      }
    } else {
      config.searchTerm = selectedCategory.name;
    }
  }
  config.zipCode = await askQuestion('Enter your zip code: ');
  const parallelChoice = await askQuestion('\nNumber of pages to scrape in parallel (default: 3): ');
  config.parallelPages = parallelChoice ? parseInt(parallelChoice) : 3;
  console.log('\n📋 Configuration Summary:');
  console.log(`Business Category: ${config.businessCategory}`);
  console.log(`Search Term: ${config.searchTerm}`);
  console.log(`Zip Code: ${config.zipCode}`);
  console.log(`Parallel Pages: ${config.parallelPages}`);
  const confirm = await askQuestion('\nProceed with this configuration? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Configuration cancelled.');
    process.exit(0);
  }
  rl.close();
}

module.exports = {
  BUSINESS_CATEGORIES,
  config,
  getUserConfiguration
}; 