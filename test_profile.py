import requests

# Assuming we have the token from the previous test_register.py
login_res = requests.post("http://127.0.0.1:8000/users/login", json={
    "email": "testuser_debug@example.com",
    "password": "securepassword123"
}, headers={
    "Origin": "http://localhost:5174",
    "Content-Type": "application/json"
})

token = login_res.json().get("access_token")
if not token:
    print("Login failed")
    exit()

res = requests.put("http://127.0.0.1:8000/users/me", json={
    "email": "testuser_debug@example.com",
    "phone": "9876543210",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
}, headers={
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
})

print(f"Status: {res.status_code}")
print(res.text)
