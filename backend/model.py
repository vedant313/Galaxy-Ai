import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# ------------------------------------------------------------
# TinyLlama Model (FAST + LIGHT + Stable)
# ------------------------------------------------------------
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

print("🚀 Loading GalaxyX AI Local Model...")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    use_fast=True
)

# Auto device selection
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

print(f"💻 Device Selected → {device.upper()}")

# Load model
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=dtype,
    device_map="auto" if device == "cuda" else None
)

# CPU fallback
if device == "cpu":
    model = model.to(device)

model.eval()

print("✅ Local Model Loaded Successfully!")


# ------------------------------------------------------------
# ULTRA-OPTIMIZED GENERATION FUNCTION
# ------------------------------------------------------------
def generate_reply(prompt: str) -> str:
    """
    Ultra-fast reply generator for GalaxyX AI local mode.
    Removes echo, cleans garbage tokens, improves quality.
    """

    # Encode user prompt
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    ).to(device)

    # Generate reply
    outputs = model.generate(
        **inputs,
        max_new_tokens=180,
        temperature=0.65,
        top_p=0.9,
        do_sample=True,
        repetition_penalty=1.12,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.eos_token_id
    )

    # Decode text
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Remove echoed prompt
    if text.startswith(prompt):
        text = text[len(prompt):].strip()

    # Clean unwanted tokens + junk text
    bad_tokens = [
        "<unk>", "<s>", "</s>", "###", 
        "User:", "Assistant:", "assistant", "user"
    ]

    for token in bad_tokens:
        text = text.replace(token, "")

    # Remove double spaces
    text = " ".join(text.split())

    return text.strip()
