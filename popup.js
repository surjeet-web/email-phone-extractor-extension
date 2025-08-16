// Global variables to store extracted data
let allEmails = [];
let allPhones = [];
let isExtracting = false;
let currentPageUrl = '';

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
  status: document.getElementById('status')
};

// Function to show status message
function showStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.className = isError ? 'status error' : 'status';
  
  // Auto-clear status after 3 seconds
  setTimeout(() => {
    elements.status.textContent = '';
    elements.status.className = 'status';
  }, 3000);
}

// Function to update progress bar
function updateProgress(percentage) {
  elements.progress.style.width = percentage + '%';
}

// Function to switch tabs
function switchTab(tab) {
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

// Function to save data to chrome storage
function saveToStorage() {
  const data = {
    emails: allEmails,
    phones: allPhones,
    timestamp: new Date().toISOString(),
    url: currentPageUrl
  };
  
  // Save current session data
  chrome.storage.local.set({'currentExtraction': data}, function() {
    console.log('Data saved to storage');
  });
  
  // Also save to history
  chrome.storage.local.get(['extractionHistory'], function(result) {
    let history = result.extractionHistory || [];
    
    // Add current data to history
    history.push(data);
    
    // Keep only last 100 extractions
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    // Save updated history
    chrome.storage.local.set({'extractionHistory': history}, function() {
      console.log('History updated');
    });
  });
}

// Function to load data from chrome storage
function loadFromStorage() {
  chrome.storage.local.get(['currentExtraction'], function(result) {
    if (result.currentExtraction) {
      try {
        const data = result.currentExtraction;
        allEmails = data.emails || [];
        allPhones = data.phones || [];
        renderData();
        console.log('Data loaded from storage');
      } catch (e) {
        console.error('Error loading stored data:', e);
      }
    }
  });
}

// Function to render data in the UI
function renderData() {
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
      li.innerHTML = `<span class="email-value">${email}</span>`;
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
      li.innerHTML = `<span class="phone-value">${formatPhoneNumber(phone)}</span>`;
      li.addEventListener('click', () => {
        navigator.clipboard.writeText(phone);
        showStatus('Phone number copied to clipboard!');
      });
      elements.phoneList.appendChild(li);
    });
  }
}

// Function to get current tab URL
function getCurrentTabUrl(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0]) {
      currentPageUrl = tabs[0].url;
      callback(tabs[0]);
    }
  });
}

// Function to extract data from the current tab
function extractData() {
  if (isExtracting) return;
  
  isExtracting = true;
  showStatus('Extracting data...');
  
  getCurrentTabUrl(function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: "extractData"}, function(response) {
      isExtracting = false;
      
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, true);
        return;
      }
      
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
      }
    });
  });
}

// Function to auto extract data with scrolling
function autoExtract() {
  if (isExtracting) return;
  
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
        showStatus('Error: ' + chrome.runtime.lastError.message, true);
        updateProgress(0);
        return;
      }
      
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
        updateProgress(0);
      }
    });
  });
}

// Function to navigate to next page
function nextPage() {
  if (isExtracting) return;
  
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
        showStatus('Error: ' + chrome.runtime.lastError.message, true);
        return;
      }
      
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
  chrome.storage.local.remove(['currentExtraction', 'extractionHistory'], function() {
    allEmails = [];
    allPhones = [];
    renderData();
    showStatus('Stored data cleared');
  });
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Try to load data from storage first
  loadFromStorage();
  
  // Extract data from current tab after a short delay
  setTimeout(extractData, 500);
  
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
  
  // Initialize UI
  renderData();
}