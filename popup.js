// Global variables to store extracted data
let allEmails = [];
let allPhones = [];
let isExtracting = false;
let currentPageUrl = '';
let extractionTarget = 0; // Number of emails to extract
let extractionProgress = 0; // Current extraction progress

// DOM Elements
const elements = {
  emailTab: document.getElementById('emails-tab'),
  phoneTab: document.getElementById('phones-tab'),
  emailContent: document.getElementById('emails-content'),
  phoneContent: document.getElementById('phones-content'),
  emailCount: document.getElementById('email-count'),
  phoneCount: document.getElementById('phone-count'),
  emailList: document.getElementById('emails-list'),
  phoneList: document.getElementById('phones-list'),
  autoExtractBtn: document.getElementById('auto-extract'),
  nextPageBtn: document.getElementById('next-page'),
  exportEmailsBtn: document.getElementById('export-emails'),
  exportPhonesBtn: document.getElementById('export-phones'),
  exportAllBtn: document.getElementById('export-all'),
  clearStorageBtn: document.getElementById('clear-storage'),
  progress: document.getElementById('progress'),
  status: document.getElementById('status'),
  emailTarget: document.getElementById('email-target'),
  autoExtractAllBtn: document.getElementById('auto-extract-all')
};

// Function to show status message
function showStatus(message, isError = false) {
  console.log('Status message:', message, 'Is error:', isError);
  elements.status.textContent = message;
  elements.status.className = isError ? 'status error' : 'status';
  
  setTimeout(() => {
    elements.status.textContent = '';
    elements.status.className = 'status';
  }, 3000);
}

// Function to update progress bar
function updateProgress(percentage) {
  console.log('Updating progress to:', percentage);
  elements.progress.style.width = percentage + '%';
}

// Function to switch tabs
function switchTab(tab) {
  console.log('Switching to tab:', tab);
  if (tab === 'emails') {
    elements.emailTab.classList.add('active');
    elements.phoneTab.classList.remove('active');
    elements.emailContent.classList.add('active');
    elements.phoneContent.classList.remove('active');
  } else {
    elements.emailTab.classList.remove('active');
    elements.phoneTab.classList.add('active');
    elements.emailContent.classList.remove('active');
    elements.phoneContent.classList.add('active');
  }
}

// Function to format phone numbers for display
function formatPhoneNumber(phone) {
  // Remove extra spaces and clean up
  return phone.replace(/\s+/g, ' ').trim();
}

// Function to save data to localStorage
function saveToStorage() {
  try {
    const data = {
      emails: allEmails,
      phones: allPhones,
      timestamp: new Date().toISOString(),
      url: currentPageUrl
    };
    
    console.log('Saving data to localStorage:', data);
    
    // Get existing data
    let storedData = JSON.parse(localStorage.getItem('extractedData') || '{}');
    
    // Add current data
    if (!storedData[currentPageUrl]) {
      storedData[currentPageUrl] = [];
    }
    
    // Add new extraction
    storedData[currentPageUrl].push(data);
    
    // Keep only last 10 extractions per URL
    if (storedData[currentPageUrl].length > 10) {
      storedData[currentPageUrl] = storedData[currentPageUrl].slice(-10);
    }
    
    // Save to localStorage
    localStorage.setItem('extractedData', JSON.stringify(storedData));
    
    // Also save current session
    localStorage.setItem('currentExtraction', JSON.stringify(data));
    
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    showStatus('Error saving data', true);
  }
}

// Function to load data from localStorage
function loadFromStorage() {
  try {
    const stored = localStorage.getItem('currentExtraction');
    console.log('Loading data from localStorage:', stored);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        allEmails = data.emails || [];
        allPhones = data.phones || [];
        renderData();
        console.log('Data loaded successfully:', data);
        return true;
      } catch (e) {
        console.error('Error parsing stored data:', e);
        return false;
      }
    }
    console.log('No stored data found');
    return false;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return false;
  }
}

