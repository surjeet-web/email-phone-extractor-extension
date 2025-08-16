// Global variables
let allLeads = [];
let filteredLeads = [];

// DOM Elements
const elements = {
  refreshBtn: document.getElementById('refresh-btn'),
  exportAllBtn: document.getElementById('export-all-btn'),
  clearAllBtn: document.getElementById('clear-all-btn'),
  searchInput: document.getElementById('search-input'),
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  allTableBody: document.getElementById('all-table-body'),
  emailsTableBody: document.getElementById('emails-table-body'),
  phonesTableBody: document.getElementById('phones-table-body'),
  allEmptyState: document.getElementById('all-empty-state'),
  emailsEmptyState: document.getElementById('emails-empty-state'),
  phonesEmptyState: document.getElementById('phones-empty-state'),
  totalEmails: document.getElementById('total-emails'),
  totalPhones: document.getElementById('total-phones'),
  totalSources: document.getElementById('total-sources'),
  status: document.getElementById('status')
};

// Function to show status message
function showStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.className = isError ? 'status error' : 'status';
  
  setTimeout(() => {
    elements.status.textContent = '';
    elements.status.className = 'status';
  }, 3000);
}

// Function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

// Function to extract domain from email
function extractDomain(email) {
  if (!email) return 'N/A';
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : 'N/A';
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showStatus('Copied to clipboard!');
  }).catch(err => {
    showStatus('Failed to copy: ' + err, true);
  });
}

// Function to load data from chrome storage
function loadData() {
  chrome.storage.local.get(['extractionHistory'], function(result) {
    if (result.extractionHistory) {
      try {
        // Flatten the history into a single array of leads
        allLeads = [];
        const sources = new Set();
        
        result.extractionHistory.forEach(extraction => {
          const timestamp = extraction.timestamp || new Date().toISOString();
          const url = extraction.url || 'Unknown';
          
          sources.add(url);
          
          // Add emails
          if (extraction.emails) {
            extraction.emails.forEach(email => {
              allLeads.push({
                type: 'email',
                value: email,
                url: url,
                timestamp: timestamp
              });
            });
          }
          
          // Add phones
          if (extraction.phones) {
            extraction.phones.forEach(phone => {
              allLeads.push({
                type: 'phone',
                value: phone,
                url: url,
                timestamp: timestamp
              });
            });
          }
        });
        
        // Update stats
        const emailCount = allLeads.filter(lead => lead.type === 'email').length;
        const phoneCount = allLeads.filter(lead => lead.type === 'phone').length;
        
        elements.totalEmails.textContent = emailCount;
        elements.totalPhones.textContent = phoneCount;
        elements.totalSources.textContent = sources.size;
        
        // Initially show all leads
        filteredLeads = [...allLeads];
        renderTables();
        
        showStatus('Data loaded successfully');
      } catch (e) {
        console.error('Error parsing stored data:', e);
        showStatus('Error loading data', true);
      }
    } else {
      showStatus('No data found');
    }
  });
}

// Function to filter leads based on search input
function filterLeads() {
  const searchTerm = elements.searchInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    filteredLeads = [...allLeads];
  } else {
    filteredLeads = allLeads.filter(lead => 
      lead.value.toLowerCase().includes(searchTerm) ||
      lead.url.toLowerCase().includes(searchTerm)
    );
  }
  
  renderTables();
}

// Function to render tables
function renderTables() {
  // Render all leads table
  renderAllTable();
  
  // Render emails table
  renderEmailsTable();
  
  // Render phones table
  renderPhonesTable();
  
  // Show/hide empty states
  elements.allEmptyState.style.display = filteredLeads.length ? 'none' : 'block';
  elements.emailsEmptyState.style.display = filteredLeads.filter(l => l.type === 'email').length ? 'none' : 'block';
  elements.phonesEmptyState.style.display = filteredLeads.filter(l => l.type === 'phone').length ? 'none' : 'block';
}

// Function to render all leads table
function renderAllTable() {
  elements.allTableBody.innerHTML = '';
  
  filteredLeads.forEach(lead => {
    const row = document.createElement('tr');
    
    // Format value for display
    let displayValue = lead.value;
    if (lead.type === 'phone') {
      // Format phone number
      displayValue = lead.value.replace(/\s+/g, ' ').trim();
    }
    
    row.innerHTML = `
      <td>${lead.type.charAt(0).toUpperCase() + lead.type.slice(1)}</td>
      <td>${displayValue}</td>
      <td><a href="${lead.url}" target="_blank" title="${lead.url}">${truncateUrl(lead.url, 50)}</a></td>
      <td>${formatTimestamp(lead.timestamp)}</td>
      <td>
        <button class="btn btn-outline btn-small copy-btn" data-value="${lead.value}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C6.89543 5 6 4.10457 6 3H14C15.1046 3 16 3.89543 16 5M14 5H16C17.1046 5 18 5.89543 18 7V10M18 14V10M18 10L15 13M18 10L21 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </td>
    `;
    
    // Add event listener to copy button
    const copyBtn = row.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => copyToClipboard(lead.value));
    
    elements.allTableBody.appendChild(row);
  });
}

