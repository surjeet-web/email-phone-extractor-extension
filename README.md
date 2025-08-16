# Email & Phone Extractor Pro

A powerful Chrome extension that extracts email addresses and phone numbers from any webpage with advanced features including auto-scrolling, pagination support, local storage, and one-click export.

**Note: This repository also includes a Python-based bot version (Lead Hunter Pro) for large-scale automated extraction. See the Python Bot section below.**

## Features

- **Advanced Extraction**: Finds emails and phone numbers with improved accuracy
- **Auto-Scrolling**: Automatically scrolls through long pages to capture all content
- **Pagination Support**: Navigates through multi-page websites
- **Local Storage**: Saves extracted data locally for persistence
- **Modern UI**: Clean, tab-based interface inspired by Aceternity UI
- **One-Click Export**: Export emails, phones, or all data as CSV files
- **Copy to Clipboard**: Click any item to copy it to your clipboard
- **Real-time Stats**: See how many items were found
- **Visual Feedback**: Progress indicators and status messages
- **Auto Extract All**: Automatically extract data from all pages until reaching your target number of emails

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder

## Usage

1. Navigate to any webpage with contact information
2. Click on the extension icon in the toolbar
3. The extension will automatically scan the visible page
4. Use the tabs to switch between emails and phone numbers
5. Use the action buttons for advanced features:
   - **Auto Extract**: Scroll through the entire page and extract all data
   - **Next Page**: Navigate to the next page if pagination is detected
   - **Auto Extract All**: Automatically extract data from all pages until reaching your target number of emails
   - **Export Buttons**: Export emails, phones, or all data as CSV files
   - **Clear Storage**: Clear locally stored extraction data

## How It Works

- Uses regular expressions to identify email addresses and phone numbers
- Auto-scrolling simulates user behavior to load all content
- Pagination detection looks for common "next page" elements
- Data is stored locally using Chrome's storage API
- CSV export for easy data transfer to other applications
- Auto Extract All feature continues through pages until target is reached

## Development

### Prerequisites

- Node.js (v12 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/surjeet-web/email-phone-extractor-extension.git
   cd email-phone-extractor-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

### Project Structure

```
email-phone-extractor-extension/
├── manifest.json          # Extension configuration
├── content.js            # Content script for data extraction
├── popup.html            # Popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── generate-icons.js     # Icon generation script
├── images/               # Generated icons
├── node_modules/         # Dependencies (gitignored)
└── package.json          # Project metadata and scripts
```

### Available Scripts

- `npm run build`: Generate icons and build the extension
- `npm run generate-icons`: Generate extension icons
- `npm test`: Run tests (placeholder)

### Customization

You can customize this extension by:
1. Modifying the regular expressions in `content.js` for different formats
2. Updating the UI in `popup.html` and `popup.css`
3. Adding more pagination selectors
4. Customizing the auto-scroll behavior
5. Adjusting the target email count for the Auto Extract All feature

## Python Bot Version (Lead Hunter Pro)

For large-scale automated extraction, we've also included a Python-based bot that can:

- Automatically browse websites in bulk
- Extract emails and phone numbers at scale
- Perform Google/Bing searches automatically
- Export results in CSV, JSON, and TXT formats
- Run without manual intervention

### Python Bot Features

- **Automated Browsing**: Go to websites in bulk (following search templates or a given list)
- **Email Extraction**: Including Gmail, company emails, and generic contact emails
- **Phone Number Extraction**: From page text
- **URL Capture**: Store which page each lead was found on
- **Export in Multiple Formats**: CSV, JSON, and TXT

### Setting Up the Python Bot

1. Install Python 3.7 or higher
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install Playwright browsers:
   ```bash
   playwright install
   ```

### Running the Python Bot

```bash
# Run with a list of URLs
python lead_hunter_pro.py --urls "https://example.com" "https://httpbin.org/html"

# Run with URLs from a file
python lead_hunter_pro.py --file example_urls.txt

# Run with search queries
python lead_hunter_pro.py --searches "software companies in New York" "marketing agencies London"

# See all options
python lead_hunter_pro.py --help
```

### Python Bot Files

- `lead_hunter_pro.py` - Main bot script
- `requirements.txt` - Python dependencies
- `example_urls.txt` - Example URLs file
- `PYTHON_BOT_README.md` - Detailed documentation for the Python bot
- `setup_bot.py` - Setup script for easy installation
- `run_bot.bat` - Windows batch file for easy execution
- `test_bot.py` - Test suite for the bot

## Testing

The repository includes several test files:
- `simple-test.html` and `simple-test2.html`: Basic test pages
- `debug-test.html` and `debug-test2.html`: Debug test pages with more content
- `comprehensive-test.html`, `test2.html`, `test3.html`: Multi-page test suite
- `regex-test.html`: Regex pattern testing
- `pagination-test.html`: Pagination detection testing

## Limitations

- Phone number detection works best with common international formats
- Pagination detection works best with standard HTML patterns
- Some dynamically loaded content might not be captured immediately

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.