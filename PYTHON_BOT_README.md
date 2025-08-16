# Lead Hunter Pro - Python Bot

A powerful Python-based web scraping bot that automatically extracts emails, phone numbers, and URLs from websites in bulk. Unlike the Chrome extension, this bot can operate at scale without manual intervention.

## Features

- **Automated Browsing**: Visit websites in bulk following search templates or a given list
- **Email Extraction**: Find company emails, Gmail addresses, and generic contact emails
- **Phone Number Extraction**: Extract phone numbers from page text
- **URL Capture**: Store which page each lead was found on
- **Multiple Export Formats**: Export results to CSV, JSON, and TXT
- **Search Integration**: Automatically perform Google/Bing searches and visit results
- **Multi-page Crawling**: Visit multiple pages per domain for comprehensive extraction
- **Duplicate Filtering**: Automatically remove duplicate leads
- **Configurable Delays**: Respectful scraping with configurable delays

## Installation

1. Install Python 3.7 or higher
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install Playwright browsers:
   ```bash
   playwright install
   ```

## Usage

### Basic Usage

```bash
# Run with a list of URLs
python lead_hunter_pro.py --urls "https://example.com" "https://httpbin.org/html"

# Run with URLs from a file
python lead_hunter_pro.py --file urls.txt

# Run with search queries
python lead_hunter_pro.py --searches "software companies in New York" "marketing agencies London"

# Run in visible mode (not headless)
python lead_hunter_pro.py --urls "https://example.com" --headless
```

### Advanced Options

```bash
# Configure crawling depth and delays
python lead_hunter_pro.py --urls "https://example.com" --max-pages 10 --delay 2

# Configure search results
python lead_hunter_pro.py --searches "law firms" --max-results 10 --max-pages 3

# Custom output filename
python lead_hunter_pro.py --urls "https://example.com" --output my_leads
```

### URL File Format

Create a text file with one URL per line:

```
https://example.com
https://company1.com
https://company2.com
https://company3.com
```

## Command Line Arguments

- `--urls`: List of URLs to scrape directly
- `--file`: File containing URLs (one per line)
- `--searches`: List of search queries to execute
- `--headless`: Run browser in headless mode (default: True)
- `--max-pages`: Maximum pages to visit per domain (default: 5)
- `--delay`: Delay between requests in seconds (default: 1)
- `--max-results`: Max search results to visit per query (default: 5)
- `--output`: Output filename (without extension, default: "leads")

## Output Files

The bot generates three output files:

1. `leads.csv` - CSV format for easy import into spreadsheets
2. `leads.json` - JSON format for programmatic use
3. `leads.txt` - Human-readable text format

### CSV Format
```csv
url,type,value,timestamp
https://example.com,email,contact@example.com,1678901234.56789
https://example.com,phone,+1-555-123-4567,1678901235.67890
```

### JSON Format
```json
[
  {
    "url": "https://example.com",
    "type": "email",
    "value": "contact@example.com",
    "timestamp": 1678901234.56789
  },
  {
    "url": "https://example.com",
    "type": "phone",
    "value": "+1-555-123-4567",
    "timestamp": 1678901235.67890
  }
]
```

### TXT Format
```
Lead Hunter Pro Results
==================================================

EMAIL: contact@example.com
Source: https://example.com
Found: Wed Mar 15 12:33:54 2023
------------------------------
PHONE: +1-555-123-4567
Source: https://example.com
Found: Wed Mar 15 12:33:55 2023
------------------------------
```

## Technical Details

### Regex Patterns

The bot uses sophisticated regex patterns for extraction:

- **Emails**: `[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+`
- **Phones**: `(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}`

### Filtering

The bot implements several filters to improve quality:

- Removes common false positives (example, test, email, etc.)
- Validates phone numbers to ensure they have sufficient digits
- Eliminates duplicate leads across all sources
- Filters internal links to only crawl same-domain pages

## Best Practices

1. **Respect robots.txt**: The bot respects website crawling policies
2. **Rate limiting**: Configurable delays prevent server overload
3. **Error handling**: Graceful handling of network errors and timeouts
4. **Memory efficient**: Processes sites one at a time to minimize memory usage

## Legal and Ethical Considerations

- Only scrape publicly available information
- Respect robots.txt and website terms of service
- Use appropriate delays to avoid overloading servers
- Comply with local and international data protection laws
- Consider reaching out to contacts through official channels

## Extending the Bot

The bot can be easily extended to:

1. Integrate with search template generators
2. Add concurrent browsing for speed improvements
3. Implement lead scoring based on email domain quality
4. Add domain filtering to skip unwanted sites
5. Include social media profile extraction
6. Add CAPTCHA solving capabilities

## Troubleshooting

### Common Issues

1. **Playwright not found**: Install with `pip install playwright` and `playwright install`
2. **Permission errors**: Run with appropriate permissions
3. **Timeout errors**: Increase delay or timeout values
4. **No results**: Check URL validity and website structure

### Logging

The bot includes comprehensive logging. Run with `-v` flag for detailed output:
```bash
python lead_hunter_pro.py --urls "https://example.com" -v
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.