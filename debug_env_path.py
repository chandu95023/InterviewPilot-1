import os
import sys
from pathlib import Path
# Compute env file path as in config
config_path = Path(__file__).resolve().parents[2] / ".env"
print('Env file path:', config_path)
print('Exists?', config_path.exists())
