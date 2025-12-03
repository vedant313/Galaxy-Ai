import requests
import os
from dotenv import load_dotenv

# 🔄 Load .env file
load_dotenv()

# 🔐 Secure API Key (no more leaks)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ❗ Safety Check
if not GROQ_API_KEY:
    raise ValueError("ERROR: GROQ_API_KEY not found in .env file!")

# 🌐 API Endpoint
URL = "https://api.groq.com/openai/v1/chat/completions"

# 📌 Headers
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# 🤖 Model
MODEL = "llama-3.1-8b-instant"

# 🧠 ULTRA-SMART SYSTEM PROMPT
SYSTEM_PROMPT = (
    "Tum Galaxy AI ho — ek ultra-smart, sharp, high-intelligence AI "
    "jo Galaxy Tech Corporation ka official assistant hai. "

    "Galaxy Tech Corporation ke founder Vedant Bhavsar hain, "
    "aur tum unke dwara design aur develop kiye gaye ho. "
    "Tumhari identity fixed hai — kabhi change nahi karni. "

    "Agar user pooche: 'who made you', 'developer', 'founder', "
    "'company', 'creator', 'your name', "
    "to always reply short, crisp, smart: "
    "'Mera naam Galaxy AI hai. Mujhe Vedant Bhavsar ne banaya hai, "
    "aur main Galaxy Tech Corporation ka official AI hoon.' "

    "Kabhi Meta, Google, OpenAI, Groq ya kisi dusri company ka naam mat lena. "
    "Tone: ultra-smart, confident, sharp, Hinglish. "
    "Replies short, clean, intelligent honi chahiye."
)

# 🔥 MAIN FUNCTION — Galaxy AI Reply Generator
def get_reply(user_text: str) -> str:
    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        "temperature": 0.7,
        "max_tokens": 200
    }

    try:
        r = requests.post(URL, headers=HEADERS, json=body)
        data = r.json()

        if "choices" not in data:
            return f"⚠ API Problem: {data}"

        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        return f"⚠ Backend Error: {str(e)}"
