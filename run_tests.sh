#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚗 CarLog Test Runner"
echo "===================="
echo ""

# Function to run backend tests
run_backend_tests() {
    echo -e "${YELLOW}📦 Backend Tests${NC}"
    echo "----------------"
    
    cd backend
    
    # Activate virtual environment
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    else
        echo -e "${RED}❌ Virtual environment not found! Run: cd backend && python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt${NC}"
        return 1
    fi
    
    # Check environment variables
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo -e "${YELLOW}⚠️  No .env file found. Using default test values.${NC}"
        export NEO4J_URI="bolt://localhost:7687"
        export NEO4J_USER="neo4j"
        export NEO4J_PASSWORD="testpassword"
        export SECRET_KEY="test-secret-key"
        export TWILIO_ACCOUNT_SID="test-sid"
        export TWILIO_AUTH_TOKEN="test-token"
        export TWILIO_PHONE_NUMBER="+1234567890"
    fi
    
    echo ""
    echo "1️⃣  Running Black (Code Formatting)..."
    python -m black --check app/
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Black: Code is properly formatted${NC}"
    else
        echo -e "${RED}❌ Black: Code needs formatting. Run: python -m black app/${NC}"
    fi
    
    echo ""
    echo "2️⃣  Running Flake8 (Linting)..."
    python -m flake8 app/ --max-line-length=127 --exclude=__pycache__
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Flake8: No linting issues${NC}"
    else
        echo -e "${RED}❌ Flake8: Found linting issues${NC}"
    fi
    
    echo ""
    echo "3️⃣  Running MyPy (Type Checking)..."
    python -m mypy app/ --ignore-missing-imports
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MyPy: Type checking passed${NC}"
    else
        echo -e "${RED}❌ MyPy: Type checking failed${NC}"
    fi
    
    echo ""
    echo "4️⃣  Running Pytest (Unit Tests)..."
    python -m pytest -v --tb=short
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Pytest: All tests passed${NC}"
    else
        echo -e "${RED}❌ Pytest: Some tests failed${NC}"
    fi
    
    cd ..
}

# Function to run frontend tests
run_frontend_tests() {
    echo ""
    echo -e "${YELLOW}🎨 Frontend Tests${NC}"
    echo "-----------------"
    
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    echo ""
    echo "1️⃣  Running Type Check..."
    npm run type-check
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ TypeScript: Type checking passed${NC}"
    else
        echo -e "${RED}❌ TypeScript: Type checking failed${NC}"
    fi
    
    echo ""
    echo "2️⃣  Running ESLint..."
    npm run lint
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ESLint: No linting issues${NC}"
    else
        echo -e "${RED}❌ ESLint: Found linting issues${NC}"
    fi
    
    echo ""
    echo "3️⃣  Running Jest Tests..."
    CI=true npm test -- --watchAll=false
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Jest: All tests passed${NC}"
    else
        echo -e "${RED}❌ Jest: Some tests failed${NC}"
    fi
    
    echo ""
    echo "4️⃣  Building Frontend..."
    REACT_APP_API_URL=http://localhost:8000 npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build: Frontend built successfully${NC}"
    else
        echo -e "${RED}❌ Build: Frontend build failed${NC}"
    fi
    
    cd ..
}

# Function to run integration tests with Docker
run_integration_tests() {
    echo ""
    echo -e "${YELLOW}🐳 Integration Tests (Docker)${NC}"
    echo "-----------------------------"
    
    # Check if Neo4j is running
    echo "Checking Neo4j status..."
    if docker ps | grep -q "my-neo4j"; then
        echo -e "${GREEN}✅ Neo4j container 'my-neo4j' is running${NC}"
    else
        echo -e "${RED}❌ Neo4j container 'my-neo4j' is not running${NC}"
        echo "Please start it with: docker start my-neo4j"
        return 1
    fi
    
    # Run backend with Neo4j
    cd backend
    source .venv/bin/activate
    
    export NEO4J_URI="bolt://localhost:7687"
    export NEO4J_USER="neo4j"
    export NEO4J_PASSWORD="password"
    
    echo ""
    echo "Running integration tests..."
    python -m pytest -v -m "integration"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Integration tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Integration tests failed or skipped${NC}"
    fi
    
    cd ..
}

# Main menu
echo "What would you like to test?"
echo "1) Backend only"
echo "2) Frontend only"
echo "3) Both Backend and Frontend"
echo "4) Integration tests with Docker"
echo "5) Everything (Full test suite)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        run_backend_tests
        ;;
    2)
        run_frontend_tests
        ;;
    3)
        run_backend_tests
        run_frontend_tests
        ;;
    4)
        run_integration_tests
        ;;
    5)
        run_backend_tests
        run_frontend_tests
        run_integration_tests
        ;;
    *)
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo "🏁 Test run complete!"