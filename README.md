# RedFlow
> **A Secure Blood Supply Ecosystem with Decentralized Donor Verification and Traceability**

RedFlow is a role-based blood bank management platform that verifies donors safely, tracks blood units with QR codes, runs on a hybrid database + blockchain architecture, and demonstrates tamper-evident audit records.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18 + Vite + React Router DOM + Axios + qrcode + ethers v6
- **Backend:** Node.js + Express + jsonwebtoken + bcryptjs + mongoose + dotenv + ethers v6 + cors
- **Database:** MongoDB (local: `mongodb://127.0.0.1:27017/redflow`)
- **Blockchain (Dev):** Ganache GUI / CLI at `http://127.0.0.1:7545` (Chain ID `5777`)
- **Smart Contracts:** Solidity `0.8.20` + Hardhat + `@nomicfoundation/hardhat-toolbox`
- **Design System:** RedFlow Design Language (RDL) with 8px spatial grid, high-contrast palette, and responsive UI.

---

## 📁 Repository Structure

```
RedFlow/
├── backend/            # Express REST API, MongoDB models, Blockchain service
├── blockchain/         # Hardhat project, Solidity contracts, Deployment scripts
├── frontend/           # React 18 SPA, QR verification portal, Dashboards
├── package.json        # Monorepo root workspace orchestrator
└── README.md
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18 or later
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017`
- **Ganache**: Running locally at `http://127.0.0.1:7545` with Network ID `5777`

### 2. Installation
Install all dependencies across workspaces from the root directory:
```bash
npm install
```

### 3. Deploy Smart Contracts
Ensure Ganache is running on port 7545, then run:
```bash
npm run compile:contracts
npm run deploy:contracts
```
*Copy the printed contract address and ensure it is placed in `backend/.env` and `frontend/.env`.*

### 4. Seed Database (Optional / Demo)
```bash
npm run seed
```

### 5. Run the Application
```bash
npm run dev
```
- Backend API will start at: `http://localhost:5000`
- Frontend Portal will start at: `http://localhost:5173`
- Public Blood Unit Verification Route: `http://localhost:5173/verify/:unitId`
