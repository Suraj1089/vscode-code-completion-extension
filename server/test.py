import requests
from dotenv import load_dotenv
import os

load_dotenv()

url = "http://127.0.0.1:8000/generate"
query_params = {
    "prompt": "write python code to add two numbers",
}
headers = {"x-api-key": os.getenv("API_KEY"), "Content-Type": "application/json"}

response = requests.post(url, params=query_params, headers=headers)
print(response.status_code)
print(response.json())