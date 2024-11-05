@echo off
:: Check if we are in a folder with a React app (by looking for package.json)
if not exist package.json (
    echo Please ensure you are in the root directory of the project, where package.json is located.
    pause
    exit /b
)

:: Check if Node.js is installed
echo Checking for Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Downloading...
    start "" "https://nodejs.org/"
    echo Please install Node.js from the website, then rerun this script.
    pause
    exit /b
) ELSE (
    echo Node.js is installed.
)

:: Pull the latest changes from the repository
echo Pulling the latest changes...
git pull
IF %ERRORLEVEL% NEQ 0 (
    echo There was an error pulling the latest changes. Please check the output above.
    pause
    exit /b
)

:: Install dependencies
echo Installing dependencies...
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo There was an error installing dependencies. Please check the output above.
    pause
    exit /b
)

:: Find an available port starting from 3000
set PORT=3000
:CHECK_PORT
echo Checking if port %PORT% is available...
netstat -ano | findstr :%PORT% >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    set /a PORT+=1
    goto CHECK_PORT
)

:: Start the React application on the available port in a new terminal window
echo Starting the application on port %PORT%...
start cmd /k "set PORT=%PORT% && npm start"

pause