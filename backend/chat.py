import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY missing")

URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

SYSTEM_PROMPT = (
    "Tum Galaxy AI ho — ek ultra-smart Hinglish AI assistant. "
    "Galaxy Tech Corporation ke founder Vedant Bhavsar hain."
)

async def generate_reply(user_text: str) -> str:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        "temperature": 0.7,
        "max_tokens": 200
    }

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.post(URL, headers=HEADERS, json=payload)
            data = r.json()
            return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        return f"⚠ Error: {str(e)}"
