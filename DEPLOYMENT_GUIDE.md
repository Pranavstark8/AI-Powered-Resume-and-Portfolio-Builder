# 🚀 Deployment Guide: Vercel + Aiven

Deploy your Resume Builder with React frontend and Node.js backend both on Vercel, and MySQL on Aiven.

---

## ⚡ Quick Start Summary

1. **Aiven**: Create free MySQL database → Run SQL schema setup
2. **Vercel Backend**: Deploy `backend` folder → Add environment variables
3. **Vercel Frontend**: Deploy `frontend` folder → Add backend URL
4. **CORS Update**: Update backend with frontend URL → Redeploy
5. **Done!** Register and start using your app 🎉

**Total Time**: ~20-30 minutes | **Total Cost**: $0/month

---

## 📋 Prerequisites

- GitHub account (for Vercel integration)
- Vercel account (free tier)
- Aiven account (free tier - for MySQL)
- Cloudinary account (for image uploads)
- OpenAI API key

---

## 1️⃣ Deploy MySQL Database on Aiven

### Step 1: Create Aiven Account
1. Go to **https://aiven.io**
2. Sign up for a free account (get $300 free credits)

### Step 2: Create MySQL Service
1. Click **"Create Service"**
2. Select **MySQL**
3. Choose **Free Plan** (Hobbyist - $0)
4. Select a **Cloud Provider** (AWS/Google Cloud/Azure)
5. Choose **Region** (closest to your location)
6. Name your service: `resume-builder-db`
7. Click **"Create Service"** (wait 5-10 minutes)

### Step 3: Get Connection Details
Once running, go to **"Overview"** tab and copy:
- **Host** (e.g., `mysql-xxx.aivencloud.com`)
- **Port** (usually `12345`)
- **User** (usually `avnadmin`)
- **Password** (shown once, save it!)
- **Database** (default: `defaultdb`)

### Step 4: Setup Database Schema
1. Click **"Query Editor"** in Aiven dashboard
2. Or use MySQL client:
```bash
mysql -h <HOST> -P <PORT> -u avnadmin -p<PASSWORD> defaultdb
```
3. Run the setup SQL:
```sql
-- Copy contents from backend/setup_database.sql
-- Then run backend/database_schema_update.sql
```

---

## 2️⃣ Deploy Backend on Vercel

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy Backend on Vercel
1. Go to **https://vercel.com**
2. Click **"Add New Project"**
3. Click **"Import"** next to your GitHub repository
4. Configure Backend Deployment:
   - **Project Name**: `resume-builder-backend`
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **"Edit"** → Select `backend`
   - **Build Command**: Leave empty (auto-detected)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave as default (`npm install`)

> **Note**: The `backend/vercel.json` file will automatically configure the Node.js deployment.

### Step 3: Add Environment Variables
In **"Environment Variables"** section, add:

```bash
# Database (from Aiven)
DB_HOST=mysql-xxx.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb

# SSL for Aiven (required)
DB_SSL=true

# Server
PORT=5000
NODE_ENV=production

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-random-jwt-key-min-32-chars

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (add after frontend deployment)
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Step 4: Deploy Backend
1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Once deployed, copy your backend URL: `https://resume-builder-backend.vercel.app`
4. Backend will be available at: `https://resume-builder-backend.vercel.app/`

---

## 3️⃣ Deploy Frontend on Vercel

### Step 1: Deploy Frontend
1. In Vercel dashboard, click **"Add New Project"** again
2. Import the **same GitHub repository**
3. Configure Frontend Deployment:
   - **Project Name**: `resume-builder-frontend`
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click **"Edit"** → Select `frontend`
   - **Build Command**: Leave as default (`npm run build`)
   - **Output Directory**: Leave as default (`build`)
   - **Install Command**: Leave as default (`npm install`)

> **Important**: Don't add `cd frontend` to any commands - the Root Directory already handles this!

### Step 2: Add Environment Variable
In **"Environment Variables"** section:
```bash
REACT_APP_API_URL=https://resume-builder-backend-ten-gamma.vercel.app
```
(Replace with your **actual backend URL** from Step 2)

> **Critical Notes**:
> - ❌ **NO trailing slash**: Use `https://backend.vercel.app` not `https://backend.vercel.app/`
> - ❌ **NO /api suffix**: Use `https://backend.vercel.app` not `https://backend.vercel.app/api`
> - ✅ **Just the root URL**: `https://your-backend-name.vercel.app`

### Step 3: Deploy Frontend
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend is live at: `https://resume-builder-frontend.vercel.app`

### Step 4: Update Backend CORS (IMPORTANT!)
1. Go to your **backend project** in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Find `FRONTEND_URL` and update it to your **actual frontend URL**:
```bash
FRONTEND_URL=https://resume-builder-frontend-chi-five.vercel.app
```
> **⚠️ Critical**: 
> - ❌ NO trailing slash: Use `https://frontend.vercel.app` not `https://frontend.vercel.app/`
> - ✅ Copy EXACT URL from Vercel dashboard

4. Go to **"Deployments"** tab
5. Click the **3 dots (•••)** on the latest deployment
6. Click **"Redeploy"** to apply the new CORS settings
7. **Wait 2-3 minutes** for redeployment to complete

---

