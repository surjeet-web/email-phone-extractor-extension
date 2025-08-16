import re
import pandas as pd
import json
import time
import argparse
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Set
import logging

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Playwright not available. Install with: pip install playwright")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Regex patterns for email and phone extraction
EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
PHONE_REGEX = r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}"

class LeadHunterPro:
    def __init__(self, headless=True, max_pages=5, delay=1):
        """
        Initialize the Lead Hunter Pro bot.
        
        Args:
            headless (bool): Whether to run browser in headless mode
            max_pages (int): Maximum number of pages to visit per domain
            delay (int): Delay between page visits in seconds
        """
        self.headless = headless
        self.max_pages = max_pages
        self.delay = delay
        self.leads = []
        self.visited_urls = set()
        
    def extract_contacts(self, page_source: str, url: str) -> None:
        """
        Extract emails and phone numbers from page source.
        
        Args:
            page_source (str): HTML content of the page
            url (str): URL where the content was found
        """
        # Extract emails
        emails = re.findall(EMAIL_REGEX, page_source)
        # Filter out common false positives
        filtered_emails = [email for email in emails if not any(
            false_positive in email.lower() for false_positive in [
                'example', 'test', 'email', 'domain', 'placeholder'
            ]
        )]
        
        # Extract phone numbers
        phones = re.findall(PHONE_REGEX, page_source)
        # Filter phones to ensure they have enough digits
        filtered_phones = [phone.strip() for phone in phones if re.search(r'\d{7,}', phone)]
        
        # Add unique emails to leads
        for email in set(filtered_emails):
            if email not in [lead['value'] for lead in self.leads if lead['type'] == 'email']:
                self.leads.append({
                    "url": url,
                    "type": "email",
                    "value": email,
                    "timestamp": time.time()
                })
                logger.info(f"Found email: {email} on {url}")
        
        # Add unique phones to leads
        for phone in set(filtered_phones):
            if phone not in [lead['value'] for lead in self.leads if lead['type'] == 'phone']:
                self.leads.append({
                    "url": url,
                    "type": "phone",
                    "value": phone,
                    "timestamp": time.time()
                })
                logger.info(f"Found phone: {phone} on {url}")
    
    def is_valid_url(self, url: str) -> bool:
        """
        Check if URL is valid and not already visited.
        
        Args:
            url (str): URL to check
            
        Returns:
            bool: True if URL is valid and not visited
        """
        try:
            parsed = urlparse(url)
            return bool(parsed.netloc) and url not in self.visited_urls
        except:
            return False
    
    def extract_links(self, page, base_url: str) -> List[str]:
        """
        Extract internal links from the page.
        
        Args:
            page: Playwright page object
            base_url (str): Base URL for resolving relative links
            
        Returns:
            List[str]: List of valid internal links
        """
        links = []
        try:
            # Extract all links
            link_elements = page.query_selector_all("a[href]")
            for element in link_elements:
                href = element.get_attribute("href")
                if href:
                    # Resolve relative URLs
                    absolute_url = urljoin(base_url, href)
                    # Check if it's an internal link (same domain)
                    if urlparse(absolute_url).netloc == urlparse(base_url).netloc:
                        links.append(absolute_url)
        except Exception as e:
            logger.warning(f"Error extracting links: {e}")
        
        return list(set(links))  # Remove duplicates
    
    def visit_url(self, page, url: str) -> None:
        """
        Visit a URL and extract contacts.
        
        Args:
            page: Playwright page object
            url (str): URL to visit
        """
        if not self.is_valid_url(url):
            return
            
        try:
            logger.info(f"Visiting: {url}")
            page.goto(url, timeout=30000)
            self.visited_urls.add(url)
            
            # Wait for page to load
            page.wait_for_timeout(2000)
            
            # Extract contacts from current page
            content = page.content()
            self.extract_contacts(content, url)
            
            # Add a delay before next action
            time.sleep(self.delay)
            
        except Exception as e:
            logger.error(f"Error visiting {url}: {e}")
    
    def crawl_site(self, browser, base_url: str) -> None:
        """
        Crawl a website and extract contacts from multiple pages.
        
        Args:
            browser: Playwright browser object
            base_url (str): Base URL to start crawling from
        """
        try:
            context = browser.new_context()
            page = context.new_page()
            
            # Visit the base URL
            self.visit_url(page, base_url)
            
            # Extract internal links for crawling
            if self.max_pages > 1:
                links = self.extract_links(page, base_url)
                # Visit up to max_pages - 1 additional pages
                for link in links[:self.max_pages - 1]:
                    if len(self.visited_urls) >= self.max_pages:
                        break
                    self.visit_url(page, link)
            
            context.close()
            
        except Exception as e:
            logger.error(f"Error crawling site {base_url}: {e}")
    
    def search_and_crawl(self, browser, query: str, max_results: int = 5) -> None:
        """
        Perform a search and crawl the results.
        
        Args:
            browser: Playwright browser object
            query (str): Search query
            max_results (int): Maximum number of search results to visit
        """
        try:
            context = browser.new_context()
            page = context.new_page()
            
            # Perform Google search
            search_url = f"https://www.google.com/search?q={query}"
            logger.info(f"Searching for: {query}")
            page.goto(search_url, timeout=30000)
            
            # Wait for results
            page.wait_for_timeout(2000)
            
            # Extract result links
            search_results = page.query_selector_all("h3 a")
            urls = []
            for result in search_results:
                href = result.get_attribute("href")
                if href and href.startswith("http"):
                    urls.append(href)
                    if len(urls) >= max_results:
                        break
            
            # Crawl each result
            for url in urls:
                self.crawl_site(browser, url)
                time.sleep(self.delay * 2)  # Extra delay between sites
            
            context.close()
            
        except Exception as e:
            logger.error(f"Error performing search '{query}': {e}")
    
    def run_with_urls(self, urls: List[str]) -> None:
        """
        Run the bot with a list of URLs.
        
        Args:
            urls (List[str]): List of URLs to visit
        """
        if not PLAYWRIGHT_AVAILABLE:
            logger.error("Playwright is not available. Please install it with: pip install playwright")
            return
            
        logger.info(f"Starting Lead Hunter Pro with {len(urls)} URLs")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            
            for url in urls:
                self.crawl_site(browser, url)
                time.sleep(self.delay * 2)  # Extra delay between sites
            
            browser.close()
        
        logger.info(f"Extraction complete. Found {len(self.leads)} leads.")
    
    def run_with_searches(self, queries: List[str], max_results: int = 5) -> None:
        """
        Run the bot with search queries.
        
        Args:
            queries (List[str]): List of search queries
            max_results (int): Maximum results per query
        """
        if not PLAYWRIGHT_AVAILABLE:
            logger.error("Playwright is not available. Please install it with: pip install playwright")
            return
            
        logger.info(f"Starting Lead Hunter Pro with {len(queries)} search queries")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            
            for query in queries:
                self.search_and_crawl(browser, query, max_results)
                time.sleep(self.delay * 3)  # Extra delay between searches
            
            browser.close()
        
        logger.info(f"Extraction complete. Found {len(self.leads)} leads.")
    
    def export_results(self, filename: str = "leads") -> None:
        """
        Export results in multiple formats.
        
        Args:
            filename (str): Base filename for exports (without extension)
        """
        if not self.leads:
            logger.warning("No leads to export")
            return
        
        # Convert to DataFrame
        df = pd.DataFrame(self.leads)
        
        # Export to CSV
        csv_filename = f"{filename}.csv"
        df.to_csv(csv_filename, index=False)
        logger.info(f"Exported to {csv_filename}")
        
        # Export to JSON
        json_filename = f"{filename}.json"
        df.to_json(json_filename, orient="records", indent=2)
        logger.info(f"Exported to {json_filename}")
        
        # Export to TXT
        txt_filename = f"{filename}.txt"
        with open(txt_filename, "w", encoding="utf-8") as f:
            f.write("Lead Hunter Pro Results\n")
            f.write("=" * 50 + "\n\n")
            for lead in self.leads:
                f.write(f"{lead['type'].upper()}: {lead['value']}\n")
                f.write(f"Source: {lead['url']}\n")
                f.write(f"Found: {time.ctime(lead['timestamp'])}\n")
                f.write("-" * 30 + "\n")
        logger.info(f"Exported to {txt_filename}")
        
        # Print summary
        email_count = len([lead for lead in self.leads if lead['type'] == 'email'])
        phone_count = len([lead for lead in self.leads if lead['type'] == 'phone'])
        logger.info(f"Summary: {email_count} emails, {phone_count} phone numbers")

