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
Create a .env file in the root directory and add:
<pre> env DATABASE_URL=your_postgres_connection_string JWT_SECRET=your_secret_key PORT=4000  </pre>
🔒 Replace values with your actual DB credentials and secret key.

4. **Start the Database (if needed):**
```bash
npm run db:push
```

▶️ Usage
To start the app:
```bash
# Start backend
npm run dev:server

# In a separate terminal, start frontend
npm run dev:client
Visit http://localhost:5173 to use the app.
```

🧪 Testing
Run the tests with:
```bash
npm test
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




