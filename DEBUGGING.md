# Debugging Guide for Email & Phone Extractor Pro

## Steps to Test the Extension

1. **Reload the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right corner)
   - Find "Email & Phone Extractor Pro" and click the refresh button

2. **Open Test Page**
   - Open `debug-test.html` in your browser
   - Press F12 to open Developer Tools
   - Go to the Console tab

3. **Test Basic Extraction**
   - Click on the extension icon in the toolbar
   - Check the console for messages like:
     - "DOM loaded, initializing extension..."
     - "Getting current tab URL..."
     - "Sending extractData message to tab..."
     - "Received response:"

4. **Test Auto Extract**
   - In the extension popup, click the "Auto Extract" button
   - Watch for scrolling behavior and data extraction

5. **Test Next Page**
   - In the extension popup, click the "Next Page" button
   - The page should navigate to debug-test2.html

6. **Test Auto Extract All**
   - In the extension popup, enter a number in the "Target Emails" field (e.g., 10)
   - Click the "Auto Extract All" button
   - The extension should automatically navigate through pages

## Common Issues and Solutions

### Issue: "Error communicating with page"
- **Cause**: Extension doesn't have permission to access the page
- **Solution**: Make sure you're testing on an HTTP/HTTPS page, not a file:// page
  - Try serving the files through a local server:
    ```
    npx http-server
    ```
  - Then open http://localhost:8080/debug-test.html

### Issue: No emails/phones found
- **Cause**: Content script not injected or regex not matching
- **Solution**: Check the console for:
  - "Body text length:" - Should show a large number
  - "Raw emails found:" - Should show count > 0
  - "Cleaned emails:" - Should show actual email addresses

### Issue: Next page not working
- **Cause**: Pagination element not detected
- **Solution**: Check the console for:
  - "Checking for next page elements..."
  - "Found X elements for selector: ..."
  - "Found and clicking Next button/link: ..."

## Console Logging

The extension now has extensive logging. Look for these key messages:

1. **Content Script Messages**:
   - "Received message in content script:"
   - "Starting data extraction..."
   - "Checking for next page elements..."

2. **Popup Messages**:
   - "DOM loaded, initializing extension..."
   - "Sending extractData message to tab:"
   - "Received response:"

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