// Function to extract emails and phone numbers from the page
function extractData() {
  try {
    console.log('Starting data extraction...');
    
    // Get all text content from the page
    const bodyText = document.body.innerText;
    console.log('Body text length:', bodyText.length);
    
    // Regular expressions for emails and phone numbers
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    // Improved phone regex that catches various international formats
    const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})(?:\s?(?:#|x\.?|ext\.?|extension)\s*(\d+))?/gi;
    
    // Find all matches
    let emails = bodyText.match(emailRegex) || [];
    let phones = bodyText.match(phoneRegex) || [];
    
    console.log('Raw emails found:', emails.length);
    console.log('Raw phones found:', phones.length);
    
    // Clean up phone numbers (remove extra spaces, formatting, etc.)
    phones = phones.map(phone => phone.replace(/\s+/g, ' ').trim())
                   .filter(phone => phone.length >= 10) // Filter out very short matches
                   .filter(phone => !phone.includes('0123456789')) // Filter out obvious false positives
                   .filter(phone => !phone.includes('9876543210')); // Filter out obvious false positives
    
    // Remove duplicates and clean up
    emails = [...new Set(emails)];
    phones = [...new Set(phones)];
    
    console.log('Cleaned emails:', emails);
    console.log('Cleaned phones:', phones);
    
    // Return the data
    return {
      emails: emails,
      phones: phones,
      url: window.location.href
    };
  } catch (error) {
    console.error('Error in extractData:', error);
    return { emails: [], phones: [], url: window.location.href };
  }
}

// Function to scroll through the entire page to load all content
function autoScroll() {
  return new Promise((resolve) => {
    let totalHeight = 0;
    const distance = 100;
    const timer = setInterval(() => {
      const scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;

      if(totalHeight >= scrollHeight){
        clearInterval(timer);
        // Wait a bit for any lazy-loaded content to appear
        setTimeout(resolve, 1500);
      }
    }, 100);
  });
}

// Function to check if there's pagination and click next button
function checkAndClickNextPage() {
  try {
    console.log('Checking for next page elements...');
    
    // Common selectors for next page buttons
    const nextSelectors = [
      'a[rel="next"]',
      '.next:not(.prev)',
      '.pagination .next:not(.prev)',
      '.pager-next a',
      'button[aria-label="Next"]',
      '.fa-arrow-right',
      '.icon-arrow-right',
      '.pagination-next',
      '.page-next',
      'a[href*="page"]:not([href*="prev"]):not([href*="previous"])',
      'a[href*="next"]',
      '.pagination a:not(.prev):not(.previous)'
    ];
    
    // Check for elements with specific selectors
    for (const selector of nextSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements for selector: ${selector}`);
      
      for (const element of elements) {
        if (element.offsetParent !== null) { // Check if element is visible
          console.log('Found visible next page element:', element);
          
          if (element.tagName === 'A' && element.href) {
            console.log('Clicking link with href:', element.href);
            window.location = element.href;
            return true;
          } else {
            // For buttons, simulate a click
            console.log('Clicking button element:', element);
            element.click();
            return true;
          }
        }
      }
    }
    
    // Check for buttons with "Next" text
    const allButtons = document.querySelectorAll('button');
    console.log(`Checking ${allButtons.length} buttons for "Next" text`);
    for (const button of allButtons) {
      if (button.offsetParent !== null && 
          (button.textContent.trim().toLowerCase() === 'next' || 
           button.textContent.trim().toLowerCase() === 'next page')) {
        console.log('Found and clicking Next button:', button);
        button.click();
        return true;
      }
    }
    
    // Check for links with "Next" text
    const allLinks = document.querySelectorAll('a');
    console.log(`Checking ${allLinks.length} links for "Next" text`);
    for (const link of allLinks) {
      if (link.offsetParent !== null && 
          (link.textContent.trim().toLowerCase() === 'next' || 
           link.textContent.trim().toLowerCase() === 'next page')) {
        if (link.href) {
          console.log('Found and navigating to Next link:', link.href);
          window.location = link.href;
          return true;
        }
      }
    }
    
    // Also check for common pagination patterns
    const paginationElements = document.querySelectorAll('.pagination, .pager, .page-nav');
    console.log(`Found ${paginationElements.length} pagination elements`);
    
    // If we have pagination elements but no next button found, try to find the next page link
    if (paginationElements.length > 0) {
      const links = paginationElements[0].querySelectorAll('a');
      let currentPageIndex = -1;
      
      // Find current page
      for (let i = 0; i < links.length; i++) {
        if (links[i].classList.contains('current') || 
            links[i].classList.contains('active') ||
            links[i].style.backgroundColor || 
            links[i].style.fontWeight === 'bold') {
          currentPageIndex = i;
          break;
        }
      }
      
      // If we found current page, try to click the next one
      if (currentPageIndex !== -1 && currentPageIndex < links.length - 1) {
        const nextLink = links[currentPageIndex + 1];
        if (nextLink.href) {
          console.log('Found and navigating to next page link:', nextLink.href);
          window.location = nextLink.href;
          return true;
        }
      }
    }
    
    console.log('No next page element found');
    return false;
  } catch (error) {
    console.error('Error in checkAndClickNextPage:', error);
    return false;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message in content script:', request);
  
  if (request.action === "extractData") {
    try {
      const data = extractData();
      console.log('Sending extracted data:', data);
      sendResponse(data);
    } catch (error) {
      console.error('Error in extractData action:', error);
      sendResponse({ emails: [], phones: [], url: window.location.href });
    }
  } else if (request.action === "autoExtract") {
    // Auto-scroll and extract
    autoScroll().then(() => {
      try {
        const data = extractData();
        console.log('Sending auto-extracted data:', data);
        sendResponse(data);
      } catch (error) {
        console.error('Error in autoExtract action:', error);
        sendResponse({ emails: [], phones: [], url: window.location.href });
      }
    });
    return true; // Required for async response
  } else if (request.action === "nextPage") {
    try {
      const hasNext = checkAndClickNextPage();
      console.log('Next page result:', hasNext);
      sendResponse({ hasNext: hasNext });
    } catch (error) {
      console.error('Error in nextPage action:', error);
      sendResponse({ hasNext: false });
    }
  } else if (request.action === "autoExtractAll") {
    // Extract data and continue to next page until no more pages
    const allData = { emails: [], phones: [], urls: [] };
    
    function extractAndContinue() {
      try {
        const data = extractData();
        allData.emails = [...allData.emails, ...data.emails];
        allData.phones = [...allData.phones, ...data.phones];
        allData.urls.push(data.url);
        
        // Remove duplicates
        allData.emails = [...new Set(allData.emails)];
        allData.phones = [...new Set(allData.phones)];
        
        console.log('Current extraction progress:', allData);
        
        // Try to go to next page
        if (checkAndClickNextPage()) {
          // Wait for page to load, then continue
          console.log('Waiting for next page to load...');
          setTimeout(() => {
            extractAndContinue();
          }, 3000);
        } else {
          // No more pages, send response
          console.log('No more pages, sending final data:', allData);
          sendResponse(allData);
        }
      } catch (error) {
        console.error('Error in extractAndContinue:', error);
        sendResponse(allData);
      }
    }
    
    // Start the extraction process
    console.log('Starting autoExtractAll process');
    extractAndContinue();
    return true; // Required for async response
  }
});