import requests
res = requests.options("http://127.0.0.1:8000/users/register", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
print(res.status_code)
print(res.text)
