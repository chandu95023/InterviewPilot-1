from sqlalchemy import Column, String, Boolean, DateTime, Enum
import enum
import uuid
from datetime import datetime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class AdminRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CONTENT_MANAGER = "content_manager"
    QUESTION_REVIEWER = "question_reviewer"
    READ_ONLY = "read_only"

class Admin(Base):
    __tablename__ = "admin_user"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(AdminRole), nullable=False, default=AdminRole.ADMIN)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
