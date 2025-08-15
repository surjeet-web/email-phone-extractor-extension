# Contributing to Email & Phone Extractor Pro

Thank you for your interest in contributing to Email & Phone Extractor Pro! This document provides guidelines and information to help you contribute effectively.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct (TBD).

## How to Contribute

### Reporting Bugs

Before reporting a bug, please check if it has already been reported in the [issues](https://github.com/yourusername/email-phone-extractor-extension/issues).

When reporting a bug, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Chrome version and operating system
7. Extension version

### Suggesting Enhancements

Feature requests are welcome! Please open an issue with:

1. A clear and descriptive title
2. Detailed explanation of the proposed feature
3. Use cases for the feature
4. Potential implementation approach (if you have ideas)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Create a pull request

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

### Code Style

- Follow the existing code style in the project
- Use clear, descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write meaningful commit messages

### Testing

Before submitting a pull request:

1. Test your changes with the provided test files
2. Verify that existing functionality still works
3. Check the browser console for any errors
4. Test on different types of web pages

## Development Guidelines

### Content Script (`content.js`)

- Keep the content script lightweight
- Use efficient selectors
- Handle errors gracefully
- Avoid modifying the page content unnecessarily

### Popup (`popup.html`, `popup.css`, `popup.js`)

- Maintain responsive design
- Provide clear user feedback
- Handle asynchronous operations properly
- Use consistent UI patterns

### Regular Expressions

- Test regex patterns thoroughly
- Consider international formats
- Avoid overly complex patterns that impact performance

### Error Handling

- Log errors to the console for debugging
- Provide user-friendly error messages
- Handle edge cases gracefully

## Questions?

If you have any questions about contributing, feel free to open an issue or contact the maintainers.