# Render Environment Variables Configuration

## Important: Set These in Render Dashboard

Since Render doesn't automatically read `.env.production` files, you **MUST** set these environment variables in your Render service dashboard.

### Frontend Service Environment Variables

Go to your frontend service on Render → Environment → Add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://vehicle-flow-backend.onrender.com` |
| `VITE_WS_URL` | `wss://vehicle-flow-backend.onrender.com/ws/metrics` |

⚠️ **Important**: 
- Do NOT include `/api/v1` in `VITE_API_URL` - the code adds it automatically
- Replace `vehicle-flow-backend` with your actual backend service name

### How to Set Environment Variables in Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **frontend** service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each variable from the table above
6. Click **Save Changes**
7. Render will automatically redeploy with the new variables

### Backend Service Environment Variables

Your backend service also needs CORS configuration. Set in backend Environment:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://vehicle-flow.onrender.com,http://localhost:3000,*` |

Replace `vehicle-flow` with your actual frontend service name.

## Why This is Necessary

- Vite environment variables must be set at **build time**
- Render builds your app on their servers
- `.env.production` files are NOT read during Render builds
- You must set environment variables through Render's dashboard

## Verification

After setting the variables and redeploying, check the browser console:
- ✅ API calls should go to `https://vehicle-flow-backend.onrender.com/api/v1/...`
- ✅ WebSocket should connect to `wss://vehicle-flow-backend.onrender.com/ws/metrics`
- ❌ No more `localhost:8000` URLs
