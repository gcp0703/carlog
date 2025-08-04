import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.v1.api import api_router
from app.core.config import settings
from app.cron_scheduler import scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CarLog API",
    description="Car maintenance tracking application API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors"""
    logger.error(f"Validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "message": "Validation error",
            "url": str(request.url),
        },
    )


@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    """Custom handler for Pydantic validation errors"""
    logger.error(f"Pydantic validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=400,
        content={
            "detail": exc.errors(),
            "message": "Data validation error",
            "url": str(request.url),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom handler for HTTP exceptions"""
    logger.error(f"HTTP exception on {request.url}: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "url": str(request.url),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Custom handler for general exceptions"""
    logger.error(f"Unexpected error on {request.url}: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_type": type(exc).__name__,
            "url": str(request.url),
        },
    )


@app.on_event("startup")
async def startup_event():
    """Start the cron scheduler on application startup"""
    try:
        scheduler.start()
        logger.info("Application startup complete, cron scheduler started")
    except Exception as e:
        logger.error(f"Failed to start cron scheduler: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Stop the cron scheduler on application shutdown"""
    scheduler.stop()
    logger.info("Application shutdown complete")


@app.get("/")
async def root():
    return {"message": "Welcome to CarLog API"}
