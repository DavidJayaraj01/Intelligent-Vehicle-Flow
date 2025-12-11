# 🚀 Complete Render Deployment Guide - Vehicle Flow Analyzer

## 📊 Project Analysis Summary

### Current Project Structure
```
vehicle-flow-analyzer/
├── backend/              # FastAPI Python application
│   ├── app/             # Main application code
│   ├── weights/yolo/    # ✅ Model files (organized)
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Container configuration
├── frontend/            # React + TypeScript application
│   ├── src/            # Source code
│   ├── package.json    # Node dependencies
│   └── Dockerfile      # Multi-stage build
├── database/           # PostgreSQL schema
│   └── schema.sql      # Database setup
└── TPHYolov5/         # Additional YOLO models (optional)
```

### Services to Deploy
1. ✅ **PostgreSQL Database** - Already running on Render
2. 🔄 **Backend API** - FastAPI application (needs deployment)
3. 🔄 **Frontend** - React SPA (needs deployment)

---

## ⚠️ PRE-DEPLOYMENT CHECKLIST

### Step 1: Clean Up Model Files

You have duplicate model files. Let's organize them:

**Current model locations:**
```
❌ vehicle-flow-analyzer/best_emergency_model.pt (duplicate)
❌ vehicle-flow-analyzer/backend/yolov8n.pt (duplicate)
✅ vehicle-flow-analyzer/backend/weights/yolo/yolov8n.pt (keep)
✅ vehicle-flow-analyzer/backend/weights/yolo/best_emergency_model.pt (keep)
```

**Action Required:**
```bash
# Delete duplicate files (run from project root)
Remove-Item "best_emergency_model.pt"
Remove-Item "backend\yolov8n.pt"
```

### Step 2: Verify .gitignore

Your `.gitignore` needs to include model files if they're large:

```gitignore
# Add to .gitignore if models are large (>100MB)
*.pt
!backend/weights/yolo/*.pt  # Allow specific models
```

**Note:** If models are <100MB, you can commit them. Otherwise, you'll need to use Render Disk storage.

### Step 3: Update Environment Variables

Check your `.env` file has correct values:

```bash
# backend/.env
DATABASE_URL=postgresql://david:Rcs9t2T9jc1vlkCNS3hgCq1fZLYr8VDM@dpg-d4t7jdk9c44c73bhr4vg-a.singapore-postgres.render.com/traffic_5am6
REDIS_URL=redis://localhost:6379/0
YOLO_MODEL_PATH=weights/yolo/yolov8n.pt
EMERGENCY_MODEL_PATH=weights/yolo/best_emergency_model.pt
```

---

## 📋 DEPLOYMENT STEPS

## Phase 1: Prepare Git Repository (15 minutes)

### 1.1 Initialize Git (if not done)
```bash
cd c:\Users\david\Desktop\BI3\vehicle-flow-analyzer
git init
```

### 1.2 Add and Commit Files
```bash
# Add all files
git add .

# Review what will be committed
git status

# Commit
git commit -m "Initial commit: Vehicle Flow Analyzer for Render deployment"
```

### 1.3 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `vehicle-flow-analyzer`
3. Description: "Real-time vehicle tracking and traffic flow analysis system"
4. **Important:** Do NOT add README, .gitignore, or license (we have them)
5. Click "Create repository"

### 1.4 Push to GitHub
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/vehicle-flow-analyzer.git

# Push code
git branch -M main
git push -u origin main
```

**Checkpoint:** ✅ Code is now on GitHub

---

## Phase 2: Deploy Backend (20 minutes)

### 2.1 Create Backend Web Service

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect Repository"**
4. **Grant GitHub Access** if prompted
5. Select **`vehicle-flow-analyzer`** repository

### 2.2 Configure Backend Service

Fill in the following configuration:

| Setting | Value |
|---------|-------|
| **Name** | `vehicle-flow-backend` |
| **Region** | `Singapore` (same as your database) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ **CRITICAL** |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` (or `Starter` $7/month for better performance) |

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```bash
# Database Connection
DATABASE_URL=postgresql://david:Rcs9t2T9jc1vlkCNS3hgCq1fZLYr8VDM@dpg-d4t7jdk9c44c73bhr4vg-a.singapore-postgres.render.com/traffic_5am6

# Redis (optional for now)
REDIS_URL=redis://localhost:6379/0

# Model Paths
YOLO_MODEL_PATH=weights/yolo/yolov8n.pt
EMERGENCY_MODEL_PATH=weights/yolo/best_emergency_model.pt

# Python Configuration
PYTHONUNBUFFERED=1
PORT=8000

# Security
API_KEY_SECRET=vfa-secret-key-production-2024

# CORS (we'll update this after frontend deployment)
CORS_ORIGINS=*
```

