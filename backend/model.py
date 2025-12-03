import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# ------------------------------------------------------------
# TinyLlama Model (Fast + Stable)
# ------------------------------------------------------------
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

print("🚀 Loading Galaxy AI Model... Please wait...")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    use_fast=True
)

# Auto device selection (GPU → CPU)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"💻 Device: {device}")

# Load model
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    device_map="auto" if device == "cuda" else None
)

# Move model to CPU manually if no GPU
if device == "cpu":
    model = model.to(device)

print("✅ Model Loaded Successfully!")


# ------------------------------------------------------------
# FAST GENERATION FUNCTION
# ------------------------------------------------------------
def generate_reply(prompt: str) -> str:
    """Generate fast, clean reply"""

    # Tokenize with correct device
    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    # Generation
    output = model.generate(
        **inputs,
        max_new_tokens=200,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        repetition_penalty=1.1,
        eos_token_id=tokenizer.eos_token_id
    )

    reply = tokenizer.decode(output[0], skip_special_tokens=True)

    # Remove prompt from reply
    if reply.startswith(prompt):
        reply = reply[len(prompt):].strip()

    return reply
