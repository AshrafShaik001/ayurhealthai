# 🛠 Complete Setup Guide

> This guide walks you through every step required to get AyurHealthAI running — from creating a GitHub repository to configuring MongoDB Atlas and running the project locally.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [GitHub Repository Setup](#2-github-repository-setup)
3. [MongoDB Atlas Setup](#3-mongodb-atlas-setup)
4. [Anthropic API Key](#4-anthropic-api-key)
5. [Generate a JWT Secret](#5-generate-a-jwt-secret)
6. [Clone & Install the Project](#6-clone--install-the-project)
7. [Configure Environment Variables](#7-configure-environment-variables)
8. [Run Locally](#8-run-locally)
9. [Verify Everything Works](#9-verify-everything-works)
10. [Common Problems & Fixes](#10-common-problems--fixes)

---

## 1. Prerequisites

Install the following tools before you begin:

| Tool | Minimum Version | Download |
|---|---|---|
| **Node.js** | 18.0.0 | https://nodejs.org (choose LTS) |
| **npm** | 9.0.0 | Included with Node.js |
| **Git** | 2.x | https://git-scm.com |

Verify your installations:

```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
git --version    # should print git version 2.x.x
```

---

## 2. GitHub Repository Setup

### 2.1 Create a GitHub Account

If you do not already have one, go to https://github.com/signup and create a free account.

### 2.2 Create a New Repository

1. Log in to GitHub and click the **+** icon in the top-right corner
2. Select **New repository**
3. Fill in the details:
   - **Repository name:** `ayurhealthai` (or any name you prefer)
   - **Description:** `AI-Powered Ayurvedic Wellness Platform`
   - **Visibility:** Public or Private (your choice)
   - ❌ Do **not** initialise with README, .gitignore, or licence — you will push your own
4. Click **Create repository**

### 2.3 Connect Your Local Project to GitHub

Open your terminal, navigate to your project folder, and run:

```bash
cd /path/to/your/AyurAI

# Initialise git (if not already done)
git init

# Add all files (your .gitignore excludes node_modules and .env)
git add .

# Create the first commit
git commit -m "feat: initial commit — AyurHealthAI full-stack app"

# Add GitHub as the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ayurhealthai.git

# Push to GitHub
git push -u origin main
```

> **Tip:** If you see an error about `main` not found, your default branch may be called `master`. Run `git branch -M main` first to rename it.

### 2.4 Verify the Upload

Visit `https://github.com/YOUR_USERNAME/ayurhealthai` in your browser. You should see all your project files there.

### 2.5 What is in `.gitignore`

The following are automatically excluded from your repository (never uploaded):

```
node_modules/          ← all dependency folders
client/dist/           ← production build output
server/.env            ← your secrets (API keys, passwords)
.env                   ← root-level env file
*.log                  ← log files
.DS_Store              ← macOS system files
```

> ⚠️ **Security:** Your `server/.env` file contains secret keys. Never commit it to GitHub. The `.gitignore` already prevents this.

---

## 3. MongoDB Atlas Setup

MongoDB Atlas is the cloud-hosted MongoDB service used by AyurHealthAI. The free tier (M0) is sufficient for development and small-scale production.

### 3.1 Create an Atlas Account

1. Go to https://cloud.mongodb.com
2. Click **Try Free** and register with your email (or Google/GitHub SSO)
3. Verify your email address

### 3.2 Create a Free Cluster

1. After logging in, click **Build a Database**
2. Select **M0 FREE** (the free tier)
3. Choose a cloud provider and region closest to you (e.g., AWS / US East)
4. Give your cluster a name (e.g., `Cluster0`) — or leave the default
5. Click **Create** and wait 2-3 minutes for provisioning

### 3.3 Create a Database User

A database user is separate from your Atlas account login.

1. In the left sidebar, go to **Security → Database Access**
2. Click **Add New Database User**
3. Authentication method: **Password**
4. Enter a username (e.g., `ayuraiuser`) and a strong password
5. Under **Database User Privileges**, select **Atlas admin** (for development)
6. Click **Add User**

> ⚠️ **Save your password.** You will need it in the connection string.

### 3.4 Configure Network Access (IP Whitelist)

MongoDB Atlas requires you to whitelist the IP addresses that can connect to your cluster.

1. In the left sidebar, go to **Security → Network Access**
2. Click **Add IP Address**
3. For **development**: Click **Allow Access From Anywhere** → this adds `0.0.0.0/0`
4. Click **Confirm**

> **Production note:** When deploying to a hosting service (e.g., Railway), add that service's IP range, or keep `0.0.0.0/0` if Railway uses dynamic IPs (most do).

### 3.5 Get Your Connection String

1. Go to **Database → Clusters** and click **Connect** on your cluster
2. Select **Connect your application**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string — it looks like:

```
mongodb+srv://ayuraiuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with your actual database user password
6. Add your database name before the `?`:

```
mongodb+srv://ayuraiuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ayurai?retryWrites=true&w=majority
```

This full string is your `MONGO_URI`. Save it — you will paste it into `server/.env`.

### 3.6 Verify the Connection

After setting up your `.env` (Step 7), start the server and check the terminal. You should see:

```
✅  MongoDB connected: cluster0.xxxxx.mongodb.net
```

If you see `ECONNREFUSED` or `querySrv` errors, the most common cause is the IP not being whitelisted. Revisit Step 3.4.

---

## 4. Anthropic API Key

AyurHealthAI uses Claude (claude-sonnet-4-6) for AI-generated content.

1. Go to https://console.anthropic.com
2. Sign up or log in
3. In the left sidebar, click **API Keys**
4. Click **Create Key**
5. Give it a name (e.g., `ayurhealthai-dev`)
6. Copy the key — it starts with `sk-ant-...`

> ⚠️ You can only view this key once. Copy it immediately and store it somewhere safe (e.g., a password manager).

**Cost awareness:** Anthropic charges per token. The app uses `claude-sonnet-4-6` with up to 8,000 output tokens per request. Monitor your usage at https://console.anthropic.com/settings/usage.

---

## 5. Generate a JWT Secret

JSON Web Tokens are signed with a secret key. Generate a strong random one:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This outputs a 128-character hex string like:

```
a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0
```

Copy this value — it will be your `JWT_SECRET`.

> **Rule:** The JWT secret must be at least 32 characters. Longer is better. Never share it or commit it to git.

---

## 6. Clone & Install the Project

### 6.1 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ayurhealthai.git
cd ayurhealthai
```

### 6.2 Install All Dependencies

The root `package.json` includes a convenience script that installs dependencies for the root, client, and server in one command:

```bash
npm run install:all
```

This is equivalent to running:
```bash
npm install                    # root (installs concurrently)
cd client && npm install       # frontend dependencies
cd ../server && npm install    # backend dependencies
```

After completion, your folder structure should have `node_modules` inside `client/` and `server/`.

---

## 7. Configure Environment Variables

### 7.1 Copy the Template

```bash
cp server/.env.example server/.env
```

### 7.2 Fill in Your Values

Open `server/.env` in your code editor and replace all placeholder values:

```env
# ── Server ────────────────────────────────────────────────────
PORT=5001
NODE_ENV=development

# ── Database ──────────────────────────────────────────────────
# MongoDB Atlas connection string (from Step 3.5)
MONGO_URI=mongodb+srv://ayuraiuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ayurai?retryWrites=true&w=majority

# ── CORS ──────────────────────────────────────────────────────
# URL of the frontend (must match exactly — no trailing slash)
CLIENT_ORIGIN=http://localhost:5173

# ── AI ────────────────────────────────────────────────────────
# Anthropic Claude API key (from Step 4)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE

# ── Authentication ────────────────────────────────────────────
# Random secret for signing JWTs (from Step 5)
JWT_SECRET=your_128_char_hex_string_here
```

### 7.3 Double-Check

- `MONGO_URI` has your actual Atlas password (not `<password>`)
- `MONGO_URI` ends with `/ayurai?` — this is your database name
- `ANTHROPIC_API_KEY` starts with `sk-ant-`
- `JWT_SECRET` is at least 32 characters
- `CLIENT_ORIGIN` does **not** have a trailing slash

---

## 8. Run Locally

### Start Both Servers Together

From the project root:

```bash
npm run dev
```

This uses `concurrently` to start both servers simultaneously:

| Server | Port | URL |
|---|---|---|
| Express API | 5001 | http://localhost:5001 |
| Vite Dev Server | 5173 | http://localhost:5173 |

### Start Servers Separately (for debugging)

**Terminal 1 — Backend:**
```bash
npm run dev:server
# or
cd server && npm run dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev:client
# or
cd client && npm run dev
```

### How the Proxy Works

In development, the Vite dev server proxies all requests that start with `/api` to `http://localhost:5001`. This means:

- Frontend calls `api.get('/api/dashboard')` → Vite proxies to `http://localhost:5001/api/dashboard`
- No CORS issues in development
- No need for an absolute URL in frontend code

The proxy is configured in `client/vite.config.js`:

```js
server: {
  proxy: {
    '/api': 'http://localhost:5001'
  }
}
```

---

## 9. Verify Everything Works

Open http://localhost:5173 in your browser and test the following:

### ✅ Backend Health Check

```bash
curl http://localhost:5001/health
# Expected: { "status": "ok" }
```

### ✅ Database Connection

Check your server terminal for:
```
✅  MongoDB connected: cluster0.xxxxx.mongodb.net
```

### ✅ User Registration

1. Go to http://localhost:5173/signup
2. Fill in the form and submit
3. You should be redirected to the dashboard

### ✅ Dosha Quiz (Free Feature)

1. Go to http://localhost:5173/quiz
2. Complete the 20-question quiz
3. You should see a results page with your dominant dosha

### ✅ AI Feature (requires login)

1. Log in to your account
2. Go to http://localhost:5173/seasonal-guide
3. Select a season and dosha, click Generate
4. After 15-30 seconds, a complete guide should appear

If any step fails, see [Common Problems & Fixes](#10-common-problems--fixes).

---

## 10. Common Problems & Fixes

### ❌ `ECONNREFUSED` or MongoDB connection fails

**Cause:** Your IP address is not whitelisted in MongoDB Atlas.

**Fix:**
1. Go to [Atlas](https://cloud.mongodb.com) → Security → Network Access
2. Click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`)
3. Save and restart the server

---

### ❌ `401 Unauthorized` on protected pages

**Cause:** The auth token is not being sent, or it has expired.

**Fix:**
1. Log out completely (clear localStorage in DevTools → Application → Storage)
2. Log back in
3. If the issue persists, check that your server uses `requireAuth` middleware on the relevant route

---

### ❌ `Guide generation failed` on Seasonal Guide

**Cause:** The Anthropic API key may be missing, invalid, or you may have run out of credits.

**Fix:**
1. Verify `ANTHROPIC_API_KEY` in `server/.env` starts with `sk-ant-`
2. Check your Anthropic credit balance at https://console.anthropic.com
3. Restart the server after editing `.env`

---

### ❌ `Cannot find module` errors on server start

**Cause:** Dependencies are not installed.

**Fix:**
```bash
cd server && npm install
```

---

### ❌ `Port 5001 already in use`

**Cause:** Another process is using the port.

**Fix:**
```bash
# Find and kill the process (macOS/Linux)
lsof -ti:5001 | xargs kill -9

# Or change PORT in server/.env to 5002 and update vite.config.js proxy accordingly
```

---

### ❌ Vite starts but shows blank page

**Cause:** React failed to render — usually a JavaScript error.

**Fix:**
1. Open browser DevTools (F12) → Console tab
2. Look for the specific error message
3. Common cause: `api.js` base URL misconfiguration

---

### ❌ JWT errors (`JsonWebTokenError: invalid signature`)

**Cause:** The `JWT_SECRET` was changed after tokens were issued.

**Fix:** All existing tokens become invalid. Users need to log in again. This is expected and safe behaviour.

---

## Next Steps

- **Deploy to production:** See [`docs/DEPLOYMENT.md`](DEPLOYMENT.md)
- **Explore the API:** See [`docs/API.md`](API.md)
- **Understand the codebase:** See the main [`README.md`](../README.md)
