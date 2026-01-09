# ❤️ NepaliLove

*Connecting Hearts, Empowering Love, Building Futures*

---

## 📚 Table of Contents

- [📖 Overview](#-overview)
- [🚀 Getting Started](#-getting-started)
  - [🧰 Prerequisites](#-prerequisites)
  - [⚙️ Installation](#️-installation)
  - [▶️ Usage](#️-usage)
  - [🧪 Testing](#-testing)
- [✨ Features](#-features)
- [🧱 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🔝 Return to Top](#️-nepalilove)

---

## 📖 Overview

**NepaliLove** is a full-stack real-time dating application tailored for Nepali users. It provides secure login, Tinder-style profile swiping, real-time chat, profile preferences, and beautiful responsive design using modern technologies.

Built with:
- React (Vite + Hooks)
- Tailwind CSS
- Express.js + WebSockets
- PostgreSQL
- TypeScript
- Replit Auth
- JSON-based demo logic

---

## 🚀 Getting Started

### 🧰 Prerequisites

Before installation, make sure you have:

- [Node.js](https://nodejs.org/en/) (v16+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/)
- Git

### ⚙️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Bipinmahat1/NepaliLove.git
cd NepaliLove
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory and add (example values in `.env.example`):

```env
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
SESSION_SECRET=a-long-random-string
# Optional (only if using Replit OIDC locally)
REPLIT_DOMAINS=localhost
ISSUER_URL=https://replit.com/oidc
REPL_ID=your-replit-client-id
NODE_ENV=development
PORT=5000
```
🔒 Replace values with your actual DB credentials and secret key. Do **not** commit this file; `.env` is now ignored by Git.

4. **Start the Database (if needed):**
```bash
npm run db:push
```

▶️ Usage
To start the app in development (server + client served together):

```bash
npm install
npm run dev
# open http://localhost:5000 (server serves both API and client in dev)
```

Build for production (client is built with Vite and a server bundle is produced):

```bash
npm run build
npm run start
# server will serve built client from `dist/public` (default port 5000)
```

Type checking:

```bash
npm run check
```

Database migrations (uses drizzle-kit):

```bash
npm run db:push
```

✨ Features

🔐 OTP Auth using phone/email

📸 Upload 5 photos + 1 video

🎴 Tinder-style swipe with animations

💬 Real-time chat (WebSocket)

👤 Profile + bio editing

🔍 Match only with preferred gender

📱 Mobile-first design (Tailwind)

🧪 Seeded demo users for preview

---

## ⚠️ Security notes

- WebSocket connections are required to present a session cookie to connect; however, the server currently performs a basic presence check only — consider adding full session validation on the upgrade to authenticate connections and scope broadcasts to conversations.
- Uploaded files are stored in `uploads/` and served statically. Multer currently filters by MIME type only — validate file signatures and add access control for sensitive files before relying on public URLs.


🧱 Project Structure
```bash
NepaliLove/
├── client/                # Frontend (React)
│   ├── pages/
│   ├── components/
│   └── hooks/
├── server/                # Backend (Express)
│   ├── routes/
│   └── storage.ts
├── shared/                # DB schema
├── uploads/               # User uploads
├── .env.example
├── README.md
├── package.json
```


🤝 Contributing

Fork the repo

Create a feature branch: git checkout -b feature/new-feature

Commit changes: git commit -m "Added new feature"

Push to GitHub: git push origin feature/new-feature

Open a pull request 🚀


### 🔝 [Return to Top](#installation)


The app is almost ready now.

