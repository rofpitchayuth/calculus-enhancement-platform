import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

print("Testing imports...")

try:
    from core.config import settings
    print("✅ core.config imported successfully")
    print(f"   PROJECT_NAME: {settings.PROJECT_NAME}")
    print(f"   DATABASE_URL: {settings.DATABASE_URL}")
except ImportError as e:
    print(f"❌ core.config import failed: {e}")

try:
    from api.v1.api import api_router
    print("✅ api.v1.api imported successfully")
except ImportError as e:
    print(f"❌ api.v1.api import failed: {e}")

try:
    from app.main import app
    print("✅ app.main imported successfully")
except ImportError as e:
    print(f"❌ app.main import failed: {e}")