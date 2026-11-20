# Deployment Guide - Access from Your iPhone

This guide will help you deploy your YouTube Video Clipper so you can use it from any device, including your iPhone.

## 🚀 Easiest Option: Railway (Recommended)

Railway is the easiest way to deploy this app because it supports all the tools we need (yt-dlp and ffmpeg).

### Steps:

1. **Create a Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (it's free)

2. **Deploy from GitHub**
   - First, push this code to GitHub:
     ```bash
     # Create a new GitHub repo, then:
     git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO.git
     git push github main
     ```
   
   - In Railway:
     - Click "New Project"
     - Select "Deploy from GitHub repo"
     - Choose your repository
     - Railway will automatically detect the Dockerfile and deploy!

3. **Get Your URL**
   - Once deployed, Railway will give you a public URL
   - Save this URL on your iPhone
   - Access it anytime from Safari or any browser!

### Railway Free Tier:
- $5 free credit per month
- Enough for hundreds of clips
- No credit card required to start

---

## 🔄 Alternative: Render

Render also works great and has a generous free tier.

### Steps:

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: youtube-clipper
     - **Environment**: Docker
     - **Instance Type**: Free
   - Click "Create Web Service"

3. **Access Your App**
   - Render will build and deploy
   - You'll get a URL like: `https://youtube-clipper.onrender.com`
   - Use this from your iPhone!

### Render Free Tier:
- Completely free
- App sleeps after 15 min of inactivity
- Takes 30 seconds to wake up on first request

---

## 📱 Using on Your iPhone

Once deployed:

1. **Save to Home Screen** (makes it feel like an app!)
   - Open the URL in Safari
   - Tap the Share button
   - Select "Add to Home Screen"
   - Now it's like a native app!

2. **Create Clips**
   - Paste YouTube URLs
   - Set your time ranges
   - Download clips directly to your iPhone
   - Upload to Instagram from your phone!

---

## 💰 Cost Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Railway** | $5/month credit | Best for regular use |
| **Render** | Unlimited (with sleep) | Occasional use |

---

## 🔧 If You Need Help

Both platforms have excellent documentation:
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)

The Dockerfile included in this project handles all the technical setup automatically!

---

## 🎉 That's It!

Once deployed, you can:
- ✅ Access from any device (iPhone, iPad, laptop)
- ✅ Share the URL with friends
- ✅ No need to keep your computer running
- ✅ Professional, always-available service
