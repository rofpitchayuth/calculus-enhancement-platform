import requests
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_registration_detailed():
    
    print(" Testing Registration in Detail")
    print("="*50)
    
    new_user_data = {
        "email": "testuser@example.com",
        "password": "testpass123",
        "full_name": "Test User",
        "role": "student"
    }
    
    print("\n📋 Registration Data:")
    print(json.dumps(new_user_data, indent=2))
    
    try:
        print(f"\n🔗 Making POST request to: {BASE_URL}/register")
        response = requests.post(f"{BASE_URL}/register", json=new_user_data, timeout=10)
        
        print(f"\n📊 Response Details:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"   JSON Response:")
            print(json.dumps(response_json, indent=2))
        except:
            print(f"   Raw Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Registration successful!")
        else:
            print(f"❌ Registration failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server!")
        print("   Make sure FastAPI server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_registration_detailed()