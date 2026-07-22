import sys
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = None

try:
    from app.main import app as main_app
    app = main_app
except Exception as e:
    err_tb = traceback.format_exc()
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": err_tb})
