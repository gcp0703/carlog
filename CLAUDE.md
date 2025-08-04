# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CarLog is a car maintenance tracking application that helps car owners maintain a database of their vehicles and track comprehensive maintenance records with SMS-based notifications and updates. The application uses FastAPI for the backend, React with TypeScript for the frontend, and Neo4j as the graph database.

## Technology Stack

- **Backend**: Python with FastAPI framework
- **Frontend**: React with TypeScript
- **Database**: Neo4j (graph database)
- **Messaging**: Twilio for SMS integration
- **Containerization**: Docker with docker-compose
- **Testing**: pytest (backend), Jest/React Testing Library (frontend)
- **Code Quality**: Black, Flake8, MyPy (backend), ESLint, Prettier (frontend)

## Development Commands

### Backend (from cartrac/backend/)
```bash
# Activate virtual environment
source .venv/bin/activate  # or create with: python -m venv .venv

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload

# Run tests
python -m pytest
python -m pytest tests/test_specific.py::test_function  # Run specific test

# Code quality
python -m black .
python -m flake8
python -m mypy app/
```

### Frontend (from cartrac/frontend/)
```bash
# Install dependencies
npm install

# Development server
npm start  # or npm run start

# Build for production
npm run build

# Run tests
npm test
npm test -- --coverage  # With coverage

# Type checking and linting
npm run type-check
npm run lint
```

### Docker Development
```bash
# From cartrac/ directory
docker-compose up       # Start all services
docker-compose up -d    # Start in detached mode
docker-compose down     # Stop all services
docker-compose logs -f backend  # Follow backend logs
```

## Architecture Overview

### Backend Structure
- **app/api/v1/**: API versioning and route definitions
  - `endpoints/`: Individual API endpoint modules (auth, users, vehicles, maintenance, sms)
- **app/core/**: Core functionality
  - `config.py`: Centralized configuration using Pydantic settings
  - `security.py`: Authentication and authorization logic
- **app/models/**: Pydantic models for data validation
- **app/services/**: Business logic layer
  - `neo4j_service.py`: Neo4j database interactions
  - `sms_service.py`: Twilio SMS integration
- **app/utils/**: Shared utilities and dependencies

### Frontend Structure
- **src/components/**: Reusable React components
  - `auth/`: Authentication context and route protection
  - `common/`: Shared UI components
  - `maintenance/`, `vehicles/`: Feature-specific components
- **src/pages/**: Page-level components for routing
- **src/services/**: API client and external service integration
- **src/types/**: TypeScript type definitions

### Key Patterns
1. **Authentication**: JWT-based authentication with FastAPI security utilities
2. **Database**: Neo4j accessed through official Python driver with connection pooling
3. **API Design**: RESTful endpoints with automatic OpenAPI documentation
4. **State Management**: React Context API for authentication state
5. **Routing**: React Router v6 for client-side routing with protected routes

## Environment Configuration

### Backend (.env file in cartrac/backend/)
```
NEO4J_URI=bolt://docker:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
SECRET_KEY=your-secret-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### Frontend
- API URL configured in docker-compose.yml as REACT_APP_API_URL

## Neo4j Database Notes

- When running with Docker, Neo4j is accessible at hostname 'docker' from the backend container
- Default connection: bolt://docker:7687
- Use Neo4j Browser at http://localhost:7474 for database exploration
- The neo4j instance in docker is my-neo4j

## SMS Integration

The SMS service uses Twilio and includes:
- Natural language parsing for maintenance updates (e.g., "oil change at 45000 on 1/15")
- Mileage-only updates (e.g., "23532")
- Webhook endpoint at `/api/v1/sms/webhook` for incoming messages
- Scheduled notification system for maintenance reminders

## Testing Strategy

- Backend: pytest with async support, separate integration test markers
- Frontend: Jest with React Testing Library
- Run tests before committing changes
- Integration tests require Neo4j connection

## Important Security Notes

- JWT tokens expire after 8 days (configurable)
- Passwords hashed with bcrypt
- CORS configured for local development (update for production)
- Environment variables for all sensitive configuration
- Input validation on all SMS responses to prevent injection attacks

## Development Workflow

- Always activate .venv/bin/activate when claude starts

## Memory Notes

- Always activate the virtual environment when claude starts
- To activate the virtual environment, navigate to the backend directory and run: `source .venv/bin/activate`
- The virtual environment for backend is in .venv

## API Authentication Notes

- For CarAPI calls You'll send a JSON request including your token and secret to authenticate to the API. The response will contain the JWT which you'll include in the HTTP Header of future requests. This JWT will last for several days, so there is no need request a new one each time.

## External API Documentation

- carapi docs are at https://carapi.app/docs/

## Server Access

### carlog.piprivate.net (linuxpub server)
```bash
ssh -i ~/.ssh/linuxpub_key.pem azureuser@carlog.piprivate.net
```
- **OS**: Ubuntu 24.04.2 LTS
- **Internal IP**: 10.0.0.4
- **Neo4j**: Version 2025.07.0 running on localhost:7687 (Bolt) and localhost:7474 (HTTP)
```

## Development Memories
- test after making changes using test-suite-executor
- always test compilation after changes
- always use code-architect for writing code
- always use functional-issue-analyzer when trying to understand why a complex functional (non-syntactic) issue is occurring
- always use data-scientist when trying to determine the best approach for utilizing AI or machine learning or optimizing existing predictive analytics or anomaly detection
- always use neo4j-fullstack-architect when making complicated decisions about database structure, updating, or optimization

## Pre-Push Code Quality Checks
- Before pushing code to the git remote, perform the following:
  # Backend checks
  cd backend
  python -m black app/
  python -m flake8 app/
  python -m mypy app/
  python -m pytest

  # Frontend checks
  cd frontend
  npm run type-check
  npm run lint
  npm test