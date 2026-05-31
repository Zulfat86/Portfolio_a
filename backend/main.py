"""
Portfolio backend — FastAPI + Resend
Deploy to Render. Optionally override via environment variables:
  RESEND_API_KEY   = your Resend API key
  CONTACT_TO       = recipient email
  CONTACT_FROM     = verified sender address
  ALLOWED_ORIGIN   = your Vercel frontend URL
"""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

# ── CONFIG ──────────────────────────────────────────────────────────────────
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "re_SogjFfPv_ABwHCZBDbCZ82Hs4U8RvTJER")
CONTACT_TO     = os.getenv("CONTACT_TO",     "zulfatkhamis7@gmail.com")
CONTACT_FROM   = os.getenv("CONTACT_FROM",   "Portfolio <onboarding@resend.dev>")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")

# ── APP ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ALLOWED_ORIGIN == "*" else [ALLOWED_ORIGIN],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ── SCHEMA ───────────────────────────────────────────────────────────────────
class ContactMessage(BaseModel):
    name:    str      = Field(min_length=1, max_length=120)
    email:   EmailStr
    message: str      = Field(min_length=1, max_length=5000)


# ── ROUTES ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "portfolio-api"}


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/contact")
async def send_contact(msg: ContactMessage):
    if not RESEND_API_KEY:
        raise HTTPException(status_code=500, detail="Email service not configured")

    html = f"""
    <div style="font-family:Inter,Arial,sans-serif;background:#0c0f17;color:#e6e8ee;
                padding:24px;border-radius:12px;max-width:600px;">
      <h2 style="color:#7c5cff;margin:0 0 16px;">New portfolio message</h2>
      <p><strong>From:</strong> {msg.name} &lt;{msg.email}&gt;</p>
      <hr style="border-color:#2a2d3a;margin:16px 0;"/>
      <p style="white-space:pre-wrap;line-height:1.7;">{msg.message}</p>
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
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                "https://api.resend.com/emails",
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

    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Resend error {r.status_code}: {r.text}")

    return {"success": True, "id": r.json().get("id")}


# ── LOCAL DEV ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
