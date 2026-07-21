from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_log"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = Column(String, ForeignKey("admin_user.id"), nullable=False)
    action = Column(String, nullable=False)
    target = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

    admin = relationship("Admin", backref="audit_logs")
