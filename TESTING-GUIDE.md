# Comprehensive Testing Guide

## Testing the Fixed Extension

### 1. Reload the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right corner)
3. Find "Email & Phone Extractor Pro" and click the refresh button

### 2. Test Regex Patterns
1. Open `regex-test.html` in your browser
2. Check that emails and phone numbers are correctly detected
3. Open the browser console (F12) and verify the output

### 3. Test Pagination Detection
1. Open `pagination-test.html` in your browser
2. Click the "Test Next Page Detection" button
3. Verify that the next page link is detected
4. Repeat with `pagination-test2.html`

### 4. Test the Extension
1. Open `debug-test.html` in your browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Click on the extension icon in the toolbar
5. Watch for the following log messages:
   - "DOM loaded, initializing extension..."
   - "Getting current tab URL..."
   - "Sending extractData message to tab..."
   - "Received response:"
   - "Cleaned emails:"
   - "Cleaned phones:"

### 5. Test Auto Extract
1. In the extension popup, click the "Auto Extract" button
2. Watch for scrolling behavior and data extraction
3. Check the console for progress messages

### 6. Test Next Page
1. In the extension popup, click the "Next Page" button
2. The page should navigate to debug-test2.html
3. Check the console for:
   - "Checking for next page elements..."
   - "Found visible next page element:"
   - "Clicking link with href:"

### 7. Test Auto Extract All
1. In the extension popup, enter a number in the "Target Emails" field (e.g., 10)
2. Click the "Auto Extract All" button
3. The extension should automatically navigate through pages
4. Check the console for:
   - "Starting autoExtractAll process"
   - "Current extraction progress:"
   - "Waiting for next page to load..."

## Common Issues and Solutions

### Issue: No emails/phones found
**Cause**: Regex patterns not working correctly
**Solution**: 
1. Check that the regex patterns in content.js are correct (single backslashes, not double)
2. Test with regex-test.html to verify patterns work
3. Check the console for "Raw emails found:" and "Raw phones found:" messages

### Issue: Next page not working
**Cause**: Pagination element not detected
**Solution**:
1. Test with pagination-test.html to verify detection works
2. Check the console for "Checking for next page elements..." messages
3. Look for "Found X elements for selector:" messages

### Issue: "Error communicating with page"
**Cause**: Extension doesn't have permission to access the page
**Solution**:
1. Make sure you're testing on an HTTP/HTTPS page, not a file:// page
2. Try serving the files through a local server:
   ```
   npx http-server
   ```
3. Then open http://localhost:8080/debug-test.html

## Console Logging

The extension now has extensive logging. Look for these key messages:

### Content Script Messages:
- "Received message in content script:"
- "Starting data extraction..."
- "Body text length:"
- "Raw emails found:"
- "Raw phones found:"
- "Cleaned emails:"
- "Cleaned phones:"
- "Checking for next page elements..."
- "Found X elements for selector:"
- "Found visible next page element:"

### Popup Messages:
- "DOM loaded, initializing extension..."
- "Getting current tab URL..."
- "Sending extractData message to tab:"
- "Received response:"
- "Found X new emails and Y new phones"

## Testing with a Local Server

If you're having issues with file:// URLs, use a local server:

1. Install http-server globally:
   ```
   npm install -g http-server
   ```

2. Run the server from the extension directory:
   ```
   http-server
   ```

3. Open http://localhost:8080/debug-test.html in your browser

4. Test the extension as usual