import psycopg2
from core.security import get_password_hash

def create_test_users():
    
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432", 
            database="calculus_db",
            user="postgres",
            password="rofpun"
        )
        
        cursor = conn.cursor()
        
        
        admin_password = get_password_hash("admin123")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, is_active, is_verified) 
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
        """, ("admin@calculus.com", admin_password, "System Administrator", "ADMIN", True, True))
        
        admin_id = cursor.fetchone()[0]
        print(f"Admin created (ID: {admin_id}, Verified: True)")
        
        student_password = get_password_hash("student123")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, is_active, is_verified) 
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
        """, ("student@test.com", student_password, "Test Student", "STUDENT", True, False))
        
        student_id = cursor.fetchone()[0]
        print(f"Student created (ID: {student_id}, Verified: False)")
        
        conn.commit()
        print("Users created successfully!")
        
        cursor.execute("SELECT email, role, is_verified FROM users;")
        users = cursor.fetchall()
        
        print(f"\nCreated users:")
        for user in users:
            print(f"   - {user[0]} | {user[1]} | Verified: {user[2]}")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_test_users()