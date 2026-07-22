from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .core.config import settings
from .database import users_collection

# Use PBKDF2 for password hashing to avoid bcrypt backend issues in this environment.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _normalize_password(password: str) -> str:
    # bcrypt has a 72-byte input limit. Normalize by truncating UTF-8 bytes
    b = password.encode("utf-8")
    if len(b) > 72:
        b = b[:72]
    # decode with latin-1 to preserve byte values in a str for passlib
    return b.decode("latin-1")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_normalize_password(plain_password), hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(_normalize_password(password))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiration_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


from .postgres_db import get_db, User
from sqlalchemy.orm import Session

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if db:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise credentials_exception
        return {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "hashed_password": user.hashed_password,
            "created_at": user.created_at
        }
    else:
        user = await users_collection.find_one({"email": email})
        if user is None:
            raise credentials_exception
        user["id"] = str(user["_id"])
        return user
