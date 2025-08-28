# 🚀 Deploy Backend to Render - Complete Guide

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster for production database
3. **Stripe Account**: If using payments, set up Stripe production keys
4. **Render Account**: Sign up at [render.com](https://render.com)

## 🔧 Step 1: Prepare Your Code

### 1.1 Build Your Project Locally
```bash
npm run build
```

### 1.2 Test the Build
```bash
npm start
```

### 1.3 Commit and Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🌐 Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (M0 Free tier works for development)
3. Set up database access (username/password)
4. Set up network access (allow from anywhere: 0.0.0.0/0)

### 2.2 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `virtual_support`

**Example:**
```
mongodb+srv://username:password@cluster.mongodb.net/virtual_support?retryWrites=true&w=majority
```

## 🎯 Step 3: Deploy to Render

### 3.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository with your backend code

### 3.2 Configure the Service

**Basic Settings:**
- **Name**: `virtual-support-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (if code is in root)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3.3 Set Environment Variables

Click "Environment" tab and add these variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port for the service |
| `MONGO_URI` | `your_mongodb_atlas_connection_string` | Database connection |
| `JWT_SECRET` | `your_super_secure_jwt_secret` | JWT signing secret |
| `CORS_ORIGIN` | `https://your-frontend-domain.onrender.com` | Frontend URL |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe production key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook secret |

### 3.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for the build to complete (usually 2-5 minutes)

## 🔍 Step 4: Verify Deployment

### 4.1 Check Service Status
- Green status means your service is running
- Click on your service URL to test

### 4.2 Test Your API Endpoints
```bash
# Test health check
curl https://your-service-name.onrender.com/api/health

# Test authentication
curl https://your-service-name.onrender.com/api/auth/register
```

### 4.3 Check Logs
- Go to "Logs" tab in Render dashboard
- Look for any errors or warnings

## 🔧 Step 5: Update Frontend Configuration

### 5.1 Update API Base URL
In your frontend, update the API base URL:

```typescript
// src/config/api.ts
export const API_BASE_URL = 'https://your-service-name.onrender.com/api';
```

### 5.2 Update CORS Settings
Make sure your backend CORS settings allow your frontend domain:

```typescript
// src/server.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-domain.onrender.com',
  credentials: true
}));
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check if all dependencies are in `package.json`
   - Ensure TypeScript compilation works locally

2. **Service Won't Start**
   - Check environment variables are set correctly
   - Verify MongoDB connection string
   - Check logs for specific error messages

3. **CORS Errors**
   - Ensure `CORS_ORIGIN` is set correctly
   - Check if frontend URL is allowed

4. **Database Connection Issues**
   - Verify MongoDB Atlas network access
   - Check username/password in connection string
   - Ensure database name is correct

### Debug Commands:
```bash
# Check build locally
npm run build

# Test start command
npm start

# Check environment variables
echo $NODE_ENV
echo $MONGO_URI
```

## 📊 Monitoring & Maintenance

### 1. **Auto-Deploy**
- Render automatically redeploys when you push to GitHub
- You can disable this in settings if needed

### 2. **Scaling**
- Free tier: 750 hours/month
- Paid plans: Unlimited hours, better performance

### 3. **Custom Domains**
- Add custom domain in Render dashboard
- Configure DNS records with your domain provider

### 4. **SSL Certificates**
- Render provides free SSL certificates automatically
- HTTPS is enabled by default

## 🎉 Success!

Your backend is now deployed and accessible at:
```
https://your-service-name.onrender.com
```

**Next Steps:**
1. Test all API endpoints
2. Update frontend to use production API
3. Set up monitoring and alerts
4. Configure custom domain (optional)

## 📞 Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **GitHub Issues**: Create issues in your repository for code-specific problems

