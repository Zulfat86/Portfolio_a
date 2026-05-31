# Zulfat Khamis — Portfolio

**Frontend** (Vercel) + **Backend** (Render/FastAPI + Resend email)

## Project Structure
```
portfolio_a/
├── frontend/          ← Static site — deploy to Vercel
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js     ← Set PROD_API_URL after backend is live
│   ├── images/
│   └── vercel.json
├── backend/           ← FastAPI API — deploy to Render
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml
├── .gitignore
└── README.md
```

## Deploy Backend → Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service** → connect your repo.
3. Set **Root Directory** = `backend`
4. Runtime: **Python 3**, Build: `pip install -r requirements.txt`, Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables (optional — defaults already set in `main.py`):

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | `re_SogjFfPv_ABwHCZBDbCZ82Hs4U8RvTJER` |
| `CONTACT_TO` | `zulfatkhamis7@gmail.com` |
| `CONTACT_FROM` | `Portfolio <onboarding@resend.dev>` |
| `ALLOWED_ORIGIN` | `https://your-site.vercel.app` |

6. After deploy, copy the URL (e.g. `https://portfolio-api.onrender.com`).

## Update Frontend with Backend URL

Open `frontend/js/main.js` and change line 3:
```js
const PROD_API_URL = "https://YOUR-SERVICE-NAME.onrender.com/api/contact";
```
Commit & push — Vercel auto-redeploys.

## Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
2. Set **Root Directory** = `frontend`
3. Framework: **Other** | Build Command: *(leave empty)* | Output: `.`
4. Deploy.

## Run Locally
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000

# Frontend (in a separate terminal)
cd frontend
python -m http.server 5500
# → http://localhost:5500
```
