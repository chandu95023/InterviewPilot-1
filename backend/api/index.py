import sys
import os
import traceback

# Print initial environment info for debugging Vercel issues
print("Python Version:", sys.version)
print("Initial sys.path:", sys.path)
print("Current Working Directory:", os.getcwd())

# Locate and prioritize the virtualenv site-packages if present
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
python_version_dir = f"python{sys.version_info.major}.{sys.version_info.minor}"
venv_site_packages = os.path.join(base_dir, ".venv", "lib", python_version_dir, "site-packages")

if os.path.exists(venv_site_packages):
    # Insert at the beginning to override any stale system/vendored packages
    sys.path.insert(0, venv_site_packages)
    print(f"Prioritized venv site-packages: {venv_site_packages}")
else:
    print(f"Venv site-packages not found at: {venv_site_packages}")

# Also add the base directory to path so 'app' can be imported
if base_dir not in sys.path:
    sys.path.append(base_dir)

app = None

try:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    # Try importing the main application
    from app.main import app as main_app
    app = main_app
    print("Successfully loaded backend app.main:app")
except Exception as e:
    err_tb = traceback.format_exc()
    print("Failed to load application:")
    print(err_tb)
    
    # Fallback to display the traceback in the browser for debugging
    try:
        from fastapi import FastAPI
        from fastapi.responses import JSONResponse
    except ImportError:
        # If even FastAPI cannot be imported, we can't build a FastAPI app,
        # but let's let Vercel runtime fail or try to define a minimal WSGI app if possible.
        raise e
        
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": err_tb})

