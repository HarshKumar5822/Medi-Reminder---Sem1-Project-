import requests

url = "http://127.0.0.1:8000/users/register"
payload = {
    "email": "testuser_debug@example.com",
    "password": "securepassword123",
    "full_name": "Test User",
    "phone": "1234567890"
}
headers = {
    "Origin": "http://localhost:5174",
    "Content-Type": "application/json"
}

res = requests.options(url, headers={"Origin": "http://localhost:5174", "Access-Control-Request-Method": "POST"})
print(f"OPTIONS Response: {res.status_code}")

res_post = requests.post(url, json=payload, headers=headers)
print(f"POST Response: {res_post.status_code}")
print(res_post.text)
