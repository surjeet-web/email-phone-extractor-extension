@echo off
echo Lead Hunter Pro - Web Scraping Bot
echo =================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from https://python.org
    pause
    exit /b 1
)

REM Check if required packages are installed
python -c "import playwright, pandas" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing required packages...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install required packages
        pause
        exit /b 1
    )
    
    echo Installing Playwright browsers...
    python -m playwright install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Playwright browsers
        pause
        exit /b 1
    )
)

echo Starting Lead Hunter Pro...
echo.
python lead_hunter_pro.py %*
echo.
echo Bot execution completed.
pause