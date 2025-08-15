let allEmails = [];
let allPhones = [];
let targetEmails = 5;

console.log('Simple popup loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    document.getElementById('extract').addEventListener('click', extractData);
    document.getElementById('next').addEventListener('click', nextPage);
    document.getElementById('extractAll').addEventListener('click', extractAll);
    document.getElementById('emailTarget').addEventListener('change', updateTarget);
    
    updateTarget();
});

function updateTarget() {
    targetEmails = parseInt(document.getElementById('emailTarget').value) || 5;
    document.getElementById('target').textContent = targetEmails;
}

function showStatus(message) {
    console.log('Status:', message);
    document.getElementById('status').textContent = message;
}

function renderResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h3>Results</h3>
        <p>Emails: ${allEmails.length}</p>
        <div class="emails">
            ${allEmails.map(email => `<div class="email">${email}</div>`).join('')}
        </div>
        <p>Phones: ${allPhones.length}</p>
        <div class="phones">
            ${allPhones.map(phone => `<div class="phone">${phone}</div>`).join('')}
        </div>
    `;
}

function extractData() {
    console.log('Extracting data...');
    showStatus('Extracting data...');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
            console.error('Error getting tab:', chrome.runtime.lastError);
            showStatus('Error getting tab');
            return;
        }
        
        const tab = tabs[0];
        console.log('Sending extract message to tab:', tab);
        
        chrome.tabs.sendMessage(tab.id, {action: "extract"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                showStatus('Error communicating with page');
                return;
            }
            
            console.log('Received response:', response);
            
            if (response) {
                // Add new data
                response.emails.forEach(email => {
                    if (!allEmails.includes(email)) {
                        allEmails.push(email);
                    }
                });
                
                response.phones.forEach(phone => {
                    if (!allPhones.includes(phone)) {
                        allPhones.push(phone);
                    }
                });
                
                renderResults();
                showStatus(`Found ${response.emails.length} emails and ${response.phones.length} phones`);
            } else {
                showStatus('No response from page');
            }
        });
    });
}

function nextPage() {
    console.log('Going to next page...');
    showStatus('Going to next page...');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
            console.error('Error getting tab:', chrome.runtime.lastError);
            showStatus('Error getting tab');
            return;
        }
        
        const tab = tabs[0];
        console.log('Sending next message to tab:', tab);
        
        chrome.tabs.sendMessage(tab.id, {action: "next"}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                showStatus('Error communicating with page');
                return;
            }
            
            console.log('Received response:', response);
            
            if (response && response.success) {
                showStatus('Navigating to next page...');
                // Reset data for new page
                allEmails = [];
                allPhones = [];
                renderResults();
            } else {
                showStatus('No next page found');
            }
        });
    });
}

function extractAll() {
    console.log('Extracting all data...');
    showStatus(`Extracting up to ${targetEmails} emails...`);
    
    function extractAndContinue() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                console.error('Error getting tab:', chrome.runtime.lastError);
                showStatus('Error getting tab');
                return;
            }
            
            const tab = tabs[0];
            
            chrome.tabs.sendMessage(tab.id, {action: "extract"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    showStatus('Error communicating with page');
                    return;
                }
                
                if (response) {
                    // Add new data
                    response.emails.forEach(email => {
                        if (!allEmails.includes(email)) {
                            allEmails.push(email);
                        }
                    });
                    
                    response.phones.forEach(phone => {
                        if (!allPhones.includes(phone)) {
                            allPhones.push(phone);
                        }
                    });
                    
                    renderResults();
                    showStatus(`Total: ${allEmails.length} emails and ${allPhones.length} phones`);
                    
                    // Check if we've reached our target
                    if (allEmails.length < targetEmails) {
                        // Try to go to next page
                        chrome.tabs.sendMessage(tab.id, {action: "next"}, function(nextResponse) {
                            if (nextResponse && nextResponse.success) {
                                showStatus(`Found ${allEmails.length} emails, going to next page...`);
                                // Wait a bit for page to load, then continue
                                setTimeout(extractAndContinue, 2000);
                            } else {
                                showStatus(`Finished. Found ${allEmails.length} emails.`);
                            }
                        });
                    } else {
                        showStatus(`Target reached! Found ${allEmails.length} emails.`);
                    }
                } else {
                    showStatus('No response from page');
                }
            });
        });
    }
    
    extractAndContinue();
}