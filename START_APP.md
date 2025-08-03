# CarLog Application Startup Guide

## Prerequisites

1. **Neo4j Database**: Make sure your `my-neo4j` container is running:
   ```bash
   docker ps | grep my-neo4j
   ```
   If not running, start it:
   ```bash
   docker start my-neo4j
   ```

2. **Neo4j Configuration**: The app is configured for passwordless Neo4j by default.
   - If your Neo4j has **no password**: Leave `NEO4J_PASSWORD=` empty in `backend/.env`
   - If your Neo4j has a **password**: Update `backend/.env`:
     ```
     NEO4J_PASSWORD=your-actual-neo4j-password
     ```

## Starting the Backend

1. **Open Terminal #1** and navigate to the backend:
   ```bash
   cd /Users/gcp/Projects/carlog/backend
   ```

2. **Activate the virtual environment**:
   ```bash
   source .venv/bin/activate
   ```

3. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload
   ```

   The backend will start at: **http://localhost:8000**
   
   - API Documentation: http://localhost:8000/docs
   - Alternative API Docs: http://localhost:8000/redoc

## Starting the Frontend

1. **Open Terminal #2** and navigate to the frontend:
   ```bash
   cd /Users/gcp/Projects/carlog/frontend
   ```

2. **Start the React development server**:
   ```bash
   npm start
   ```

   The frontend will start at: **http://localhost:3000**

## Verify Everything is Working

1. **Backend Health Check**:
   - Visit http://localhost:8000/docs
   - You should see the FastAPI Swagger documentation

2. **Frontend Check**:
   - Visit http://localhost:3000
   - You should see the CarLog application

3. **Neo4j Check**:
   - Visit http://localhost:7474
   - Login with your Neo4j credentials

## Using Docker (Alternative)

To run everything with Docker Compose:

```bash
cd /Users/gcp/Projects/carlog

# Update docker-compose.yml with your Neo4j password first!
# Edit line 12: NEO4J_PASSWORD=your-actual-password

docker-compose up
```

## Troubleshooting

### Backend Issues:
- **Import errors**: Make sure virtual environment is activated
- **Neo4j connection failed**: Check password in .env and that Neo4j is running
- **Port 8000 already in use**: Kill the process: `lsof -ti:8000 | xargs kill -9`

### Frontend Issues:
- **Port 3000 already in use**: Kill the process: `lsof -ti:3000 | xargs kill -9`
- **Module not found**: Run `npm install` in the frontend directory

### Quick Test Commands:
```bash
# Test backend
curl http://localhost:8000/

# Test frontend
curl http://localhost:3000/
```

## Development Workflow

1. Backend changes are auto-reloaded (due to --reload flag)
2. Frontend changes are auto-reloaded (React dev server)
3. Run tests before committing:
   ```bash
   ./run_tests.sh
   ```

## Important Notes

⚠️ **Security**: The current `.env` file has placeholder values. For production:
- Generate a secure SECRET_KEY
- Use strong Neo4j password
- Configure real Twilio credentials for SMS features

🚧 **Implementation Status**: 
- Auth endpoints (login/register) are not fully implemented
- Vehicle and maintenance endpoints need database integration
- SMS functionality requires valid Twilio credentials