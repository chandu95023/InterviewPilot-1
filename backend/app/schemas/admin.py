from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, Field

class AdminRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CONTENT_MANAGER = "content_manager"
    QUESTION_REVIEWER = "question_reviewer"
    READ_ONLY = "read_only"

class AdminBase(BaseModel):
    email: EmailStr
    role: AdminRole = AdminRole.ADMIN
    is_active: bool = True

class AdminCreate(AdminBase):
    password: str = Field(..., min_length=8)

class AdminRead(AdminBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str

class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None
    role: AdminRole | None = None
