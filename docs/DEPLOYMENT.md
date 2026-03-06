# 🚀 Deployment Guide

> This guide covers deploying AyurHealthAI to production using the recommended stack:
>
> - **Frontend:** [Vercel](https://vercel.com) (free tier)
> - **Backend:** [Railway](https://railway.app) (free tier / $5 hobby plan)
> - **Database:** [MongoDB Atlas](https://cloud.mongodb.com) (free M0 cluster)

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Deploy the Backend to Railway](#2-deploy-the-backend-to-railway)
3. [Deploy the Frontend to Vercel](#3-deploy-the-frontend-to-vercel)
4. [Connect Frontend ↔ Backend](#4-connect-frontend--backend)
5. [MongoDB Atlas for Production](#5-mongodb-atlas-for-production)
6. [Post-Deployment Verification](#6-post-deployment-verification)
7. [Custom Domain (Optional)](#7-custom-domain-optional)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Pre-Deployment Checklist

Before deploying, ensure the following are in place:

- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Anthropic API key is valid and has sufficient credits
- [ ] A strong JWT secret is generated
- [ ] `server/.env` is **not** committed to GitHub (verify with `git status`)
- [ ] The app runs successfully in local development (`npm run dev`)

---

## 2. Deploy the Backend to Railway

Railway automatically deploys your Node.js backend from GitHub with zero configuration.

### 2.1 Create a Railway Account

1. Go to https://railway.app
2. Click **Login** → **Login with GitHub**
3. Authorise Railway to access your GitHub account

### 2.2 Create a New Project

1. On the Railway dashboard, click **New Project**
2. Select **Deploy from GitHub repo**
3. Find and select your `ayurhealthai` repository
4. When prompted "Which directory?", select **`server`**
   - Alternatively, Railway will detect it automatically since `server/package.json` exists

### 2.3 Configure the Start Command

Railway needs to know how to start your server. It should auto-detect `npm start` from `server/package.json`, which runs `node server.js`.

If not detected automatically:
1. Go to your Railway service → **Settings** → **Deploy**
2. Set **Start Command:** `node server.js`
3. Set **Root Directory:** `server`

### 2.4 Set Environment Variables

1. In Railway, go to your service → **Variables** tab
2. Click **New Variable** and add each one:

| Key | Value |
|---|---|
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `CLIENT_ORIGIN` | Your Vercel frontend URL (add after Step 3) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `JWT_SECRET` | Your 128-character JWT secret |

> **Note:** `CLIENT_ORIGIN` should be your production Vercel URL (e.g., `https://ayurhealthai.vercel.app`). If you do not have it yet, set it after deploying the frontend.

### 2.5 Trigger a Deployment

Railway automatically deploys when you push to GitHub. To manually trigger:
1. Go to **Deployments** tab
2. Click **Deploy Now** → select your branch (usually `main`)

### 2.6 Get Your Backend URL

After a successful deployment:
1. Go to your Railway service → **Settings** → **Networking**
2. Click **Generate Domain**
3. Railway assigns a URL like: `https://ayurhealthai-production.up.railway.app`

**Save this URL** — you will need it for the frontend configuration.

### 2.7 Verify the Backend

Open your browser and visit:

```
https://your-railway-url.railway.app/health
```

You should see:

```json
{ "status": "ok", "timestamp": "..." }
```

---

## 3. Deploy the Frontend to Vercel

### 3.1 Create a Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Authorise Vercel to access your repositories

### 3.2 Import Your Repository

1. On the Vercel dashboard, click **Add New → Project**
2. Find your `ayurhealthai` repository and click **Import**
3. Configure the project:
   - **Framework Preset:** Vite (should be auto-detected)
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Do not deploy yet** — set environment variables first

### 3.3 Set Environment Variables

Before clicking Deploy, go to **Environment Variables** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | Your Railway backend URL (e.g., `https://ayurhealthai-production.up.railway.app`) |

> **Important:** In production, the Vite proxy does not run. The frontend calls the backend directly using `VITE_API_URL`. This is used in `client/src/api.js`:
> ```js
> const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' })
> ```

### 3.4 Deploy

Click **Deploy**. Vercel will:
1. Clone your repository
2. Run `npm install` in the `client` directory
3. Run `vite build`
4. Serve the `dist` folder on a CDN

After deployment, you get a URL like: `https://ayurhealthai.vercel.app`

---

## 4. Connect Frontend ↔ Backend

Now that both are deployed, update the CORS setting in your backend.

### 4.1 Update `CLIENT_ORIGIN` on Railway

1. Go to Railway → Your service → **Variables**
2. Update `CLIENT_ORIGIN` to your Vercel URL:
   ```
   CLIENT_ORIGIN=https://ayurhealthai.vercel.app
   ```
3. Railway will automatically redeploy with the new variable

### 4.2 Verify CORS

Open your browser DevTools → Network tab, visit your Vercel app, and trigger any API request. You should not see CORS errors.

---

## 5. MongoDB Atlas for Production

### 5.1 Whitelist Railway's IPs

Railway uses dynamic IP addresses. The simplest approach is to allow all IPs:

1. In MongoDB Atlas → **Security → Network Access**
2. Click **Add IP Address**
3. Enter `0.0.0.0/0` (Allow Access from Anywhere)
4. Click **Confirm**

> For tighter security, use Railway's static IP feature (available on Pro plans) and whitelist only those IPs.

### 5.2 Use a Production Database Name

Your connection string includes the database name (e.g., `/ayurai`). You can use a separate database for production:

```
mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/ayurai_prod?retryWrites=true&w=majority
```

### 5.3 Monitor Usage

In MongoDB Atlas → **Monitoring**, you can track:
- Active connections
- Query performance
- Data storage usage

The free M0 tier allows up to 512 MB of data and 500 connections.

---

## 6. Post-Deployment Verification

Test the following after deploying:

### Backend Tests

```bash
# Health check
curl https://your-railway-url.railway.app/health

# Test user registration
curl -X POST https://your-railway-url.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend Tests

1. **Visit:** `https://ayurhealthai.vercel.app`
2. **Sign up** with a new account — should redirect to dashboard
3. **Take the Dosha Quiz** — should complete and show results
4. **Generate a Seasonal Guide** — should load within 30 seconds
5. **Save a seasonal plan** — should appear in dashboard

### Checklist

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Login and logout work
- [ ] JWT persists across page refreshes
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Dosha Quiz submits and shows results
- [ ] Seasonal Guide generates successfully
- [ ] Recipe Finder generates recipes
- [ ] Food Compatibility checker works
- [ ] Dashboard shows correct user data

---

## 7. Custom Domain (Optional)

### Frontend (Vercel)

1. In Vercel → Your project → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `ayurhealthai.com`)
4. Follow the DNS configuration instructions (usually adding a CNAME record)

### Backend (Railway)

1. In Railway → Your service → **Settings → Networking**
2. Click **Custom Domain**
3. Enter your subdomain (e.g., `api.ayurhealthai.com`)
4. Add the CNAME record in your DNS provider

After setting up a custom domain for the backend, update:
- `VITE_API_URL` in Vercel to `https://api.ayurhealthai.com`
- `CLIENT_ORIGIN` in Railway to `https://ayurhealthai.com`

---

## 8. Environment Variables Reference

### Server (Railway) — Production Values

```env
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/ayurai_prod?retryWrites=true&w=majority
CLIENT_ORIGIN=https://ayurhealthai.vercel.app
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
JWT_SECRET=your_128_character_hex_secret
```

### Client (Vercel) — Production Values

```env
VITE_API_URL=https://your-railway-app.up.railway.app
```

---

## 9. Troubleshooting

### ❌ Railway build fails: `Cannot find module`

**Cause:** Root directory not set correctly.

**Fix:**
- Railway → Service → Settings → **Root Directory** → set to `server`
- Or add a `railway.toml` in the `server` folder:
  ```toml
  [build]
  builder = "nixpacks"

  [deploy]
  startCommand = "node server.js"
  ```

---

### ❌ Vercel build fails: `vite: command not found`

**Cause:** Root directory not set to `client`.

**Fix:**
- Vercel → Project → Settings → **Root Directory** → set to `client`

---

### ❌ CORS errors in production

**Cause:** `CLIENT_ORIGIN` on Railway does not match the exact Vercel URL.

**Fix:** Check that `CLIENT_ORIGIN` in Railway matches exactly (no trailing slash):
```
CLIENT_ORIGIN=https://ayurhealthai.vercel.app   ✅
CLIENT_ORIGIN=https://ayurhealthai.vercel.app/  ❌ (trailing slash)
```

---

### ❌ API calls return 404 in production

**Cause:** `VITE_API_URL` is missing or incorrect in Vercel.

**Fix:**
1. Vercel → Project → Settings → **Environment Variables**
2. Verify `VITE_API_URL` = your full Railway backend URL (with `https://`, without trailing slash)
3. Redeploy: Vercel → **Deployments** → Redeploy

---

### ❌ AI features work locally but fail in production

**Cause:** `ANTHROPIC_API_KEY` not set in Railway.

**Fix:**
1. Railway → Service → **Variables**
2. Add `ANTHROPIC_API_KEY` with your actual key
3. Redeploy

---

### ❌ `MongoServerError: bad auth` in Railway logs

**Cause:** MongoDB password in `MONGO_URI` contains special characters that need URL-encoding.

**Fix:** URL-encode the password. For example, if your password is `p@ss#word`, encode it:
- `@` → `%40`
- `#` → `%23`

Result: `mongodb+srv://user:p%40ss%23word@cluster0.xxxx.mongodb.net/ayurai`

---

### ❌ JWT errors after redeployment

**Cause:** `JWT_SECRET` changed between deployments.

**Fix:** All existing tokens become invalid (users must log in again). This is expected. Ensure `JWT_SECRET` is consistent across all deployments by keeping it in Railway's variables.

---

## Alternative Hosting Options

| Service | Best For | Notes |
|---|---|---|
| **Render** | Backend | Similar to Railway, free tier available |
| **Fly.io** | Backend | More control, excellent performance |
| **Netlify** | Frontend | Alternative to Vercel |
| **AWS EC2** | Full control | Advanced, requires DevOps knowledge |
| **DigitalOcean App Platform** | Both | Simple, $5-12/month |

---

## Cost Estimate

| Service | Free Tier | Paid |
|---|---|---|
| MongoDB Atlas | M0 (512 MB) | M2 $9/month (2 GB) |
| Railway | $5 credit/month | $5/month Hobby plan |
| Vercel | 100 GB bandwidth | Pro $20/month |
| Anthropic | $5 initial credit | Pay-as-you-go |

**Total monthly cost for a small production app:** ~$0-15/month
