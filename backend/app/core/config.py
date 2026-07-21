import os
from pathlib import Path
from dotenv import load_dotenv

# Try loading backend/.env first, then root/.env
backend_env = Path(__file__).resolve().parents[2] / '.env'
root_env = Path(__file__).resolve().parents[3] / '.env'

if backend_env.exists():
    load_dotenv(backend_env)
else:
    load_dotenv(root_env)

from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    mongodb_uri: str = Field('mongodb://localhost:27017')
    mongodb_db: str = Field('ai_interview_prep')
    jwt_secret: str = Field('dev_secret')
    jwt_algorithm: str = Field('HS256')
    jwt_expiration_minutes: int = Field(120)
    # Admin JWT configuration
    admin_jwt_secret: str = Field('admin_dev_secret')
    admin_jwt_algorithm: str = Field('HS256')
    admin_access_token_minutes: int = Field(60)
    admin_refresh_token_days: int = Field(7)
    openai_api_key: str = Field('')
    openai_model: str = Field('gpt-4o')
    gemini_api_key: str = Field('')

    class Config:
        env_file = str(backend_env) if backend_env.exists() else str(root_env)
        env_file_encoding = 'utf-8'
        extra = "ignore"

settings = Settings()

