# 🎓 ExamCraft PRO - AI-Powered MCQ Mock Test Platform

ExamCraft PRO is a modern, responsive, full-stack web application designed for competitive exams (JEE, NEET, UPSC, SSC, Banking, etc.). It enables educators and administrators to convert uploaded MCQ question papers (PDF, DOCX, TXT) and answer keys into interactive digital examinations with real-time test palettes, countdown timers, custom marking schemes, and Gemini AI-driven analytical insights.

---

## 🌟 Key Features

- 🤖 **Gemini 3.6 Flash Multimodal PDF Parser**: Intelligently extracts complex questions, multi-paragraph comprehension stems, assertion-reason items, formulas, and 4 options without premature truncation.
- ⚡ **Heuristic Fallback Engine**: Local regex-based parser when working offline or without API credits.
- ⏱️ **Full-Screen Exam Engine**:
  - Customizable countdown timers (unlimited, up to 180+ minutes).
  - NTA/CBT-style interactive question palette (Answered, Not Answered, Marked for Review, Visited/Not Visited).
  - Comprehensive question navigation, shuffle support, and auto-save on answer selection.
- 📊 **Instant Evaluation & AI Insights**:
  - Real-time score calculation with positive, negative, and unanswered marking rules.
  - Accuracy percentage, question-by-question review with color-coded badges, and Gemini AI recommendations for weak areas.
- 👥 **Multi-Tier Role-Based Access Control (RBAC)**:
  - 👑 **Super Administrator**: Complete platform governance, manage admins and students, create global exam sections, and audit all tests.
  - 🏫 **Administrator**: Manage coaching institutes, create & publish mock tests, track student enrollments, and view student attempt analytics.
  - 🎓 **Student / User**: Take mocks, view detailed performance breakdowns, and analyze mock history.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Framer Motion
- **Database**: Embedded SQLite via Node 22 (`node:sqlite` DatabaseSync) with WAL mode & foreign keys
- **AI Engine**: Google Gemini API (`gemini-3.6-flash`)
- **Authentication**: JWT Cookies & Bcrypt Password Hashing
- **Deployment**: Docker, Railway, Render

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+ or Node.js 22
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Uday011/Mock-Test.git
cd Mock-Test

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Cloud Deployment (24/7 Access Anywhere)

ExamCraft PRO is containerized with a production-ready `Dockerfile` and persistent SQLite volume support.

### Deploy on Railway (Recommended)

1. Sign up/log in to [Railway.app](https://railway.app/) using GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"** -> Select **`Mock-Test`**.
3. Go to **Variables** and add:
   - `GEMINI_API_KEY`: *(Your Gemini API Key)*
   - `JWT_SECRET`: *(A random 32-character string)*
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
4. Go to **Volumes** -> Click **"Add Volume"**:
   - Mount Path: `/app/data` (This keeps all exams, user accounts, and attempts saved permanently).
5. In **Settings** -> **Networking**, click **"Generate Domain"**.
6. Your mock test platform is live!

### Deploy on Render

1. Sign up/log in to [Render.com](https://render.com/).
2. Click **"New +"** -> **"Web Service"** -> Connect your GitHub repo.
3. Select **Docker** environment.
4. Add Environment Variables:
   - `GEMINI_API_KEY`: *(Your Gemini API Key)*
   - `JWT_SECRET`: *(A random string)*
5. Under **Disks**, add a persistent disk:
   - Mount Path: `/app/data`
   - Size: `1 GB`
6. Click **"Create Web Service"**.

---

## 🛡️ Default Roles & Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@examcraft.pro` | `Admin@123` |
| **Admin** | `admin@coaching.com` | `Admin@123` |
| **Student** | `student@example.com` | `Student@123` |

---

## 📄 License
MIT License. Built with ❤️ for educators and students.
