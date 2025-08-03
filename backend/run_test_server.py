#!/usr/bin/env python3
"""
Run test server for registration debugging
"""
import uvicorn
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting CarLog test server...")
    print("Server will be available at: http://127.0.0.1:8000")
    print("API docs at: http://127.0.0.1:8000/docs")
    print("Registration endpoint: http://127.0.0.1:8000/api/v1/auth/register")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=True
    )