// Function to render emails table
function renderEmailsTable() {
  elements.emailsTableBody.innerHTML = '';
  
  const emailLeads = filteredLeads.filter(lead => lead.type === 'email');
  
  emailLeads.forEach(lead => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${lead.value}</td>
      <td>${extractDomain(lead.value)}</td>
      <td><a href="${lead.url}" target="_blank" title="${lead.url}">${truncateUrl(lead.url, 50)}</a></td>
      <td>${formatTimestamp(lead.timestamp)}</td>
      <td>
        <button class="btn btn-outline btn-small copy-btn" data-value="${lead.value}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C6.89543 5 6 4.10457 6 3H14C15.1046 3 16 3.89543 16 5M14 5H16C17.1046 5 18 5.89543 18 7V10M18 14V10M18 10L15 13M18 10L21 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </td>
    `;
    
    // Add event listener to copy button
    const copyBtn = row.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => copyToClipboard(lead.value));
    
    elements.emailsTableBody.appendChild(row);
  });
}

// Function to render phones table
function renderPhonesTable() {
  elements.phonesTableBody.innerHTML = '';
  
  const phoneLeads = filteredLeads.filter(lead => lead.type === 'phone');
  
  phoneLeads.forEach(lead => {
    const row = document.createElement('tr');
    
    // Format phone number for display
    const formattedPhone = lead.value.replace(/\s+/g, ' ').trim();
    
    row.innerHTML = `
      <td>${formattedPhone}</td>
      <td><a href="${lead.url}" target="_blank" title="${lead.url}">${truncateUrl(lead.url, 50)}</a></td>
      <td>${formatTimestamp(lead.timestamp)}</td>
      <td>
        <button class="btn btn-outline btn-small copy-btn" data-value="${lead.value}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C6.89543 5 6 4.10457 6 3H14C15.1046 3 16 3.89543 16 5M14 5H16C17.1046 5 18 5.89543 18 7V10M18 14V10M18 10L15 13M18 10L21 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </td>
    `;
    
    // Add event listener to copy button
    const copyBtn = row.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => copyToClipboard(lead.value));
    
    elements.phonesTableBody.appendChild(row);
  });
}

// Function to truncate URL for display
function truncateUrl(url, maxLength) {
  if (!url) return 'N/A';
  if (url.length <= maxLength) return url;
  
  // Try to keep the domain
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    if (domain.length + 10 >= maxLength) {
      return domain.substring(0, maxLength - 3) + '...';
    }
    
    const remainingLength = maxLength - domain.length - 5;
    const truncatedPath = path.length > remainingLength ? 
      path.substring(0, remainingLength - 3) + '...' : path;
    
    return domain + truncatedPath;
  } catch (e) {
    // If URL parsing fails, just truncate
    return url.substring(0, maxLength - 3) + '...';
  }
}

// Function to switch tabs
function switchTab(tabName) {
  // Update tab active states
  elements.tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update content visibility
  elements.tabContents.forEach(content => {
    if (content.id === tabName + '-content') {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Function to export all data as CSV
function exportAllData() {
  if (allLeads.length === 0) {
    showStatus('No data to export');
    return;
  }
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,Type,Value,Source URL,Timestamp\n";
  
  allLeads.forEach(lead => {
    // Escape commas and quotes in values
    const type = `"${lead.type}"`;
    const value = `"${lead.value.replace(/"/g, '""')}"`;
    const url = `"${lead.url.replace(/"/g, '""')}"`;
    const timestamp = `"${lead.timestamp}"`;
    
    csvContent += `${type},${value},${url},${timestamp}\n`;
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "all_leads.csv");
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  showStatus(`Exported ${allLeads.length} items to all_leads.csv`);
}

// Function to clear all data
function clearAllData() {
  if (confirm('Are you sure you want to clear all extracted data? This cannot be undone.')) {
    chrome.storage.local.remove(['extractionHistory', 'currentExtraction'], function() {
      allLeads = [];
      filteredLeads = [];
      renderTables();
      
      // Update stats
      elements.totalEmails.textContent = '0';
      elements.totalPhones.textContent = '0';
      elements.totalSources.textContent = '0';
      
      showStatus('All data cleared');
    });
  }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load data
  loadData();
  
  // Tab switching
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Button events
  elements.refreshBtn.addEventListener('click', loadData);
  elements.exportAllBtn.addEventListener('click', exportAllData);
  elements.clearAllBtn.addEventListener('click', clearAllData);
  
  // Search input
  elements.searchInput.addEventListener('input', filterLeads);
});