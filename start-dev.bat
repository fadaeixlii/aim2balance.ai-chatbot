@echo off
echo ========================================
echo LibreChat Development Environment
echo ========================================
echo.

REM Check if this is first-time setup
if not exist "client\dist\index.html" (
    echo FIRST-TIME SETUP DETECTED
    echo ========================================
    echo.
    echo This appears to be your first time running the dev environment.
    echo The following steps will be executed:
    echo.
    echo 1. Install dependencies with npm ci
    echo 2. Build required packages
    echo 3. Build frontend
    echo 4. Start Docker services
    echo 5. Start development servers
    echo.
    echo This will take 10-15 minutes. Please be patient...
    echo.
    pause
    
    echo.
    echo [1/7] Installing dependencies with npm ci...
    call npm ci
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo.
    echo [2/7] Building data-schemas package...
    call npm run build:data-schemas
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build data-schemas
        pause
        exit /b 1
    )
    
    echo.
    echo [3/7] Building data-provider package...
    call npm run build:data-provider
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build data-provider
        pause
        exit /b 1
    )
    
    echo.
    echo [4/7] Building api package...
    call npm run build:api
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build api
        pause
        exit /b 1
    )
    
    echo.
    echo [5/7] Building client-package...
    call npm run build:client-package
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build client-package
        pause
        exit /b 1
    )
    
    echo.
    echo [6/7] Building frontend (one-time)...
    call npm run frontend
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build frontend
        pause
        exit /b 1
    )
    
    echo.
    echo ========================================
    echo FIRST-TIME SETUP COMPLETE!
    echo ========================================
    echo.
)

echo [Starting Services] Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Docker services
    echo Make sure Docker Desktop is running
    pause
    exit /b 1
)

echo.
echo [Starting Services] Starting backend server...
start "LibreChat Backend" cmd /k "npm run backend:dev"

timeout /t 5 /nobreak >nul

echo.
echo [Starting Services] Starting frontend dev server...
start "LibreChat Frontend" cmd /k "npm run frontend:dev"

echo.
echo ========================================
echo Development servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3080
echo Frontend: http://localhost:3090
echo.
echo Docker Services:
echo - MongoDB:     localhost:27017
echo - Redis:       localhost:6379
echo - MeiliSearch: localhost:7700
echo.
echo ========================================
echo.
echo Waiting 10 seconds before opening browser...
timeout /t 10 /nobreak

start http://localhost:3090

echo.
echo Press any key to exit this window...
pause >nul
