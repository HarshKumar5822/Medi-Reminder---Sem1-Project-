import requests
url = "http://127.0.0.1:8000/users/register"
for origin in ["http://localhost:5174", "http://127.0.0.1:5173", "http://any-other.com"]:
    res = requests.options(url, headers={"Origin": origin, "Access-Control-Request-Method": "POST"})
    print(f"Origin {origin} -> {res.status_code}")
