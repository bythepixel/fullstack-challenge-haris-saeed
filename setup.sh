#!/bin/bash

# Weather Dashboard Setup Script
# This script sets up both backend and frontend automatically

echo "Weather Dashboard Setup Starting..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}Docker is not installed or not in PATH${NC}"
    echo -e "${RED}Please install Docker from https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed or not in PATH${NC}"
    echo -e "${RED}Please install Node.js v18+ from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites check passed!${NC}"

# Prompt for OpenWeatherMap API key
echo ""
echo -e "${YELLOW}OpenWeatherMap API Key Required${NC}"
echo -e "${CYAN}Get your free API key from: https://openweathermap.org/api${NC}"
read -p "Enter your OpenWeatherMap API key: " API_KEY

if [ -z "$API_KEY" ]; then
    echo -e "${RED}API key is required to continue${NC}"
    exit 1
fi

# Setup Backend
echo ""
echo -e "${YELLOW}Setting up Backend (Laravel API)...${NC}"

cd api

# Copy and configure .env file
if [ -f ".env" ]; then
    echo -e "${YELLOW}.env file already exists, backing up...${NC}"
    cp .env .env.backup
fi

cp .env.example .env

# Update .env with API key
sed -i "s/OPENWEATHER_API_KEY=your_openweather_api_key_here/OPENWEATHER_API_KEY=$API_KEY/" .env

echo -e "${GREEN}Environment file configured with API key${NC}"

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Docker containers${NC}"
    exit 1
fi

echo -e "${GREEN}Docker containers started${NC}"

# Wait for containers to be ready
echo -e "${YELLOW}Waiting for containers to be ready...${NC}"
sleep 10

# Setup Laravel application
echo -e "${YELLOW}Installing PHP dependencies and setting up Laravel...${NC}"

SETUP_COMMANDS=(
    "composer install"
    "php artisan key:generate"
    "php artisan migrate --force"
    "php artisan db:seed --force"
)

for cmd in "${SETUP_COMMANDS[@]}"; do
    echo -e "${CYAN}Running: $cmd${NC}"
    docker exec fullstack-challenge-app-1 bash -c "cd /var/www/html && $cmd"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to execute: $cmd${NC}"
        exit 1
    fi
done

echo -e "${GREEN}Backend setup completed!${NC}"

# Test API
echo -e "${YELLOW}Testing API connection...${NC}"
sleep 5

if curl -s http://localhost/api/ >/dev/null 2>&1; then
    echo -e "${GREEN}API is responding!${NC}"
else
    echo -e "${YELLOW}API test failed, but continuing with frontend setup...${NC}"
fi

# Setup Frontend
cd ../frontend
echo ""
echo -e "${YELLOW}Setting up Frontend (Vue.js)...${NC}"

# Install npm dependencies
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install npm dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend dependencies installed!${NC}"

# Start development server in background
echo -e "${YELLOW}Starting frontend development server...${NC}"

nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend server started in background (PID: $FRONTEND_PID)${NC}"

# Wait a moment for the server to start
sleep 8

# Final instructions
cd ..
echo ""
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}Your applications are running at:${NC}"
echo -e "   ${CYAN}Frontend: http://localhost:5173${NC}"
echo -e "   ${CYAN}Backend API: http://localhost/api${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "   ${CYAN}Stop frontend: kill $FRONTEND_PID${NC}"
echo -e "   ${CYAN}Stop backend: docker compose -f api/docker-compose.yml down${NC}"
echo -e "   ${CYAN}View logs: docker compose -f api/docker-compose.yml logs -f${NC}"
echo -e "   ${CYAN}Run tests: docker exec fullstack-challenge-app-1 bash -c 'cd /var/www/html && php artisan test'${NC}"
echo ""
echo -e "${GREEN}Open http://localhost:5173 in your browser to see the Weather Dashboard!${NC}"

# Try to open browser automatically (works on most Linux distributions and macOS)
if command_exists xdg-open; then
    xdg-open http://localhost:5173 >/dev/null 2>&1 &
    echo -e "${GREEN}Browser opened automatically!${NC}"
elif command_exists open; then
    open http://localhost:5173 >/dev/null 2>&1 &
    echo -e "${GREEN}Browser opened automatically!${NC}"
else
    echo -e "${YELLOW}Please manually open http://localhost:5173 in your browser${NC}"
fi

echo ""
echo "Press Enter to exit..."
read
