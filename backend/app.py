from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.chat import generate_reply  # Local Ollama + Dolphin3 function

app = FastAPI(
    title="GalaxyX AI Backend",
    description="Official backend for Galaxy Tech Corporation AI (Powered by Local Uncensored Dolphin 3.0 LLM)",
    version="2.0.0"
)

# ----------------------------
# CORS SETTINGS (Allow frontend from anywhere)
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

# ----------------------------
# HOME ROUTE
# ----------------------------
@app.get("/")
async def home():
    return {
        "status": "GalaxyX AI Backend Running Successfully 🚀",
        "developer": "Vedant Bhavsar",
        "company": "Galaxy Tech Corporation",
        "model_info": "Local Dolphin3 (Dolphin 3.0 Llama 3.1 8B - Fully Uncensored - No Limits 🔥)",
        "note": "Ollama server must be running with 'dolphin3' model pulled. Run 'ollama serve' in terminal."
    }

# ----------------------------
# MAIN CHAT ROUTE
# ----------------------------
@app.post("/chat")
async def chat(req: ChatRequest):
    user_msg = req.text.strip()

    # Empty message handle (funny Hindi reply)
    if not user_msg:
        return {
            "reply": "Arre bhai/behen, kuchh toh bol na... khali message bhej ke maze le raha hai kya? 😏"
        }

    # Call local Dolphin3 LLM
    reply = await generate_reply(user_msg)

    return {"reply": reply}