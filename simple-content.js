// Simple content script for debugging

console.log('Simple content script loaded');

// Add a global variable to verify injection
window.extensionContentScript = true;

// Simple function to extract data
function extractSimpleData() {
    console.log('Extracting simple data...');
    
    // Simple regex patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    
    // Get text content
    const text = document.body.innerText;
    console.log('Page text length:', text.length);
    
    // Extract emails and phones
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    
    console.log('Found emails:', emails);
    console.log('Found phones:', phones);
    
    return {
        emails: [...new Set(emails)],
        phones: [...new Set(phones)],
        url: window.location.href
    };
}

// Simple function to go to next page
function goToNextPage() {
    console.log('Looking for next page...');
    
    // Look for common next page elements
    const nextLinks = document.querySelectorAll('a');
    for (const link of nextLinks) {
        const text = link.textContent.toLowerCase();
        if (text.includes('next') && link.href) {
            console.log('Found next page link:', link.href);
            window.location = link.href;
            return true;
        }
    }
    
    console.log('No next page found');
    return false;
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    
    if (request.action === "extract") {
        const data = extractSimpleData();
        sendResponse(data);
    } else if (request.action === "next") {
        const result = goToNextPage();
        sendResponse({success: result});
    }
    
    return true;
});

// Notify that we're ready
console.log('Content script ready');