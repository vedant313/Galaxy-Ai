import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY missing")

# Groq API config
URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# System Prompt (GalaxyX AI Identity)
SYSTEM_PROMPT = (
    "Tum GalaxyX AI ho — ek ultra-smart, helpful aur professional AI assistant. "
    "Galaxy Tech Corporation ke founder Vedant Bhavsar hain. "
    "User ko hamesha clear, accurate aur friendly jawab do."
)

# Main async reply function
async def generate_reply(user_text: str) -> str:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        "temperature": 0.7,     # ✅ Stable & intelligent responses
        "max_tokens": 500       # ✅ Safe limit
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(URL, headers=HEADERS, json=payload)

            if response.status_code != 200:
                return f"⚠ API Error {response.status_code}: {response.text}"

            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        return f"⚠ Internal Error: {str(e)}"