## 🎯 Final Setup

### Create Your Account
1. Visit: `https://resume-builder-frontend.vercel.app/register`
2. Create your account
3. Login and start building resumes!

### Test Everything
- ✅ Registration works
- ✅ Login works
- ✅ Image upload (Cloudinary)
- ✅ AI suggestions (OpenAI)
- ✅ Resume generation
- ✅ Portfolio page

---

## 🔧 Troubleshooting

### Backend shows "FUNCTION_INVOCATION_FAILED" error
This means the serverless function is crashing. Common causes:

1. **Missing Environment Variables**
   - Go to Vercel → Your Backend Project → **Settings** → **Environment Variables**
   - Verify ALL variables are set (see Step 3 in deployment guide)
   - Important: `DB_PASSWORD` not `DB_PASS`, `DB_SSL=true`
   - After adding variables, **redeploy** from Deployments tab

2. **Database Connection Issues**
   - Check Aiven database is running (green status)
   - Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` are correct
   - Ensure `DB_SSL=true` is set

3. **Check Logs**
   - Go to **Deployments** → Click deployment → **Runtime Logs**
   - Look for specific error messages

### Backend won't start
- Check that `ROOT_DIRECTORY` is set to `backend`
- Verify `backend/api/index.js` exists
- Check `backend/vercel.json` configuration is present

### Frontend can't connect to backend (CORS errors)
**Error**: "blocked by CORS policy" or "Redirect is not allowed for a preflight request"

**Solutions**:

1. **Check for Double Slashes in URL**
   - ❌ Wrong: `https://backend.vercel.app//api/auth/register` (notice `//`)
   - ✅ Correct: `https://backend.vercel.app/api/auth/register`
   - **Fix**: Remove trailing slash from `REACT_APP_API_URL` in frontend env variables

2. **Verify CORS Configuration**
   - Go to **Backend Project** → **Settings** → **Environment Variables**
   - Check `FRONTEND_URL` exactly matches your frontend URL
   - ❌ Wrong: `https://frontend.vercel.app/` (has trailing slash)
   - ✅ Correct: `https://frontend.vercel.app`
   - After fixing, **redeploy backend**

3. **Check Both URLs**
   - Both `REACT_APP_API_URL` and `FRONTEND_URL` should have NO trailing slashes
   - Both should use `https://` in production
   - Use exact URLs from Vercel dashboard

4. **Clear Browser Cache**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito mode

5. **Check Logs**
   - Backend logs: Vercel → Backend Project → Deployments → Click deployment → Logs
   - Frontend console: Press F12 in browser → Console tab

### Database connection failed

**Error**: "self-signed certificate in certificate chain" or "HANDSHAKE_SSL_ERROR"

**Solution**: This is fixed in the code! Just redeploy your backend. The SSL configuration now accepts Aiven's certificates.

**Other database issues**:
- Ensure `DB_SSL=true` is set in backend environment variables
- Verify Aiven credentials are correct (no extra spaces)
- Check if Aiven service is running (green status)
- Test connection in MySQL Workbench first
- Verify `DB_PASSWORD` (not `DB_PASS`) is set correctly

### Image upload fails
- Verify Cloudinary credentials in backend environment variables
- Check Cloudinary dashboard for quota limits
- Ensure file size is under 10MB

### "Cannot GET /api/auth/login" error
- Backend might not be running - check Vercel backend deployment status
- Verify backend URL in frontend environment variables is correct
- Check backend logs for startup errors

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** (Frontend) | Hobby (Free) | $0/month |
| **Vercel** (Backend) | Hobby (Free) | $0/month |
| **Aiven** | Hobbyist MySQL | $0/month ($300 credits) |
| **Cloudinary** | Free Tier | $0/month (25GB bandwidth) |
| **Total** | | **$0/month** 🎉 |

---

## 📝 Important Notes

1. **Two Separate Projects**: Frontend and backend are deployed as separate Vercel projects from the same repo.
2. **Root Directory Setting**: Always set the correct Root Directory (frontend or backend) in Vercel dashboard.
3. **No Root vercel.json**: The root `vercel.json` is not needed - only `backend/vercel.json` is used.
4. **Database Backups**: Aiven auto-backups on paid plans. For free tier, export data regularly.
5. **SSL Required**: Aiven requires SSL. The app already handles this with `DB_SSL=true`.
6. **Environment Variables**: Never commit `.env` files to GitHub!
7. **Auto-Deploy**: Vercel auto-deploys on git push to main branch.
8. **Custom Domain**: Add custom domain in Vercel settings (optional).
9. **Serverless Functions**: Vercel runs Node.js as serverless functions, so your backend scales automatically.

---

## 🎉 Done!

Your Resume Builder is now live on:
- **Frontend**: https://resume-builder-frontend.vercel.app
- **Backend**: https://resume-builder-backend.vercel.app
- **Database**: Managed by Aiven ✅

Both frontend and backend are hosted on Vercel for maximum performance and zero cost! 🚀

### Quick Links:
- 📊 **Vercel Dashboard**: https://vercel.com/dashboard
- 🗄️ **Aiven Dashboard**: https://console.aiven.io
- 📸 **Cloudinary Dashboard**: https://cloudinary.com/console

Share it with the world! 🎉

