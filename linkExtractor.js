// Function to extract YP links from search results
async function extractYPLinks(page) {
  return await page.evaluate(() => {
    // Only target organic results, exclude all ads
    const listings = Array.from(document.querySelectorAll('.search-results.organic .result, .search-results.organic .srp-listing'));
    
    // Filter out any listings that might be ads or duplicates
    const validListings = listings.filter(listing => {
      // Exclude if it has ad-related classes or attributes
      const hasAdClass = listing.classList.contains('paid-listing') || 
                        listing.classList.contains('astro-tmc') ||
                        listing.querySelector('.ad-pill') !== null;
      
      // Exclude if it's in an ad container
      const isInAdContainer = listing.closest('.center-ads') !== null ||
                             listing.closest('.side-ads') !== null;
      
      return !hasAdClass && !isInAdContainer;
    });
    
    // Extract YP links and remove duplicates
    const ypLinks = new Set();
    const uniqueLinks = [];
    
    validListings.forEach(listing => {
      const ypLinkRaw = listing.querySelector('.business-name')?.getAttribute('href') || null;
      if (ypLinkRaw) {
        const ypLink = `https://www.yellowpages.com${ypLinkRaw}`;
        if (!ypLinks.has(ypLink)) {
          ypLinks.add(ypLink);
          uniqueLinks.push(ypLink);
        }
      }
    });
    
    return uniqueLinks;
  });
}

// Function to get total pages from pagination
async function getTotalPages(page) {
  return await page.evaluate(() => {
    const showingCount = document.querySelector('.showing-count');
    const showingMatch = showingCount ? showingCount.innerText.match(/(\d+)-(\d+) of (\d+)/) : null;
    if (showingMatch) {
      const totalResults = parseInt(showingMatch[3]);
      const perPage = parseInt(showingMatch[2]) - parseInt(showingMatch[1]) + 1;
      return Math.ceil(totalResults / perPage);
    }
    // Fallback: try to get last page number from pagination links
    const pageLinks = Array.from(document.querySelectorAll('.pagination ul li a[data-page]'));
    const pageNumbers = pageLinks.map(a => parseInt(a.getAttribute('data-page'))).filter(Boolean);
    return pageNumbers.length ? Math.max(...pageNumbers) : 1;
  });
}

module.exports = {
  extractYPLinks,
  getTotalPages
}; 