def load_urls_from_file(filename: str) -> List[str]:
    """
    Load URLs from a text file (one URL per line).
    
    Args:
        filename (str): Path to the file containing URLs
        
    Returns:
        List[str]: List of URLs
    """
    urls = []
    try:
        with open(filename, 'r') as f:
            for line in f:
                url = line.strip()
                if url and (url.startswith('http://') or url.startswith('https://')):
                    urls.append(url)
    except FileNotFoundError:
        logger.error(f"File {filename} not found")
    except Exception as e:
        logger.error(f"Error reading {filename}: {e}")
    
    return urls

def main():
    parser = argparse.ArgumentParser(description="Lead Hunter Pro - Extract emails and phone numbers from websites")
    parser.add_argument("--urls", nargs="+", help="List of URLs to scrape")
    parser.add_argument("--file", help="File containing URLs (one per line)")
    parser.add_argument("--searches", nargs="+", help="List of search queries")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    parser.add_argument("--max-pages", type=int, default=5, help="Max pages to visit per domain")
    parser.add_argument("--delay", type=int, default=1, help="Delay between requests in seconds")
    parser.add_argument("--max-results", type=int, default=5, help="Max search results to visit per query")
    parser.add_argument("--output", default="leads", help="Output filename (without extension)")
    
    args = parser.parse_args()
    
    # Initialize the bot
    bot = LeadHunterPro(
        headless=args.headless,
        max_pages=args.max_pages,
        delay=args.delay
    )
    
    # Determine mode of operation
    if args.urls:
        # Run with provided URLs
        bot.run_with_urls(args.urls)
    elif args.file:
        # Run with URLs from file
        urls = load_urls_from_file(args.file)
        if urls:
            bot.run_with_urls(urls)
        else:
            logger.error("No valid URLs found in file")
            return
    elif args.searches:
        # Run with search queries
        bot.run_with_searches(args.searches, args.max_results)
    else:
        # Run with example URLs
        example_urls = [
            "https://example.com",
            "https://httpbin.org/html"
        ]
        logger.info("Running with example URLs. Use --urls, --file, or --searches to specify targets.")
        bot.run_with_urls(example_urls)
    
    # Export results
    bot.export_results(args.output)

if __name__ == "__main__":
    main()