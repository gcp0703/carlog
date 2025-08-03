# CarLog Testing Guide

## Quick Start

Run the interactive test runner:
```bash
./run_tests.sh
```

## Backend Testing

### Setup
```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Individual Test Commands

**Code Formatting:**
```bash
# Check formatting
python -m black --check app/

# Auto-format code
python -m black app/
```

**Linting:**
```bash
python -m flake8 app/ --max-line-length=127
```

**Type Checking:**
```bash
python -m mypy app/ --ignore-missing-imports
```

**Unit Tests:**
```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/test_auth.py

# Run specific test function
python -m pytest tests/test_auth.py::test_login

# Run with coverage
python -m pytest --cov=app --cov-report=html
```

## Frontend Testing

### Setup
```bash
cd frontend
npm install
```

### Individual Test Commands

**Type Checking:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

**Unit Tests:**
```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI mode)
CI=true npm test -- --watchAll=false

# Run with coverage
npm test -- --coverage --watchAll=false
```

**Build Test:**
```bash
REACT_APP_API_URL=http://localhost:8000 npm run build
```

## Integration Testing with Docker

### Start Services
```bash
# Start all services
docker-compose up -d

# Start only Neo4j for backend testing
docker-compose up -d neo4j

# View logs
docker-compose logs -f backend
```

### Run Integration Tests
```bash
cd backend
source .venv/bin/activate
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="password"
python -m pytest -m integration
```

### Stop Services
```bash
docker-compose down
```

## Development Testing Workflow

1. **Before committing:**
   ```bash
   # Backend
   cd backend && python -m black app/ && python -m flake8 app/ && python -m mypy app/
   
   # Frontend
   cd frontend && npm run lint && npm run type-check
   ```

2. **Run full test suite:**
   ```bash
   ./run_tests.sh
   # Choose option 5 for everything
   ```

3. **Test specific features:**
   ```bash
   # Backend specific endpoint
   cd backend
   python -m pytest tests/test_vehicles.py -v
   
   # Frontend specific component
   cd frontend
   npm test -- src/components/vehicles/VehicleList.test.tsx
   ```

## Environment Variables for Testing

Create `backend/.env` for local testing:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=testpassword
SECRET_KEY=test-secret-key
TWILIO_ACCOUNT_SID=test-sid
TWILIO_AUTH_TOKEN=test-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Debugging Tests

### Backend
```bash
# Run pytest with debugging
python -m pytest -v --pdb

# Run with print statements visible
python -m pytest -v -s
```

### Frontend
```bash
# Debug in VS Code
# Add breakpoint in test file and run:
npm test -- --no-coverage --watchAll=false
```

## Common Issues

1. **Neo4j connection errors:**
   - Ensure Neo4j is running: `docker-compose up -d neo4j`
   - Check connection: `curl http://localhost:7474`

2. **Python import errors:**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

3. **Frontend build errors:**
   - Clear cache: `rm -rf node_modules package-lock.json && npm install`
   - Check Node version: `node --version` (should be 16+)

4. **Type checking errors:**
   - Backend: Add `# type: ignore` for third-party imports
   - Frontend: Check `tsconfig.json` for proper configuration