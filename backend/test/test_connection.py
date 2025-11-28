import psycopg2
import time
import os
import sys
from dotenv import load_dotenv

def test_connection():
    print("Testing PostgreSQL connection...")
    
    try:
        time.sleep(5)
        
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="calculus_db",
            user="postgres", 
            password="rofpun",
            connect_timeout=10
        )
        
        print("Connection successful!")
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"PostgreSQL: {version}")
        
        cursor.execute("SELECT current_database(), current_user;")
        result = cursor.fetchone()
        print(f"Database: {result[0]}, User: {result[1]}")
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100)
            );
        """)
        print("Table creation test successful!")
        
        cursor.execute("DROP TABLE IF EXISTS test_table;")
        print("Table deletion test successful!")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

def test_from_backend_env():
    print("\n Testing with backend .env config...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)  # backend/
    env_path = os.path.join(backend_dir, '.env')
    
    print(f" Current dir: {current_dir}")
    print(f" Backend dir: {backend_dir}")
    print(f" .env path: {env_path}")
    print(f" .env exists: {os.path.exists(env_path)}")
    
    if not os.path.exists(env_path):
        print(" .env file not found!")
        return False
    
    load_dotenv(env_path)
    
    db_url = os.getenv('DATABASE_URL')
    secret_key = os.getenv('SECRET_KEY')
    
    print(f" DATABASE_URL: {db_url}")
    print(f" SECRET_KEY: {secret_key[:20] if secret_key else 'None'}...")
    
    if not db_url or not secret_key:
        print(" Environment variables not loaded!")
        return False
    
    sys.path.insert(0, backend_dir)
    
    try:
        from app.core.config import settings
        print(f" Config imported successfully")
        print(f" Database URL: {settings.DATABASE_URL}")
        
        from app.core.database import engine
        from sqlalchemy import text
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1 as test"))
            print(" SQLAlchemy connection successful!")
            
            result = connection.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            print(f" Connected to database: {db_name}")
        
        return True
        
    except Exception as e:
        print(f" Backend connection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_env_file():
    print("\n Checking .env file...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    env_path = os.path.join(backend_dir, '.env')
    
    if os.path.exists(env_path):
        print(f" .env file found at: {env_path}")
        
        with open(env_path, 'r') as f:
            content = f.read()
            print(" .env content:")
            for line in content.split('\n'):
                if line.strip():
                    if 'SECRET_KEY' in line:
                        print(f"   {line[:30]}...")
                    else:
                        print(f"   {line}")
    else:
        print(f" .env file not found at: {env_path}")
        print("\n Creating .env file...")
        
        env_content = """DATABASE_URL=postgresql://postgres:rofpun@localhost:5432/calculus_db
SECRET_KEY=your-super-secret-key-minimum-32-characters-long-for-jwt-security-calculus-platform
ACCESS_TOKEN_EXPIRE_MINUTES=30
PROJECT_NAME=Calculus Enhancement Platform
"""
        
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print(f" .env file created at: {env_path}")
        return True

if __name__ == "__main__":
    print(" PostgreSQL Connection Test")
    print("="*50)
    
    check_env_file()
    
    basic_ok = test_connection()
    
    backend_ok = test_from_backend_env()
    
    print("\n" + "="*50)
    if basic_ok and backend_ok:
        print(" All tests passed! PostgreSQL is ready.")
        print(" You can now:")
        print("   1. Connect with DBeaver")
        print("   2. Run migrations: alembic upgrade head")
        print("   3. Start FastAPI: uvicorn app.main:app --reload")
    else:
        print(" Some tests failed. Check configuration.")
        
        if not basic_ok:
            print("\n To fix database connection:")
            print("   docker-compose down -v")
            print("   docker volume prune -f")  
            print("   docker-compose up -d postgres")