// Function to render data in the UI
function renderData() {
  try {
    console.log('Rendering data:', { emails: allEmails.length, phones: allPhones.length });
    
    // Update counts
    elements.emailCount.textContent = allEmails.length;
    elements.phoneCount.textContent = allPhones.length;
    
    // Clear existing lists
    elements.emailList.innerHTML = '';
    elements.phoneList.innerHTML = '';
    
    // Render emails
    if (allEmails.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'No emails found';
      elements.emailList.appendChild(emptyItem);
    } else {
      allEmails.forEach(email => {
        const li = document.createElement('li');
        li.textContent = email;
        li.addEventListener('click', () => {
          navigator.clipboard.writeText(email);
          showStatus('Email copied to clipboard!');
        });
        elements.emailList.appendChild(li);
      });
    }
    
    // Render phones
    if (allPhones.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'No phone numbers found';
      elements.phoneList.appendChild(emptyItem);
    } else {
      allPhones.forEach(phone => {
        const li = document.createElement('li');
        li.textContent = formatPhoneNumber(phone);
        li.addEventListener('click', () => {
          navigator.clipboard.writeText(phone);
          showStatus('Phone number copied to clipboard!');
        });
        elements.phoneList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Error rendering data:', error);
    showStatus('Error displaying data', true);
  }
}

// Function to get current tab URL
function getCurrentTabUrl(callback) {
  console.log('Getting current tab URL...');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError) {
      console.error('Error getting current tab:', chrome.runtime.lastError);
      showStatus('Error getting current tab', true);
      return;
    }
    
    if (tabs && tabs[0]) {
      currentPageUrl = tabs[0].url;
      console.log('Current tab URL:', currentPageUrl);
      callback(tabs[0]);
    } else {
      console.error('No active tab found');
      showStatus('No active tab found', true);
    }
  });
}

// Function to extract data from the current tab
function extractData() {
  console.log('Starting extractData function...');
  
  if (isExtracting) {
    console.log('Already extracting, skipping...');
    return;
  }
  
  isExtracting = true;
  showStatus('Extracting data...');
  
  getCurrentTabUrl(function(tab) {
    console.log('Sending extractData message to tab:', tab);
    
    // Check if we have permission to access the tab
    if (!tab) {
      console.error('No tab provided');
      showStatus('Error: No tab available', true);
      isExtracting = false;
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, {action: "extractData"}, function(response) {
      isExtracting = false;
      
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        showStatus('Error communicating with page', true);
        return;
      }
      
      console.log('Received response:', response);
      
      if (response) {
        // Merge with existing data to avoid duplicates
        const newEmails = response.emails.filter(email => !allEmails.includes(email));
        const newPhones = response.phones.filter(phone => !allPhones.includes(phone));
        
        allEmails = [...allEmails, ...newEmails];
        allPhones = [...allPhones, ...newPhones];
        
        renderData();
        saveToStorage();
        showStatus(`Found ${newEmails.length} new emails and ${newPhones.length} new phones`);
      } else {
        showStatus('Failed to extract data', true);
        console.error('Failed to extract data, no response received');
      }
    });
  });
}

