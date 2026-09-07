# AI Resume Analyzer & Job Matcher

A production-style full-stack web application where users upload a resume (PDF/DOCX), get an automated ATS-style score and skill breakdown, browse job postings, and see a resume-to-job match score combining skill overlap and semantic similarity. AI-powered features (summaries, improvement suggestions, interview prep) run through a pluggable AI service layer with a rule-based fallback when no LLM API key is configured.

## Features

- JWT authentication (register/login/refresh/logout) with role-based access (`user` / `admin`)
- Resume upload with PDF/DOCX parsing (`pypdf`, `python-docx`)
- Deterministic skill extraction with synonym normalization (e.g. "Postgres" → "PostgreSQL")
- ATS-style scoring across skills, keywords, experience, projects, education, certifications, completeness
- Job CRUD (admin-only writes) with search/filter
- Matching engine: `final_score = skill_score * 0.60 + semantic_score * 0.40` (weights configurable in settings)
- Semantic similarity via TF-IDF + cosine similarity, isolated behind a `SemanticMatcher` class so it can be swapped for `sentence-transformers` embeddings later without touching the rest of the matching code
- AI service layer (LLM-agnostic, defaults to Anthropic Messages API) for resume summaries, improvement suggestions, job description analysis, and interview question generation — degrades gracefully to clearly-labeled rule-based output if `AI_API_KEY` is unset
- React + Vite + Tailwind dashboard: resumes, jobs, matches, profile, admin panel

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, Tailwind CSS, Recharts
**Backend:** Django, Django REST Framework, Simple JWT, Django ORM
**Database:** PostgreSQL
**Resume Parsing:** pypdf, python-docx
**Dev Tools:** Docker, Git, `.env` config

## Architecture

```
backend/
  config/       # settings, root urls
  users/        # custom User model, JWT auth endpoints
  resumes/      # upload, parsing, skill extraction, ATS scoring
  jobs/         # job postings CRUD
  matching/     # matching engine (skill + semantic scoring)
  ai/           # LLM service layer + prompt templates
  common/       # shared permissions, error handling

frontend/
  src/
    api/        # axios instance with JWT refresh interceptor
    context/    # AuthContext
    components/ # Navbar, ProtectedRoute, StatCard
    pages/      # route-level pages
```

## Getting Started

### 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # then fill in your DB credentials, SECRET_KEY, etc.

# Make sure PostgreSQL is running and the database in .env exists, e.g.:
# createdb resume_analyzer

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env           # VITE_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Or run everything with Docker

```bash
docker-compose up --build
```

This starts PostgreSQL, the Django backend, and the Vite dev server together.

## Environment Variables

See `backend/.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key — generate a real one for anything beyond local dev |
| `DB_*` | PostgreSQL connection details |
| `AI_API_KEY` | Optional. Enables AI-powered summaries/suggestions. Without it, the app uses rule-based fallback text. |
| `MAX_RESUME_SIZE_MB` | Upload size limit, default 5MB |

**Never commit `.env` files** — `.gitignore` already excludes them.

## API Overview

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/refresh/
POST   /api/auth/logout/
GET    /api/auth/profile/
PUT    /api/auth/profile/

GET    /api/resumes/
POST   /api/resumes/upload/
GET    /api/resumes/<id>/
DELETE /api/resumes/<id>/
POST   /api/resumes/<id>/analyze/

GET    /api/jobs/
POST   /api/jobs/            (admin only)
GET    /api/jobs/<id>/
PUT    /api/jobs/<id>/       (admin only)
DELETE /api/jobs/<id>/       (admin only)

GET    /api/matching/<resume_id>/<job_id>/
GET    /api/matching/<resume_id>/

POST   /api/ai/resume-summary/
POST   /api/ai/improvement/
POST   /api/ai/job-analysis/
POST   /api/ai/interview-questions/
```

All error responses follow a consistent shape:

```json
{ "success": false, "message": "...", "errors": {} }
```

## How Matching Works

1. **Skill match**: intersect the resume's extracted skills with the job's required skills → `matched / total_required * 100`.
2. **Semantic match**: cosine similarity between the resume's full extracted text and the job description (TF-IDF vectors). This catches phrasing differences a pure keyword match would miss (e.g. "built REST APIs using Django" vs. "backend APIs using Python frameworks").
3. **Final score**: weighted combination, `skill_score * 0.60 + semantic_score * 0.40` — both weights live in `settings.py`, not hardcoded in the algorithm.

The `SemanticMatcher` class in `matching/matcher.py` is deliberately isolated so the TF-IDF implementation can be swapped for real `sentence-transformers` embeddings later by changing one method.

## How the ATS Score Works

Weighted sum across 7 factors (skills 30%, keywords 20%, experience 15%, projects 15%, education 10%, certifications 5%, completeness 5%). This is an **application-generated score for feedback purposes only** — it is not an official ATS score from any commercial ATS product, and the UI labels it as such.

## Running Tests

```bash
cd backend
python manage.py test
```

Covers: registration/login flows, skill extraction + normalization, ATS scoring inputs, and the matching engine's skill/semantic scoring logic.

## Docker Setup

`docker-compose.yml` defines three services: `db` (PostgreSQL), `backend` (Django), `frontend` (Vite dev server). Run `docker-compose up --build` from the project root.

## Security Notes

- Passwords are hashed via Django's built-in `set_password` — never stored in plaintext.
- JWT auth via Simple JWT; access tokens short-lived (30 min), refresh tokens rotate.
- Role checks are enforced **server-side** (`IsAdminRole` permission class) — the frontend hiding an "Admin" link is not a security boundary.
- File uploads are validated for extension and size before being saved.
- All secrets load from `.env`, never hardcoded.

## Future Improvements

- OCR support for scanned/image-based PDFs
- Real sentence-transformers embeddings for semantic matching
- Resume version comparison view
- Celery-based async processing for large resume batches
- Admin analytics dashboard with Recharts visualizations (skill distribution, match trends)
- Token blacklist app enabled for true server-side JWT logout
