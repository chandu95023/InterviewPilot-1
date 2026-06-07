from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from ..schemas import Token, UserCreate, UserLogin, UserProfile
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from ..database import users_collection
from ..utils import serialize_doc

router = APIRouter()


@router.post("/register", response_model=UserProfile)
async def register_user(payload: UserCreate):
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
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return serialize_doc(current_user)


@router.put("/profile", response_model=UserProfile)
async def update_profile(payload: UserProfile, current_user: dict = Depends(get_current_user)):
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"name": payload.name}},
    )
    user = await users_collection.find_one({"email": current_user["email"]})
    return serialize_doc(user)


@router.post("/logout")
async def logout_user():
    return {"message": "Logout successful"}
