Blockchain-Based Land Verification & Transfer System

A secure, transparent, and decentralized platform for verifying land ownership and transferring property using blockchain technology.

📌 Project Overview

This system solves the common challenges in land administration such as fraud, double ownership, and lost records.
By integrating blockchain (Ethereum) with a modern web platform, the system ensures that all land ownership data is immutable, verifiable, and securely stored.

Users can:
✔ Create accounts (Sign Up / Log In)
✔ View lands they own
✔ Transfer land ownership
✔ Verify land authenticity using blockchain
✔ Track transaction history transparently

🚀 Features
🔐 User Authentication

Secure Sign Up & Log In

Password hashing

Validation & protected API routes

🧾 Land Management

Add land parcels

View list of lands owned (location, size, and status)

Search & filter land records

🔁 Ownership Transfer

Initiate ownership transfer

Receiver verification

Smart contract interaction (Ethereum) — to be implemented

✔ Land Verification

Blockchain-based validation of land records

Prevents tampering & fraud

📊 Dashboard

Displays:

Land parcels owned

Parcel details

Status (verified / pending)

Suggested extra column: Land ID / Parcel Number

🏗 System Architecture
Frontend (React + Tailwind)
        |
Backend API (Node.js + Express)
        |
Database (PostgreSQL)
        |
Blockchain Layer (Ethereum Smart Contract) — pending

🛠 Tech Stack
Frontend

React.js

Tailwind CSS

React Router

Axios

Backend

Node.js

Express.js

JWT Authentication

bcrypt (password hashing)

Database

PostgreSQL

Prisma / Sequelize / Knex (any ORM you choose)

Blockchain (Upcoming)

Ethereum

Solidity Smart Contracts

Web3.js / Ethers.js

⚙️ Installation & Setup
1️⃣ Clone the project
git clone https://github.com/your-username/land-verification-system.git
cd land-verification-system

2️⃣ Backend Setup
cd backend
npm install

Environment variables (.env)
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/landdb
JWT_SECRET=your-secret-key

Run backend
npm start

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

📡 API Endpoints (Basic)
POST /api/auth/signup
POST /api/auth/login
GET  /api/lands
POST /api/lands/add
POST /api/lands/transfer


More will be added as the blockchain module is implemented.

🧱 Smart Contract (Planned)

Smart contract will handle:

Registering land on blockchain

Verifying ownership

Transferring ownership

Storing hashes of land records for immutability

📌 Future Improvements

Full Solidity smart contract completion

Real-time notifications

GIS Map integration (land boundaries on a map)

Admin Panel for verification

QR Code for land verification

IPFS storage for documents

👤 Author

Kaburu Leah