### 2.4 Deploy Backend

1. Click **"Create Web Service"**
2. **Wait for build** (5-10 minutes first time)
   - Watch build logs in real-time
   - Look for "Build successful" message
3. **Copy your backend URL:** `https://vehicle-flow-backend-XXXX.onrender.com`

### 2.5 Verify Backend Deployment

Test these endpoints:

```bash
# Health check
https://vehicle-flow-backend-XXXX.onrender.com/health

# API Documentation
https://vehicle-flow-backend-XXXX.onrender.com/docs

# List events
https://vehicle-flow-backend-XXXX.onrender.com/api/v1/events/
```

**Expected Response:**
- Health: `{"status": "healthy"}`
- Docs: Interactive Swagger UI
- Events: JSON array (may be empty)

**Checkpoint:** ✅ Backend is live and responding

---

## Phase 3: Deploy Frontend (15 minutes)

### 3.1 Update Frontend Environment

Before deploying, update the frontend to point to your backend:

```bash
# Create frontend/.env.production (if it doesn't exist)
VITE_API_URL=https://vehicle-flow-backend-XXXX.onrender.com/api/v1
```

**⚠️ Replace `XXXX` with your actual backend URL from Step 2.4**

Commit this change:
```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push
```

### 3.2 Create Frontend Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Select **`vehicle-flow-analyzer`** repository

### 3.3 Configure Frontend Service

| Setting | Value |
|---------|-------|
| **Name** | `vehicle-flow-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` ⚠️ **CRITICAL** |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3.4 Add Frontend Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

```bash
# Backend API URL (use YOUR backend URL)
VITE_API_URL=https://vehicle-flow-backend-XXXX.onrender.com/api/v1

# Node version
NODE_VERSION=18
```

### 3.5 Deploy Frontend

1. Click **"Create Static Site"**
2. **Wait for build** (3-5 minutes)
3. **Copy your frontend URL:** `https://vehicle-flow-frontend-XXXX.onrender.com`

**Checkpoint:** ✅ Frontend is live

---

## Phase 4: Configure CORS & Security (5 minutes)

### 4.1 Update Backend CORS

Now that you have your frontend URL, update backend CORS:

1. Go to your **backend service** in Render Dashboard
2. Click **"Environment"** tab
3. Find `CORS_ORIGINS` variable
4. Update value to:
   ```
   https://vehicle-flow-frontend-XXXX.onrender.com
   ```
5. Click **"Save Changes"**
6. **Service will auto-redeploy**

### 4.2 Test Integration

Visit your frontend: `https://vehicle-flow-frontend-XXXX.onrender.com`

Test these features:
- ✅ Dashboard loads
- ✅ Upload page works
- ✅ Can upload video/image
- ✅ Queue Detection runs
- ✅ Emergency Detection runs
- ✅ Analytics shows data
- ✅ Reports can be exported

**Checkpoint:** ✅ Full application is working

---

## 🔍 TROUBLESHOOTING GUIDE

### Backend Issues

#### Problem: "Module not found" error
**Solution:**
- Check `Root Directory` is set to `backend`
- Verify all imports use relative paths from `app/`

#### Problem: "Can't connect to database"
**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check database is in same region (Singapore)
3. Test database connection:
   ```bash
   # In backend service logs, look for:
   "Database initialized successfully"
   ```

#### Problem: "Model file not found"
**Solutions:**
1. Check models are in `backend/weights/yolo/`:
   - `yolov8n.pt`
   - `best_emergency_model.pt`
2. Verify environment variables:
   ```bash
   YOLO_MODEL_PATH=weights/yolo/yolov8n.pt
   EMERGENCY_MODEL_PATH=weights/yolo/best_emergency_model.pt
   ```
3. If models are in `.gitignore`, use Render Disk storage (see Advanced section)

#### Problem: Build fails with "torch" error
**Solution:**
- Render free tier may have memory limitations
- Consider upgrading to Starter plan ($7/month)
- Or reduce torch version in requirements.txt

### Frontend Issues

#### Problem: Blank page after deployment
**Solutions:**
1. Check browser console (F12) for errors
2. Verify `VITE_API_URL` points to correct backend
3. Check CORS is configured correctly
4. Test API endpoint directly in browser

#### Problem: API calls fail with CORS error
**Solutions:**
1. Update backend `CORS_ORIGINS` with exact frontend URL
2. Don't include trailing slash in URL
3. Restart backend service after changing CORS

