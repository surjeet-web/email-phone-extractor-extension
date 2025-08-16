#!/usr/bin/env python3
"""
Setup script for Lead Hunter Pro
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a Python package using pip."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ Failed to install {package}")
        return False

def main():
    print("Lead Hunter Pro Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("✗ Python 3.7 or higher is required")
        return False
    
    print(f"✓ Python version: {sys.version}")
    
    # Install required packages
    required_packages = [
        "playwright>=1.40.0",
        "pandas>=1.5.0"
    ]
    
    print("\nInstalling required packages...")
    for package in required_packages:
        if not install_package(package):
            return False
    
    # Install Playwright browsers
    print("\nInstalling Playwright browsers...")
    try:
        subprocess.check_call([sys.executable, "-m", "playwright", "install"])
        print("✓ Playwright browsers installed successfully")
    except subprocess.CalledProcessError:
        print("✗ Failed to install Playwright browsers")
        return False
    
    # Test import
    print("\nTesting imports...")
    try:
        import playwright
        import pandas
        print("✓ All imports successful")
    except ImportError as e:
        print(f"✗ Import failed: {e}")
        return False
    
    print("\nSetup complete! You can now run the bot:")
    print("  python lead_hunter_pro.py --help")
    print("\nTo test with example URLs:")
    print("  python lead_hunter_pro.py --file example_urls.txt")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)