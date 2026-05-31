"""
Portfolio Backend — FastAPI + Resend
────────────────────────────────────
Deploy to Render (Root Directory: backend)
  Build:  pip install -r requirements.txt
  Start:  uvicorn main:app --host 0.0.0.0 --port $PORT

Required environment variable on Render:
  RESEND_API_KEY   → your Resend API key  (re_...)

Everything else is hardcoded below — change as needed.
"""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────

RESEND_API_KEY = os.environ["RESEND_API_KEY"]          # required — set on Render
CONTACT_TO     = "zulfatkhamis7@gmail.com"
CONTACT_FROM   = "onboarding@resend.dev"
ALLOWED_ORIGIN = "https://vercel.com/zulfat-s-projects/portfolio-a"      # your Vercel URL
RESEND_URL     = "https://api.resend.com/emails"
REQUEST_TIMEOUT = 15  # seconds


# ─────────────────────────────────────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN, "http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMA
# ─────────────────────────────────────────────────────────────────────────────

class ContactMessage(BaseModel):
    name:    str      = Field(min_length=1, max_length=120)
    email:   EmailStr
    message: str      = Field(min_length=1, max_length=5000)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "portfolio-api"}


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/contact")
async def send_contact(msg: ContactMessage):
    html = f"""
    <div style="font-family:Inter,Arial,sans-serif; background:#0c0f17; color:#e6e8ee;
                padding:28px; border-radius:12px; max-width:600px;">
      <h2 style="color:#7c5cff; margin:0 0 16px;">New portfolio message</h2>
      <p style="margin:0 0 4px;"><strong>From:</strong> {msg.name}</p>
      <p style="margin:0 0 16px;"><strong>Reply to:</strong> {msg.email}</p>
      <hr style="border:none; border-top:1px solid #2a2d3a; margin:0 0 16px;" />
      <p style="white-space:pre-wrap; line-height:1.75; margin:0;">{msg.message}</p>
    </div>
    """

    payload = {
        "from":     CONTACT_FROM,
        "to":       [CONTACT_TO],
        "reply_to": msg.email,
        "subject":  f"[Portfolio] Message from {msg.name}",
        "html":     html,
    }

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(
                RESEND_URL,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type":  "application/json",
                },
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Email service timed out")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Network error: {exc}")

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Resend error {response.status_code}: {response.text}",
        )

    return {"success": True, "id": response.json().get("id")}


# ─────────────────────────────────────────────────────────────────────────────
# LOCAL DEV
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
