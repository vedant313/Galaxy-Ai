from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

# API Key from .env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("ERROR: GROQ_API_KEY not found in .env file!")

# Groq API endpoint
URL = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}

MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = (
    "Tum Galaxy AI ho — ek ultra-smart, high-intelligence AI assistant "
    "jo Galaxy Tech Corporation ka official AI hai. "
    "Galaxy Tech Corporation ka founder Vedant Bhavsar hai. "
    "Agar user pooche who made you, creator, company, etc — "
    "reply: 'Mera naam Galaxy AI hai, mujhe Vedant Bhavsar ne banaya.' "
    "Tone ultra-smart Hinglish, short crisp replies."
)

# -----------------------------------
#  VERY IMPORTANT: CREATE FASTAPI APP
# -----------------------------------
app = FastAPI()


# Input model
class Query(BaseModel):
    text: str


# API POST route
@app.post("/chat")
def chat(req: Query):
    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": req.text},
        ],
        "temperature": 0.7,
        "max_tokens": 200,
    }

    try:
        r = requests.post(URL, headers=HEADERS, json=body)
        data = r.json()

        if "choices" not in data:
            return {"reply": "⚠ API Error", "raw": data}

        reply = data["choices"][0]["message"]["content"].strip()
        return {"reply": reply}

    except Exception as e:
        return {"reply": f"⚠ Backend Error: {str(e)}"}