// Function to auto extract data with scrolling
function autoExtract() {
  console.log('Starting autoExtract function...');
  
  if (isExtracting) {
    console.log('Already extracting, skipping...');
    return;
  }
  
  isExtracting = true;
  elements.autoExtractBtn.disabled = true;
  elements.autoExtractBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16L12 8M12 8L8 12M12 8L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H17.5C18.163 17 18.7989 17.2634 19.2678 17.7322C19.7366 18.2011 20 18.837 20 19.5V19.5C20 20.163 19.7366 20.7989 19.2678 21.2678C18.7989 21.7366 18.163 22 17.5 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V19.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Extracting...
  `;
  
  updateProgress(0);
  showStatus('Scrolling through page...');
  
  getCurrentTabUrl(function(tab) {
    console.log('Sending autoExtract message to tab:', tab);
    
    chrome.tabs.sendMessage(tab.id, {action: "autoExtract"}, function(response) {
      isExtracting = false;
      elements.autoExtractBtn.disabled = false;
      elements.autoExtractBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16L12 8M12 8L8 12M12 8L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H17.5C18.163 17 18.7989 17.2634 19.2678 17.7322C19.7366 18.2011 20 18.837 20 19.5V19.5C20 20.163 19.7366 20.7989 19.2678 21.2678C18.7989 21.7366 18.163 22 17.5 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V19.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Auto Extract
      `;
      
      if (chrome.runtime.lastError) {
        console.error('Error sending autoExtract message:', chrome.runtime.lastError);
        showStatus('Error communicating with page', true);
        updateProgress(0);
        return;
      }
      
      console.log('Received autoExtract response:', response);
      
      if (response) {
        // Merge with existing data to avoid duplicates
        const newEmails = response.emails.filter(email => !allEmails.includes(email));
        const newPhones = response.phones.filter(phone => !allPhones.includes(phone));
        
        allEmails = [...allEmails, ...newEmails];
        allPhones = [...allPhones, ...newPhones];
        
        renderData();
        saveToStorage();
        showStatus(`Found ${newEmails.length} new emails and ${newPhones.length} new phones`);
        updateProgress(100);
      } else {
        showStatus('Failed to extract data', true);
        console.error('Failed to extract data, no response received');
        updateProgress(0);
      }
    });
  });
}

// Function to navigate to next page
function nextPage() {
  console.log('Starting nextPage function...');
  
  if (isExtracting) {
    console.log('Already extracting, skipping...');
    return;
  }
  
  isExtracting = true;
  elements.nextPageBtn.disabled = true;
  elements.nextPageBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 7L18 12M18 12L13 17M18 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Loading...
  `;
  
  showStatus('Checking for next page...');
  
  getCurrentTabUrl(function(tab) {
    console.log('Sending nextPage message to tab:', tab);
    
    chrome.tabs.sendMessage(tab.id, {action: "nextPage"}, function(response) {
      isExtracting = false;
      elements.nextPageBtn.disabled = false;
      elements.nextPageBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 7L18 12M18 12L13 17M18 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Next Page
      `;
      
      if (chrome.runtime.lastError) {
        console.error('Error sending nextPage message:', chrome.runtime.lastError);
        showStatus('Error communicating with page', true);
        return;
      }
      
      console.log('Received nextPage response:', response);
      
      if (response && response.hasNext) {
        showStatus('Navigating to next page...');
        // Wait a bit for page to load
        setTimeout(() => {
          // Re-extract data from new page
          extractData();
        }, 3000);
      } else {
        showStatus('No next page found or already on last page');
      }
    });
  });
}

