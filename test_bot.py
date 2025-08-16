#!/usr/bin/env python3
"""
Test script for Lead Hunter Pro
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lead_hunter_pro import LeadHunterPro
import re

def test_regex_patterns():
    \"\"\"Test the regex patterns used for extraction.\"\"\"
    print("Testing Regex Patterns")
    print("=" * 50)
    
    # Test emails
    test_text = \"\"\"
    Contact us at:
    - support@example.com
    - john.doe@company.org
    - admin@sub.domain.co.uk
    - test@123.456.789
    - invalid.email@
    - @invalid.com
    \"\"\"
    
    emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+", test_text)
    print("Found emails:")
    for email in emails:
        print(f"  - {email}")
    
    print()
    
    # Test phones
    test_text = \"\"\"
    Call us at:
    - (555) 123-4567
    - +1-800-555-0199
    - 555.123.4567
    - 555 123 4567
    - +44 20 7946 0958
    - 123-4567
    - 555-1234
    \"\"\"
    
    phones = re.findall(r"(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{2,4}\\)?[-.\\s]?)?\\d{3,4}[-.\\s]?\\d{3,4}", test_text)
    print("Found phones:")
    for phone in phones:
        print(f"  - {phone}")

def test_lead_hunter_class():
    \"\"\"Test the LeadHunterPro class.\"\"\"
    print("\\nTesting LeadHunterPro Class")
    print("=" * 50)
    
    # Create an instance
    bot = LeadHunterPro(headless=True, max_pages=2, delay=1)
    
    # Test URL validation
    test_urls = [
        "https://example.com",
        "http://test.com",
        "invalid-url",
        "https://example.com"  # Duplicate
    ]
    
    print("URL validation:")
    for url in test_urls:
        is_valid = bot.is_valid_url(url)
        print(f"  {url}: {'Valid' if is_valid else 'Invalid'}")
    
    # Test lead storage
    print("\\nAdding test leads:")
    bot.leads.append({
        "url": "https://example.com",
        "type": "email",
        "value": "test@example.com",
        "timestamp": 1234567890
    })
    
    bot.leads.append({
        "url": "https://example.com",
        "type": "phone",
        "value": "(555) 123-4567",
        "timestamp": 1234567891
    })
    
    print(f"  Added {len(bot.leads)} test leads")
    
    # Test export
    print("\\nTesting export:")
    bot.export_results("test_output")
    print("  Export completed")

def main():
    \"\"\"Run all tests.\"\"\"
    print("Lead Hunter Pro - Test Suite")
    print("=" * 50)
    
    try:
        test_regex_patterns()
        test_lead_hunter_class()
        
        print("\\nAll tests completed successfully!")
        return True
    except Exception as e:
        print(f"\\nTest failed with error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)