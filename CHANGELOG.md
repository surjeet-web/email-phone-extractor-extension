# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1] - 2025-08-16

### Added
- Auto Extract All feature to automatically extract data from multiple pages
- Input field to specify target number of emails for extraction
- Enhanced pagination detection with multiple fallback methods
- Comprehensive debugging and logging throughout the extension
- New test files for comprehensive testing

### Changed
- Improved regex patterns for better email and phone number detection
- Enhanced error handling and user feedback
- Updated UI with new auto-extract-all section
- Refined content script message handling
- Improved documentation and testing guides

### Fixed
- Syntax errors in popup.js
- Incorrect regex escaping in content.js
- Pagination navigation issues
- Data saving and loading problems
- Communication errors between popup and content script

## [2.0] - 2025-08-15

### Added
- Modern UI with tab-based interface
- Auto-scrolling functionality
- Pagination support
- Local storage for data persistence
- One-click CSV export
- Copy to clipboard functionality
- Progress indicators and status messages

### Changed
- Complete rewrite of the extension architecture
- Improved data extraction algorithms
- Enhanced user interface design
- Better error handling and user feedback

## [1.0] - 2025-08-10

### Added
- Initial release
- Basic email and phone number extraction
- Simple popup interface
- Manual data export