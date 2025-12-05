from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.chat import generate_reply   # your AI text reply function
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# ----------------------------
# API KEYS
# ----------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ Missing GROQ_API_KEY in .env file")

WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
TTS_URL = "https://api.groq.com/openai/v1/audio/speech"

# ----------------------------
# FASTAPI APP
# ----------------------------
app = FastAPI(
    title="GalaxyX AI Backend",
    description="Official backend for Galaxy Tech Corporation AI",
    version="2.0.0"
)

# ----------------------------
# CORS SETTINGS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# REQUEST MODEL
# ----------------------------
class ChatRequest(BaseModel):
    text: str
    voice: str | None = "jarvis"   # ⭐ NEW: Voice selection support

# ----------------------------
# HOME ROUTE
# ----------------------------
@app.get("/")
async def home():
    return {
        "status": "GalaxyX AI Backend Running Successfully 🚀",
        "developer": "Vedant Bhavsar",
        "company": "Galaxy Tech Corporation"
    }

# ----------------------------
# MAIN CHAT ROUTE
# ----------------------------
@app.post("/chat")
async def chat(req: ChatRequest):
    user_msg = req.text
    reply = await generate_reply(user_msg)
    return {"reply": reply}

# ============================================================
# 🎤 SPEECH → TEXT (Groq Whisper)
# ============================================================
@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    try:
        file_bytes = await audio.read()

        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.post(
                WHISPER_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                files={"file": (audio.filename, file_bytes, audio.content_type)},
                data={"model": "whisper-large-v3"}
            )

        text = r.json().get("text", "")
        return {"text": text}

    except Exception as e:
        return {"error": str(e)}

# ============================================================
# 🔊 NEW ULTRA-NATURAL TTS (Groq AI Voices)
# ============================================================

VOICE_MAP = {
    "jarvis": "eleven_multilingual_v2",
    "friday": "eleven_english_v1",
    "neutral": "eleven_turbo_v1"
}

@app.post("/tts")
async def text_to_speech(req: ChatRequest):
    text = req.text
    voice = req.voice or "jarvis"
    voice_model = VOICE_MAP.get(voice, VOICE_MAP["jarvis"])

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post(
                TTS_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": voice_model,
                    "input": text
                }
            )

        return StreamingResponse(
            res.aiter_bytes(),
            media_type="audio/mpeg"
        )

    except Exception as e:
        return {"error": str(e)}
