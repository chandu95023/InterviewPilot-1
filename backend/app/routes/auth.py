from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from ..schemas import Token, UserCreate, UserLogin, UserProfile
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from ..postgres_db import get_db, User
from sqlalchemy.orm import Session
import uuid

router = APIRouter()


from sqlalchemy import func

@router.post("/register", response_model=UserProfile)
async def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger("AUTH_DEBUG")
    logger.setLevel(logging.DEBUG)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setLevel(logging.DEBUG)
        logger.addHandler(handler)
    
    clean_email = payload.email.strip().lower()
    logger.info("=" * 60)
    logger.info("REGISTRATION ATTEMPT")
    logger.info(f"  Name: '{payload.name}', Email: '{clean_email}'")
    
    existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing:
        logger.warning(f"  EMAIL ALREADY EXISTS: '{clean_email}'")
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(payload.password)
    logger.info(f"  Password hashed: {hashed_password[:30]}...")
    
    new_user = User(
        id=str(uuid.uuid4()),
        name=payload.name.strip(),
        email=clean_email,
        hashed_password=hashed_password,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"  USER CREATED: id={new_user.id}, email='{new_user.email}'")
    
    # Verify the user can be found immediately
    verify_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    logger.info(f"  VERIFY USER IN DB: found={verify_user is not None}")
    
    # Verify password can be verified immediately
    pw_ok = verify_password(payload.password, new_user.hashed_password)
    logger.info(f"  VERIFY PASSWORD IMMEDIATELY: {pw_ok}")
    logger.info("=" * 60)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "created_at": new_user.created_at
    }


@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger("AUTH_DEBUG")
    logger.setLevel(logging.DEBUG)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setLevel(logging.DEBUG)
        logger.addHandler(handler)
    
    logger.info("=" * 60)
    logger.info("LOGIN ATTEMPT RECEIVED")
    logger.info(f"  Raw username from form: '{form_data.username}'")
    logger.info(f"  Password length: {len(form_data.password)}")
    
    clean_email = form_data.username.strip().lower()
    logger.info(f"  Normalized email: '{clean_email}'")
    
    # Step 1: Find user in DB
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user:
        logger.error(f"  USER NOT FOUND in database for email: '{clean_email}'")
        # List all users for debugging
        all_users = db.query(User).all()
        logger.info(f"  Total users in database: {len(all_users)}")
        for u in all_users:
            logger.info(f"    - id={u.id}, email='{u.email}'")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    logger.info(f"  USER FOUND: id={user.id}, email='{user.email}', name='{user.name}'")
    logger.info(f"  Stored hash: {user.hashed_password[:30]}...")
    
    # Step 2: Verify password
    password_ok = verify_password(form_data.password, user.hashed_password)
    logger.info(f"  Password verification result: {password_ok}")
    
    if not password_ok:
        logger.error(f"  PASSWORD MISMATCH for user '{clean_email}'")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Step 3: Create JWT
    access_token = create_access_token({"sub": user.email})
    logger.info(f"  JWT created successfully: {access_token[:30]}...")
    logger.info(f"  LOGIN SUCCESS for '{clean_email}'")
    logger.info("=" * 60)
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfile)
async def update_profile(payload: UserProfile, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    
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


@router.post("/logout")
async def logout_user():
    return {"message": "Logout successful"}


@router.post("/forgot-password")
async def forgot_password(payload: dict, db: Session = Depends(get_db)):
    """Accept an email and pretend to send a reset link (dev mode)."""
    email = payload.get("email", "")
    
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    
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
    
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = hashed
    db.commit()
        
    return {"message": "Password updated successfully"}
