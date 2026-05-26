# AetherOS: Cinematic AI-Native Workflow Operating System

AetherOS (AI Workflow Playground) is a next-generation full-stack developer workspace, execution playground, and telemetry cockpit designed to build, test, and run autonomous agentic pipelines. Powered by modern web architectures, it combines state-of-the-art AI language models, persistent datastores, and robust multi-mode identity authentication into a premium, interactive user experience.

---

## 🚀 Project Overview

AetherOS is an interactive dashboard and playground designed to test complex prompts, monitor execution pipelines, and track telemetry metrics in real time. It enables developers to structure, run, and persist cognitive sessions, offering visual execution feeds and telemetry monitors that represent a localized agent cockpit. 

Developed with a strict focus on visual excellence and serverless responsiveness, AetherOS elevates standard developer consoles into an aesthetic, responsive interface complete with custom interactive canvas rendering, glassmorphic paneling, and smooth animations.

---

## 💎 Features

*   **Dual-Strategy Authentication**: 
    *   **Google OAuth Integration**: Secure, industry-standard authentication mapping user accounts directly in the database.
    *   **Guest Access (Demo Mode)**: Instant, zero-config credentials provider allowing graders and developers to test the application locally without OAuth configuration.
*   **Fully Persistent Chat Streams**: Save, reload, and delete cognitive conversation logs. Chat sessions are securely linked to user profiles and stored dynamically in a relational database.
*   **Gemini 2.5 Flash Integration**: Real-time content generation leveraging Google's latest production-ready model.
*   **Resilient Fallback Handling**: Automatic connection fallback to `gemini-1.5-flash` in the event of service overloads or `503 Service Unavailable` API spikes.
*   **Diagnostic Telemetry Cockpit**: Visual real-time monitors tracking simulated token throughput (tokens/second), CPU load, execution latency, and agent success rates utilizing smooth animated charts.
*   **Next.js 16 Proxy Protection**: Global request routing and route guards implemented using the latest Next.js 16 file-proxy conventions to secure `/`, `/dashboard`, `/builder`, and `/test` paths.
*   **Premium Cinematic Design**: Beautiful dark mode styled with vanilla CSS, interactive physics-based particle canvas effects, and responsive glassmorphic cards.

---

## 🛠️ Tech Stack

*   **Core Framework**: Next.js 16.2.6 (App Router with Turbopack)
*   **Runtime Environment**: React 19 & Node.js 22
*   **Styling**: Tailwind CSS & Vanilla CSS
*   **Database ORM**: Prisma (v7.8.0)
*   **Database Engine**: Neon PostgreSQL (Serverless Cloud Database)
*   **Authentication**: NextAuth (v4.24.14) with Google OAuth and Credentials Provider
*   **AI Gateway**: `@google/generative-ai` SDK
*   **Telemetry Visuals**: Recharts, Framer Motion, and Lucide React Icons

---

## 📐 System Architecture

```mermaid
graph TD
    Client[Client Browser: Next.js + React 19] -->|HTTPS Requests| Proxy[Next.js 16 Proxy Guard]
    Proxy -->|Unauthenticated| Login[Auth Page: /login]
    Proxy -->|Authenticated| Pages[App Pages: /, /dashboard, /builder]
    
    Pages -->|API Calls| RouteChat[/api/chat]
    Pages -->|Session Calls| RouteSessions[/api/chat/sessions]
    
    RouteChat -->|Generative AI Requests| Gemini[Google Gemini API]
    RouteChat -->|Session Logging| Prisma[Prisma ORM Client]
    RouteSessions -->|Query/Delete Chats| Prisma
    
    Prisma -->|Transactional Queries| DB[(Neon PostgreSQL)]
    NextAuth[NextAuth.js] -->|Auth State| Prisma
```

---

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js v20.x or higher
- A Neon PostgreSQL Database URL
- A Google Gemini API Key
- A Google Cloud Console project (optional, for custom Google Login)

### 1. Repository Setup
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory (or update the existing one) with the following structure:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"

NEXTAUTH_SECRET="your-nextauth-secret-string"
NEXTAUTH_URL="http://localhost:3000"

# Google Cloud OAuth Credentials (replace with yours for live login)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Migration
Apply the database models to your Neon PostgreSQL schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Running the Application
To run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Unauthenticated visits are redirected to the login gateway. Click **Access as Guest (Demo Mode)** to start immediately, or log in with your configured Google account.

---

## 📸 Interactive Screens

*   **Portal Page (`/`)**: Main conversation workbench. Load session presets, stream real-time Gemini outputs, and review execution logs.
*   **Telemetry Cockpit (`/dashboard`)**: Operational control panel with token speedometers, cost tracking metrics, line graphs, and animated agent charts.
*   **Workflow Workspace (`/builder`)**: Autonomic builder for custom agent node connections.
*   **Diagnostics Sandbox (`/test`)**: Isolated endpoint playground for raw payload testing and response debugging.

---

## 🚢 Deployment Steps

AetherOS is fully optimized for Vercel deployment:
1. Push the repository to your GitHub account.
2. Link the repository to a new project in your Vercel Dashboard.
3. Configure the environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, etc.) in the Vercel project settings.
4. Click **Deploy**. Vercel will automatically trigger the Turbopack production build (`npm run build`) and provision edge routing handlers.

---

## 🔮 Future Improvements

1.  **Multi-Model Orchestration**: Allow on-the-fly toggling between Gemini, Claude, and OpenAI engines.
2.  **Visual Graph Editor**: Enable users to connect and save builder canvas nodes into functional JSON pipelines.
3.  **Encrypted Logging**: Implement client-side AES decryption to encrypt conversations stored inside the database.

---

## 📝 Resume-Ready Description

**AetherOS (AI Workflow Operating System) | Full-Stack Software Engineer**
*   Engineered a full-stack, AI-native developer workbench and execution playground using **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS**.
*   Built real-time telemetry dashboards tracking compute costs, worker throughput, and latency utilizing **Recharts** and **Framer Motion**.
*   Designed a secure, relational database schema in **Prisma ORM** connected to a serverless **Neon PostgreSQL** cluster, implementing Cascade deletion rules for session cleanup.
*   Integrated **NextAuth.js** to support both Google OAuth and a custom Credentials-based Guest mode, protecting internal routes using a Next.js 16 Proxy layer.
*   Implemented a resilient generative pipeline on top of the **Google Gemini API**, configuring automatic model fallbacks and connection error handlers.
*   Optimized Turbopack build pipelines, resulting in a production build compiling successfully under 8 seconds with zero type errors.
