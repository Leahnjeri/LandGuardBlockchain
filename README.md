Land Verification & Ownership Transfer System

A web-based system for verifying land ownership, managing properties, and transferring ownership securely. The platform enables users to register land, access verification data, view property details, transfer ownership, and interact with geospatial data.

🚀 Features
🔍 Land Verification

Verify land ownership using title numbers

View owner information, property details, and boundary coordinates

CesiumJS-powered geographic visualization

📄 Property Management

View all owned properties

Automatic geolocation lookups (Latitude/Longitude → Real-world address)

Track verification status, size, and metadata

🔗 Ownership Transfer

Secure land transfer to new owners

Email-based recipient identification

Backend validation and audit logs

🗺 Geospatial Support

3D land visualization with CesiumJS

Automatic mock boundary generation

Coordinates stored in PostgreSQL

🔐 Secure Authentication

Login/Signup using JWT

Protected API routes

Role-based access (Owner, Admin in future versions)

🛠 Tech Stack
Frontend

React

TailwindCSS

CesiumJS

Fetch API / REST

Backend

FastAPI (Python)

PostgreSQL

SQLAlchemy

JWT Authentication

📂 Project Structure (Simplified)
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── crud/
│   │   └── db/
│   └── main.py
│
└── README.md

⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

🖥 Frontend Setup (React)
cd frontend
npm install
npm run dev

🐍 Backend Setup (FastAPI)
Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

Install dependencies
pip install -r requirements.txt

Run FastAPI
uvicorn app.main:app --reload

🗄 Database (PostgreSQL)
Create database manually or via CLI:
CREATE DATABASE land_system;


Environment variables (example):

DATABASE_URL=postgresql+asyncpg://user:password@localhost/land_system
SECRET_KEY=your_jwt_secret

🔐 Authentication Flow

User signs up / logs in

Backend issues a JWT

React stores token in localStorage

Protected API endpoints require the token

📌 API Endpoints (Important)
🔸 Verify land
GET /lands/verify/{title_number}

🔸 Get current user's lands
GET /lands/my-lands

🔸 Transfer ownership
POST /lands/transfer

📜 License

This project is licensed under the MIT License — you may modify and distribute freely.

🙌 Author

Leah Kaburu
Land Verification & Ownership Transfer System