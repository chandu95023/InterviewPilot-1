import sys
from pathlib import Path
# Ensure parent path is in sys.path
sys.path.append(str(Path(__file__).resolve().parent))
from app.core.config import Settings
settings = Settings()
print('MONGODB_URI:', settings.mongodb_uri)
print('JWT_SECRET:', settings.jwt_secret)
print('OPENAI_API_KEY:', settings.openai_api_key)