// Function to auto extract all data across multiple pages
function autoExtractAll() {
  console.log('Starting autoExtractAll function...');
  
  if (isExtracting) {
    console.log('Already extracting, skipping...');
    return;
  }
  
  // Get the target number of emails
  extractionTarget = parseInt(elements.emailTarget.value) || 100;
  extractionProgress = 0;
  
  isExtracting = true;
  elements.autoExtractAllBtn.disabled = true;
  elements.autoExtractAllBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16L12 8M12 8L8 12M12 8L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H17.5C18.163 17 18.7989 17.2634 19.2678 17.7322C19.7366 18.2011 20 18.837 20 19.5V19.5C20 20.163 19.7366 20.7989 19.2678 21.2678C18.7989 21.7366 18.163 22 17.5 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V19.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Extracting... 0/${extractionTarget}
  `;
  
  updateProgress(0);
  showStatus(`Auto extracting up to ${extractionTarget} emails...`);
  
  getCurrentTabUrl(function(tab) {
    console.log('Sending autoExtractAll message to tab:', tab);
    
    chrome.tabs.sendMessage(tab.id, {action: "autoExtractAll"}, function(response) {
      isExtracting = false;
      elements.autoExtractAllBtn.disabled = false;
      elements.autoExtractAllBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16L12 8M12 8L8 12M12 8L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H17.5C18.163 17 18.7989 17.2634 19.2678 17.7322C19.7366 18.2011 20 18.837 20 19.5V19.5C20 20.163 19.7366 20.7989 19.2678 21.2678C18.7989 21.7366 18.163 22 17.5 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V19.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Auto Extract All
      `;
      
      if (chrome.runtime.lastError) {
        console.error('Error sending autoExtractAll message:', chrome.runtime.lastError);
        showStatus('Error communicating with page', true);
        updateProgress(0);
        return;
      }
      
      console.log('Received autoExtractAll response:', response);
      
      if (response) {
        // Merge with existing data to avoid duplicates
        const newEmails = response.emails.filter(email => !allEmails.includes(email));
        const newPhones = response.phones.filter(phone => !allPhones.includes(phone));
        
        allEmails = [...allEmails, ...newEmails];
        allPhones = [...allPhones, ...newPhones];
        
        renderData();
        saveToStorage();
        showStatus(`Found ${newEmails.length} new emails and ${newPhones.length} new phones from ${response.urls ? response.urls.length : 0} pages`);
        updateProgress(100);
      } else {
        showStatus('Failed to extract data', true);
        console.error('Failed to extract data, no response received');
        updateProgress(0);
      }
    });
  });
}

// Function to export data as CSV
function exportData(data, filename) {
  if (!data || data.length === 0) {
    showStatus('No data to export');
    return;
  }
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  if (filename.includes('emails')) {
    csvContent += "Email\n";
    data.forEach(email => {
      csvContent += email + "\n";
    });
  } else {
    csvContent += "Phone Number\n";
    data.forEach(phone => {
      csvContent += formatPhoneNumber(phone) + "\n";
    });
  }
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  showStatus(`Exported ${data.length} items to ${filename}`);
}

// Function to export all data
function exportAll() {
  if (allEmails.length === 0 && allPhones.length === 0) {
    showStatus('No data to export');
    return;
  }
  
  // Combine emails and phones into one CSV
  let csvContent = "data:text/csv;charset=utf-8,Type,Value\n";
  
  allEmails.forEach(email => {
    csvContent += "Email," + email + "\n";
  });
  
  allPhones.forEach(phone => {
    csvContent += "Phone," + formatPhoneNumber(phone) + "\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "extracted_data.csv");
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  showStatus(`Exported ${allEmails.length + allPhones.length} items to extracted_data.csv`);
}

// Function to clear stored data
function clearStorage() {
  try {
    localStorage.removeItem('extractedData');
    localStorage.removeItem('currentExtraction');
    allEmails = [];
    allPhones = [];
    renderData();
    showStatus('Stored data cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
    showStatus('Error clearing data', true);
  }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing extension...');
  
  // Try to load data from storage first
  if (!loadFromStorage()) {
    // If no stored data, extract data from current tab
    extractData();
  }
  
  // Tab switching
  elements.emailTab.addEventListener('click', () => switchTab('emails'));
  elements.phoneTab.addEventListener('click', () => switchTab('phones'));
  
  // Action buttons
  elements.autoExtractBtn.addEventListener('click', autoExtract);
  elements.nextPageBtn.addEventListener('click', nextPage);
  elements.exportEmailsBtn.addEventListener('click', () => exportData(allEmails, 'emails.csv'));
  elements.exportPhonesBtn.addEventListener('click', () => exportData(allPhones, 'phones.csv'));
  elements.exportAllBtn.addEventListener('click', exportAll);
  elements.clearStorageBtn.addEventListener('click', clearStorage);
  elements.autoExtractAllBtn.addEventListener('click', autoExtractAll);
  
  // Initialize UI
  renderData();
  
  console.log('Extension initialized');
});