#### Problem: "404 on routes" (Direct URL access fails)
**Solution:**
- This is normal for Render static sites
- React Router handles navigation
- Accessing routes directly works from within the app

### Database Issues

#### Problem: "No data showing" in Analytics
**Solution:**
Upload some videos/images to generate data, or run seed script:
```bash
# Connect to backend via SSH (if available) or use API
POST /api/v1/queue/detect
POST /api/v1/emergency/detect
```

---

## 🚀 ADVANCED CONFIGURATION

### Option 1: Handle Large Model Files

If your model files are >100MB:

**Method A: Git LFS**
```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "*.pt"
git add .gitattributes
git commit -m "Add Git LFS for model files"
git push
```

**Method B: Render Disk Storage**
1. In backend service, click **"Disks"**
2. **Add Disk:**
   - Name: `model-weights`
   - Mount Path: `/app/weights`
   - Size: 1GB
3. **Upload models** to disk via deploy script
4. Models persist across deployments

### Option 2: Custom Domain

1. Go to service → **"Settings"** → **"Custom Domains"**
2. Add your domain: `app.yourcompany.com`
3. Update DNS records as shown
4. SSL certificate auto-provisioned

### Option 3: Monitoring & Alerts

**Enable Notifications:**
1. Service → **"Settings"** → **"Notifications"**
2. Add email or Slack webhook
3. Get alerts for:
   - Deploy failures
   - Service downtime
   - High memory usage

**Use External Monitoring:**
- Sentry for error tracking
- LogRocket for session replay
- UptimeRobot for uptime monitoring

### Option 4: Auto-Deploy on Push

**Already enabled by default!**

Every push to `main` branch will:
1. Trigger build
2. Run tests (if configured)
3. Deploy automatically

**To disable:**
Service → **"Settings"** → **"Auto-Deploy"** → OFF

---

## 📊 COST ESTIMATION

### Free Tier (Current Setup)
- ✅ Backend Web Service: **FREE**
- ✅ Frontend Static Site: **FREE**
- ✅ PostgreSQL Database: **FREE**
- **Total: $0/month**

**Limitations:**
- Services spin down after 15 min inactivity
- 750 hours/month free usage
- Limited RAM (512MB backend, 256MB frontend)
- No custom domains on static sites

### Paid Tier (Recommended for Production)
- Backend (Starter): **$7/month**
  - Always on
  - 512MB RAM
  - Better performance
- Frontend (Free): **$0/month**
- Database (Starter): **$7/month**
  - 256MB RAM, 1GB storage
  - Daily backups
- **Total: $14/month**

---

## ✅ POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] Backend URL accessible: `https://vehicle-flow-backend-XXXX.onrender.com`
- [ ] Frontend URL accessible: `https://vehicle-flow-frontend-XXXX.onrender.com`
- [ ] API docs working: `/docs`
- [ ] Database connected (check logs)
- [ ] Upload functionality works
- [ ] Queue detection processes videos
- [ ] Emergency detection works
- [ ] Analytics displays data
- [ ] Reports export correctly
- [ ] CORS configured properly
- [ ] Environment variables set
- [ ] Models loaded successfully

---

## 📞 SUPPORT RESOURCES

- **Render Documentation:** https://render.com/docs
- **Render Community:** https://community.render.com
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React + Vite:** https://vitejs.dev
- **Your Database:** Singapore PostgreSQL instance

---

## 🎯 QUICK REFERENCE

### Your Service URLs (Update after deployment)

```
Backend API: https://vehicle-flow-backend-XXXX.onrender.com
Frontend: https://vehicle-flow-frontend-XXXX.onrender.com
API Docs: https://vehicle-flow-backend-XXXX.onrender.com/docs
Database: dpg-d4t7jdk9c44c73bhr4vg-a.singapore-postgres.render.com
```

### Common Commands

```bash
# Local development
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev

# Git operations
git add .
git commit -m "message"
git push

# Check model files
Get-ChildItem backend\weights\yolo -Recurse

# Test backend locally
curl http://localhost:8000/health
```

---

## 🎉 DEPLOYMENT COMPLETE!

Your Vehicle Flow Analyzer is now live on Render!

**Next Steps:**
1. Share URLs with your team
2. Set up monitoring
3. Configure custom domain (optional)
4. Add more vehicle detection data
5. Monitor performance and scale as needed

**Estimated Total Time:** ~55 minutes
- Git setup: 15 min
- Backend deploy: 20 min
- Frontend deploy: 15 min
- Configuration: 5 min

Good luck with your deployment! 🚗📊
