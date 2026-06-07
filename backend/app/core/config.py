import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present (optional)
load_dotenv(Path(__file__).resolve().parents[3] / '.env')

from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    mongodb_uri: str = Field('mongodb://localhost:27017', env='MONGODB_URI')
    mongodb_db: str = Field('ai_interview_prep', env='MONGODB_DB')
    jwt_secret: str = Field('dev_secret', env='JWT_SECRET')
    jwt_algorithm: str = Field('HS256', env='JWT_ALGORITHM')
    jwt_expiration_minutes: int = Field(120, env='JWT_EXPIRATION_MINUTES')
    openai_api_key: str = Field('', env='OPENAI_API_KEY')
    openai_model: str = Field('gpt-4o', env='OPENAI_MODEL')

    # Model config for Pydantic v2
    model_config = {
        "env_file": str(Path(__file__).resolve().parents[3] / '.env'),
        "extra": "ignore",
    }


settings = Settings()
