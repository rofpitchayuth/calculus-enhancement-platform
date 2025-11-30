import requests
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_full_auth_flow():
    """ทดสอบ Auth flow แบบครบวงจร"""
    
    print("🧪 Testing Complete Auth Flow")
    print("="*60)
    
    # 1. Register new user
    print("\n1. 📝 Testing Registration...")
    register_data = {
        "email": "newuser@test.com",
        "password": "newpass123",
        "full_name": "New Test User",
        "role": "student"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=register_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Registration successful!")
            print(f"   User: {result['user']['full_name']}")
            print(f"   Email: {result['user']['email']}")
            print(f"   Role: {result['user']['role']}")
            print(f"   Verified: {result['user']['is_verified']}")
            print(f"   Token: {result['token']['access_token'][:20]}...")
            new_user_token = result['token']['access_token']
        else:
            print(f"❌ Registration failed: {response.json()}")
            new_user_token = None
    except Exception as e:
        print(f"❌ Registration error: {e}")
        new_user_token = None
    
    # 2. Login existing user
    print("\n2. 🔑 Testing Login...")
    login_data = {
        "email": "admin@calculus.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login successful!")
            print(f"   User: {result['user']['full_name']}")
            print(f"   Role: {result['user']['role']}")
            print(f"   Verified: {result['user']['is_verified']}")
            admin_token = result['token']['access_token']
        else:
            print(f"❌ Login failed: {response.json()}")
            admin_token = None
    except Exception as e:
        print(f"❌ Login error: {e}")
        admin_token = None
    
    # 3. Get current user profile
    if admin_token:
        print("\n3. 👤 Testing /me endpoint...")
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{BASE_URL}/me", headers=headers)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                user = response.json()
                print("✅ Profile retrieval successful!")
                print(f"   ID: {user['id']}")
                print(f"   Name: {user['full_name']}")
                print(f"   Email: {user['email']}")
                print(f"   Role: {user['role']}")
                print(f"   Verified: {user['is_verified']}")
            else:
                print(f"❌ Profile failed: {response.json()}")
        except Exception as e:
            print(f"❌ Profile error: {e}")
    
    # 4. Get all users (admin only)
    if admin_token:
        print("\n4. 📋 Testing /users endpoint...")
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{BASE_URL}/users", headers=headers)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                users = response.json()
                print("✅ Users list successful!")
                print(f"   Total users: {len(users)}")
                for user in users:
                    print(f"   - {user['full_name']} ({user['email']}) - {user['role']} - Verified: {user['is_verified']}")
            else:
                print(f"❌ Users list failed: {response.json()}")
        except Exception as e:
            print(f"❌ Users list error: {e}")
    
    print("\n" + "="*60)
    print("🎉 Auth testing completed!")

if __name__ == "__main__":
    test_full_auth_flow()