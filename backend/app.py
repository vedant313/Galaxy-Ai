from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.chat import generate_reply   # ✅ Correct async function

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
# CHAT ROUTE (MAIN)
# ----------------------------
@app.post("/chat")
async def chat(req: ChatRequest):
    user_msg = req.text

    # ⛔ generate_reply ASYNC hai → await zaroori
    reply = await generate_reply(user_msg)

    return {"reply": reply}
