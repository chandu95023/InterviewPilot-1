import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..core.config import settings
from ..database import admins_collection
from ..models.admin import Admin, AdminRole
from ..postgres_db import get_db, Admin as AdminORM
from sqlalchemy.orm import Session

# Use the same password hashing scheme as user auth (pbkdf2_sha256)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def _normalize_password(password: str) -> str:
    """Normalize password to fit within hash limits (mirrors user auth logic)."""
    b = password.encode("utf-8")
    if len(b) > 72:
        b = b[:72]
    return b.decode("latin-1")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(_normalize_password(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_normalize_password(plain_password), hashed_password)

# JWT helpers for admin tokens (access and refresh)
def _create_token(data: dict, secret: str, algorithm: str, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm=algorithm)

def create_admin_access_token(admin_id: str, role: str) -> str:
    return _create_token(
        data={"sub": admin_id, "role": role},
        secret=settings.admin_jwt_secret,
        algorithm=settings.admin_jwt_algorithm,
        expires_delta=timedelta(minutes=settings.admin_access_token_minutes),
    )

def create_admin_refresh_token(admin_id: str) -> str:
    return _create_token(
        data={"sub": admin_id, "type": "refresh"},
        secret=settings.admin_jwt_secret,
        algorithm=settings.admin_jwt_algorithm,
        expires_delta=timedelta(days=settings.admin_refresh_token_days),
    )

def decode_admin_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.admin_jwt_secret, algorithms=[settings.admin_jwt_algorithm])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

# Dependency to retrieve the current admin from a token
oauth2_scheme_admin = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

def get_current_admin(token: str = Depends(oauth2_scheme_admin), db: Session = Depends(get_db)):
    payload = decode_admin_token(token)
    admin_id: Optional[str] = payload.get("sub")
    role: Optional[str] = payload.get("role")
    if not admin_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Retrieve admin info from DB (relational first, fallback to NoSQL)
    if db:
        admin_obj = db.query(AdminORM).filter(AdminORM.id == admin_id).first()
        if not admin_obj:
            raise HTTPException(status_code=404, detail="Admin not found")
        return {
            "id": str(admin_obj.id),
            "email": admin_obj.email,
            "role": admin_obj.role,
            "name": getattr(admin_obj, "name", ""),
        }
    else:
        admin_doc = admins_collection.find_one({"_id": admin_id})
        if not admin_doc:
            raise HTTPException(status_code=404, detail="Admin not found")
        admin_doc["id"] = str(admin_doc["_id"])
        return admin_doc

# Service functions used by the admin router
def authenticate_admin(email: str, password: str, db: Session) -> AdminORM:
    admin_obj = db.query(AdminORM).filter(AdminORM.email == email).first()
    if not admin_obj or not verify_password(password, admin_obj.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    return admin_obj

def register_admin(email: str, password: str, name: str, role: AdminRole, db: Session) -> AdminORM:
    hashed = get_password_hash(password)
    admin = AdminORM(email=email, name=name, hashed_password=hashed, role=role.value)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
