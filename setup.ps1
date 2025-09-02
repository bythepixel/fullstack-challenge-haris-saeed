# Weather Dashboard Setup Script
# This script sets up both backend and frontend automatically

Write-Host "Weather Dashboard Setup Starting..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "docker")) {
    Write-Host "Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "node")) {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js v18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Prerequisites check passed!" -ForegroundColor Green

# Prompt for OpenWeatherMap API key (optional)
Write-Host ""
Write-Host "OpenWeatherMap API Key (Optional)" -ForegroundColor Yellow
Write-Host "The app now uses National Weather Service API as primary source (no key required)" -ForegroundColor Cyan
Write-Host "OpenWeatherMap is used as fallback - get your free API key from: https://openweathermap.org/api" -ForegroundColor Cyan
Write-Host "Press Enter to skip, or enter your API key:" -ForegroundColor Gray
$apiKey = Read-Host "OpenWeatherMap API key (optional)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Continuing without OpenWeatherMap API key - using NWS API only" -ForegroundColor Cyan
    $apiKey = ""
}

# Setup Backend
Write-Host ""
Write-Host "Setting up Backend (Laravel API)..." -ForegroundColor Yellow

Set-Location "api"

# Copy and configure .env file
if (Test-Path ".env") {
    Write-Host ".env file already exists, backing up..." -ForegroundColor Yellow
    Copy-Item ".env" ".env.backup"
}

Copy-Item ".env.example" ".env"

# Update .env with API key (if provided)
$envContent = Get-Content ".env"
if ($apiKey) {
    $envContent = $envContent -replace "OPENWEATHER_API_KEY=", "OPENWEATHER_API_KEY=$apiKey"
    Write-Host "Environment file configured with OpenWeatherMap API key" -ForegroundColor Green
} else {
    Write-Host "Environment file configured (using NWS API only)" -ForegroundColor Green
}
$envContent | Set-Content ".env"

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

Write-Host "Docker containers started" -ForegroundColor Green

# Wait for containers to be ready
Write-Host "Waiting for containers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Setup Laravel application
Write-Host "Installing PHP dependencies and setting up Laravel..." -ForegroundColor Yellow

$setupCommands = @(
    "composer install",
    "php artisan key:generate",
    "php artisan migrate --force",
    "php artisan db:seed --force"
)

foreach ($cmd in $setupCommands) {
    Write-Host "Running: $cmd" -ForegroundColor Cyan
    docker exec fullstack-challenge-app-1 bash -c "cd /var/www/html && $cmd"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to execute: $cmd" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Backend setup completed!" -ForegroundColor Green

# Test API
Write-Host "Testing API connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-RestMethod -Uri "http://localhost/api/" -Method Get -TimeoutSec 10
    Write-Host "API is responding: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "API test failed, but continuing with frontend setup..." -ForegroundColor Yellow
}

# Setup Frontend
Set-Location "../frontend"
Write-Host ""
Write-Host "Setting up Frontend (Vue.js)..." -ForegroundColor Yellow

# Install npm dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install npm dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend dependencies installed!" -ForegroundColor Green

# Start development server in background
Write-Host "Starting frontend development server..." -ForegroundColor Yellow

# Create a new PowerShell job to run the dev server
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Write-Host "Frontend server starting in background (Job ID: $($job.Id))" -ForegroundColor Green

# Wait a moment for the server to start
Start-Sleep -Seconds 8

# Final instructions
Set-Location ".."
Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your applications are running at:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "   Stop frontend: Stop-Job $($job.Id)" -ForegroundColor Cyan
Write-Host "   Stop backend: docker compose -f api/docker-compose.yml down" -ForegroundColor Cyan
Write-Host "   View logs: docker compose -f api/docker-compose.yml logs -f" -ForegroundColor Cyan
Write-Host "   Run tests: docker exec fullstack-challenge-app-1 bash -c 'cd /var/www/html && php artisan test'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open http://localhost:5173 in your browser to see the Weather Dashboard!" -ForegroundColor Green

# Try to open browser automatically
try {
    Start-Process "http://localhost:5173"
    Write-Host "Browser opened automatically!" -ForegroundColor Green
} catch {
    Write-Host "Please manually open http://localhost:5173 in your browser" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
