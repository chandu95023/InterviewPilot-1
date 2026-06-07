"""
Exception handlers and error middleware for the API.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Base exception for API errors"""
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(APIException):
    """Authentication related errors"""
    def __init__(self, message: str = "Authentication failed", details: dict = None):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED, details)


class AuthorizationError(APIException):
    """Authorization related errors"""
    def __init__(self, message: str = "Access denied", details: dict = None):
        super().__init__(message, status.HTTP_403_FORBIDDEN, details)


class ValidationError(APIException):
    """Validation related errors"""
    def __init__(self, message: str = "Validation failed", details: dict = None):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY, details)


class ResourceNotFoundError(APIException):
    """Resource not found errors"""
    def __init__(self, message: str = "Resource not found", details: dict = None):
        super().__init__(message, status.HTTP_404_NOT_FOUND, details)


class AIServiceError(APIException):
    """AI service related errors"""
    def __init__(self, message: str = "AI service error", details: dict = None):
        super().__init__(message, status.HTTP_503_SERVICE_UNAVAILABLE, details)


async def api_exception_handler(request: Request, exc: APIException):
    """Handle API exceptions"""
    logger.error(f"API Exception: {exc.message}", extra={"status_code": exc.status_code, "details": exc.details})
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "status_code": exc.status_code,
            "path": str(request.url),
            "timestamp": datetime.utcnow().isoformat(),
            **(exc.details if exc.details else {}),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation failed",
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "details": [
                {
                    "field": ".".join(str(x) for x in error.get("loc", [])[1:]),
                    "message": error.get("msg"),
                    "type": error.get("type"),
                }
                for error in exc.errors()
            ],
            "path": str(request.url),
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle generic exceptions"""
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "message": str(exc) if str(exc) else "An unexpected error occurred",
            "path": str(request.url),
            "timestamp": datetime.utcnow().isoformat(),
        },
    )
