from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from ..schemas import Token, UserCreate, UserLogin, UserProfile
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from ..postgres_db import get_db, User
from sqlalchemy.orm import Session
import uuid

router = APIRouter()


@router.post("/register", response_model=UserProfile)
async def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    if db:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = get_password_hash(payload.password)
        new_user = User(
            id=str(uuid.uuid4()),
            name=payload.name,
            email=payload.email,
            hashed_password=hashed_password,
            created_at=datetime.utcnow()
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "created_at": new_user.created_at
        }
    else:
        from ..database import users_collection
        from ..utils import serialize_doc
        existing = await users_collection.find_one({"email": payload.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = get_password_hash(payload.password)
        user_doc = {
            "name": payload.name,
            "email": payload.email,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
        }
        result = await users_collection.insert_one(user_doc)
        user = await users_collection.find_one({"_id": result.inserted_id})
        return serialize_doc(user)


@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    if db:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        access_token = create_access_token({"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        from ..database import users_collection
        user = await users_collection.find_one({"email": form_data.username})
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        access_token = create_access_token({"sub": user["email"]})
        return {"access_token": access_token, "token_type": "bearer"}


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfile)
async def update_profile(payload: UserProfile, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    if db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.name = payload.name
        db.commit()
        db.refresh(user)
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at
        }
    else:
        from ..database import users_collection
        from ..utils import serialize_doc
        await users_collection.update_one(
            {"email": current_user["email"]},
            {"$set": {"name": payload.name}},
        )
        user = await users_collection.find_one({"email": current_user["email"]})
        return serialize_doc(user)


@router.post("/logout")
async def logout_user():
    return {"message": "Logout successful"}


@router.post("/forgot-password")
async def forgot_password(payload: dict, db: Session = Depends(get_db)):
    """Accept an email and pretend to send a reset link (dev mode)."""
    email = payload.get("email", "")
    if db:
        user = db.query(User).filter(User.email == email).first()
    else:
        from ..database import users_collection
        user = await users_collection.find_one({"email": email})
    # Always return success to avoid leaking which emails exist
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: dict, db: Session = Depends(get_db)):
    """Reset password using token (dev mode: token = email)."""
    email = payload.get("token", "")
    new_password = payload.get("new_password", "")
    if not email or not new_password:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    hashed = get_password_hash(new_password)
    
    if db:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.hashed_password = hashed
        db.commit()
    else:
        from ..database import users_collection
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        await users_collection.update_one({"email": email}, {"$set": {"hashed_password": hashed}})
        
    return {"message": "Password updated successfully"}
