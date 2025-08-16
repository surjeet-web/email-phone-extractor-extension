// Function to extract emails and phone numbers from the page
function extractData() {
  try {
    // Get all text content from the page
    const bodyText = document.body.innerText;
    
    // Regular expressions for emails and phone numbers
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    // Improved phone regex that catches various international formats
    const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})(?:\s?(?:#|x\.?|ext\.?|extension)\s*(\d+))?/gi;
    
    // Find all matches
    let emails = bodyText.match(emailRegex) || [];
    let phones = bodyText.match(phoneRegex) || [];
    
    // Clean up phone numbers (remove extra spaces, formatting, etc.)
    phones = phones.map(phone => phone.replace(/\s+/g, ' ').trim())
                   .filter(phone => phone.length >= 10) // Filter out very short matches
                   .filter(phone => !phone.includes('0123456789')) // Filter out obvious false positives
                   .filter(phone => !phone.includes('9876543210')); // Filter out obvious false positives
    
    // Remove duplicates and clean up
    emails = [...new Set(emails)];
    phones = [...new Set(phones)];
    
    // Return the data
    return {
      emails: emails,
      phones: phones
    };
  } catch (error) {
    console.error('Error in extractData:', error);
    return {
      emails: [],
      phones: []
    };
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
      for (const element of elements) {
        if (element.offsetParent !== null) { // Check if element is visible
          if (element.tagName === 'A' && element.href) {
            window.location = element.href;
            return true;
          } else {
            // For buttons, simulate a click
            element.click();
            return true;
          }
        }
      }
    }
    
    // Check for buttons with "Next" text
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      if (button.offsetParent !== null && 
          (button.textContent.trim().toLowerCase() === 'next' || 
           button.textContent.trim().toLowerCase() === 'next page')) {
        button.click();
        return true;
      }
    }
    
    // Check for links with "Next" text
    const allLinks = document.querySelectorAll('a');
    for (const link of allLinks) {
      if (link.offsetParent !== null && 
          (link.textContent.trim().toLowerCase() === 'next' || 
           link.textContent.trim().toLowerCase() === 'next page')) {
        if (link.href) {
          window.location = link.href;
          return true;
        }
      }
    }
    
    // Also check for common pagination patterns
    const paginationElements = document.querySelectorAll('.pagination, .pager, .page-nav');
    
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
          window.location = nextLink.href;
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in checkAndClickNextPage:', error);
    return false;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    const data = extractData();
    sendResponse(data);
  } else if (request.action === "autoExtract") {
    // Auto-scroll and extract
    autoScroll().then(() => {
      const data = extractData();
      sendResponse(data);
    });
    return true; // Required for async response
  } else if (request.action === "nextPage") {
    const hasNext = checkAndClickNextPage();
    sendResponse({hasNext: hasNext});
  }
});