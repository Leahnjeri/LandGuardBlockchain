Land Verification & Ownership Transfer System (React + FastAPI + PostgreSQL)

A full-stack web system for verifying land ownership, managing properties, and transferring land ownership securely.
Built with React (frontend), FastAPI (backend), PostgreSQL, TailwindCSS, JWT Authentication, and CesiumJS for geospatial rendering.

🚀 Features

🔐 User Authentication (JWT)

📍 Add & manage land properties

🛰 View land boundaries using CesiumJS (3D globe)

🔁 Transfer ownership to another registered user

📄 Upload land documents (title deed, ID, etc.)

🌍 Automatic location extraction from coordinates

📬 Email notifications (optional)

🗄 PostgreSQL database with migrations

⚡ FastAPI backend with REST API routes

🛠 Technologies Used
Frontend

React (Vite)

TailwindCSS

CesiumJS

JWT-based auth

Backend

FastAPI

PostgreSQL

SQLAlchemy

Alembic migrations

Python

⚡ Quick Start — Frontend (React)
Windows / macOS / Linux
# Navigate to project folder
cd landchain_frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start server
npm run dev


Frontend runs on:

👉 http://localhost:5173/

⚡ Quick Start — Backend (FastAPI)
Windows
py -3.11 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Update database credentials in .env
alembic upgrade head
uvicorn app.main:app --reload

macOS / Linux
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Update database credentials in .env
alembic upgrade head
uvicorn app.main:app --reload


Backend docs open at:

👉 http://127.0.0.1:8000/docs

🗂 Project Structure
Frontend
src/
 ├── pages/
 ├── components/
 ├── api/
 ├── hooks/
 └── styles/

Backend
app/
 ├── routers/       # API routes
 ├── models/        # Database models
 ├── schemas/       # Pydantic schemas
 ├── services/      # Business logic
 ├── core/          # Settings, auth
 └── database.py

🔌 Environment Variables
Frontend .env
VITE_API_URL=http://127.0.0.1:8000
VITE_CESIUM_TOKEN=your_token_here

Backend .env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/landchain
JWT_SECRET=your_secret

📦 Run PostgreSQL (Optional Using Docker)
docker run --name landchain-db -e POSTGRES_PASSWORD=1234 -p 5432:5432 -d postgres

📚 API Documentation

FastAPI Swagger UI:
👉 http://127.0.0.1:8000/docs

🧪 Testing
pytest

🙌 Contributing

Pull requests are welcome!
Please ensure code is clean and documented.

📄 License

MIT License.
