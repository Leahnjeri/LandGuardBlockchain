#  Land Verification System

Quick starter for the **Land Verification System** backend (Python + PostgreSQL + Ethereum planned).  
This project includes minimal files for sign-up, login (JWT), land storage, land search and land ownership transfer.

---

## 🚀 Quick Start (Windows)

```bash
cd backend
npm install
copy .env.example .env
# edit .env to match your database credentials
npm start
```

## 🐧 Quick Start (macOS / Linux)

```bash
cd backend
npm install
cp .env.example .env
# edit .env to match your database credentials
npm start
```

---

## 📦 Project Structure

```
backend/
│── app/
│   ├── api/routes/
│   ├── crud/
│   ├── models/
│   └── schemas/
frontend/
│── src/
│   ├── pages/
│   ├── components/
│   └── utils/
```

---

## 📌 Features

- 🔐 **User authentication** (signup & login)
- 🏞 **Manage land records** (location, size, land ID)
- 🔁 **Transfer land ownership**
- 🗄 **PostgreSQL database**
- 🔗 **Ethereum smart contract logic (planned)**

---

## 🔧 Tech Stack

### Backend
- Python    
- JWT Authentication  
- PostgreSQL  

### Frontend
- React  
- Tailwind CSS
- javascript 

### Blockchain (Coming Soon)
- Ethereum  
- Solidity  
- Ethers.js  

---

## 📝 Environment Variables

Create a `.env` file:

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/landdb
JWT_SECRET=your-secret-key
```

---

## ▶ Running the Server

```bash
npm start
```

---

## 📡 API Endpoints

```
POST /api/auth/signup
POST /api/auth/login
GET  /api/lands
POST /api/lands/add
POST /api/lands/transfer
```

---

## 📄 Documentation

Backend Docs (planned):

```
http://localhost:5000/api/docs
```

---

## 🔮 Future Improvements

- Full blockchain integration  
- Admin verification dashboard  
- GIS map support  
- Document storage with IPFS  
- QR code land verification  

---

## 👤 Author

**Kaburu Leah**
