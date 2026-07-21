from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import time

router = APIRouter()

class AdminLogin(BaseModel):
    username: str
    password: str

# In a real app, verify credentials against DB and generate JWT.
def _generate_dummy_token(username: str) -> str:
    # Simple placeholder token (not secure)
    return f"dummy-token-{username}-{int(time.time())}"

@router.post("/login", summary="Admin login", tags=["Admin Auth"])
async def admin_login(payload: AdminLogin):
    # Dummy check: accept any non-empty username/password
    if not payload.username or not payload.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    token = _generate_dummy_token(payload.username)
    return {"access_token": token, "token_type": "bearer"}
